import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { PrinterStatus, PrinterSettings, PrintJob } from '@/types'
import { validator, validateIPAddress, validatePort } from '@/utils/nasa-validators'
import { safeForEach } from '@/utils/safe-loops'
import { APP_CONFIG } from '@/types'
import { useFeatureToggle } from '@/composables/useFeatureToggle'
import { safeTauriInvoke, isTauriEnvironment } from '@/utils/tauri-guard'

// NASA JPL: Tauri integration is handled by tauri-guard utility

export const usePrintersStore = defineStore('printers', () => {
  // NASA JPL: Bounded collections
  const printers = ref<PrinterStatus[]>([])
  const activePrintJob = ref<PrintJob | null>(null)
  const printQueue = ref<PrintJob[]>([])
  
  // NASA JPL: Polling management with timeout
  const pollingInterval = ref<ReturnType<typeof setInterval> | null>(null)
  const maxPollingDuration = 30 * 60 * 1000 // 30 minutes max
  const pollingStartTime = ref<number>(0)
  
  // NASA JPL: Computed properties
  const availablePrinters = computed(() => 
    printers.value.filter(p => p.status === 'idle')
  )
  
  const activePrinters = computed(() =>
    printers.value.filter(p => p.status === 'active')
  )
  
  const printerStatuses = computed(() =>
    printers.value.map(p => p.status)
  )
  
  // NASA JPL: Load printer status with error handling
  async function loadPrinterStatus(): Promise<void> {
    try {
      if (isTauriEnvironment()) {
        const mockData = createMockPrinterStatus()
        const result = await safeTauriInvoke<PrinterStatus[]>('get_printer_status', undefined, mockData)
        
        // NASA JPL: Validate array bounds
        if (Array.isArray(result) && result.length <= APP_CONFIG.max_printers) {
          printers.value = result
        } else {
          console.warn('Printer data exceeds maximum allowed printers')
          printers.value = mockData
        }
      } else {
        // Running in browser without Tauri
        console.warn('Running without Tauri - using mock data')
        printers.value = createMockPrinterStatus()
      }
    } catch (error) {
      console.error('Failed to load printer status:', error)
      printers.value = createMockPrinterStatus()
    }
  }
  
  // NASA JPL: Update printer settings with validation
  async function updatePrinterSettings(printerId: string, settings: PrinterSettings): Promise<boolean> {
    try {
      // NASA JPL: Input validation
      if (!printerId || typeof printerId !== 'string') {
        console.error('Invalid printer ID provided')
        return false
      }
      
      // NASA JPL: Validate IP and port
      if (!validateIPAddress(settings.ip_address)) {
        console.error('Invalid IP address format')
        return false
      }
      
      if (!validatePort(settings.port)) {
        console.error('Invalid port number')
        return false
      }
      
      if (isTauriEnvironment()) {
        const result = await safeTauriInvoke<boolean>('update_printer_settings', {
          printer_id: printerId,
          settings: settings
        }, true)
        
        if (result) {
          // Refresh printer status after update
          await loadPrinterStatus()
        }
        
        return result
      } else {
        // Mock success in browser mode
        console.log('Mock: Updated printer settings for', printerId)
        return true
      }
    } catch (error) {
      console.error('Failed to update printer settings:', error)
      return false
    }
  }
  
  // NASA JPL: Start print job with queue management
  async function startPrintJob(printerId: string, filename: string): Promise<boolean> {
    try {
      // NASA JPL: Input validation
      if (!printerId || !filename) {
        console.error('Missing required parameters for print job')
        return false
      }
      
      // NASA JPL: Check filename length
      if (filename.length > APP_CONFIG.max_filename_length) {
        console.error('Filename exceeds maximum length')
        return false
      }
      
      // NASA JPL: Check queue size
      if (printQueue.value.length >= APP_CONFIG.max_print_queue) {
        console.error('Print queue is at maximum capacity')
        return false
      }
      
      const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      const printJob: PrintJob = {
        id: jobId,
        filename: filename,
        printer_id: printerId,
        progress: 0,
        status: 'queued'
      }
      
      if (isTauriEnvironment()) {
        const result = await safeTauriInvoke<boolean>('start_print_job', {
          printer_id: printerId,
          filename: filename,
          job_id: jobId
        }, true)
        
        if (result) {
          printQueue.value.push(printJob)
          activePrintJob.value = printJob
        }
        
        return result
      } else {
        // Mock success in browser mode
        console.log('Mock: Started print job', filename, 'on printer', printerId)
        printQueue.value.push(printJob)
        activePrintJob.value = printJob
        return true
      }
    } catch (error) {
      console.error('Failed to start print job:', error)
      return false
    }
  }
  
  // NASA JPL: Monitor print progress
  async function startPrintMonitoring(): Promise<void> {
    if (typeof window === 'undefined' || !window.__TAURI__) return // Skip on server or web
    
    try {
      // Listen for print job updates
      const { listen } = await import('@tauri-apps/api/event')
      
      await listen<{ job_id: string; progress: number; status: string }>('print-progress', (event) => {
        const { job_id, progress, status } = event.payload
        
        // Update active job
        if (activePrintJob.value && activePrintJob.value.id === job_id) {
          activePrintJob.value.progress = Math.max(0, Math.min(100, progress))
          activePrintJob.value.status = status as PrintJob['status']
        }
        
        // Update job in queue
        const queueJob = printQueue.value.find(job => job.id === job_id)
        if (queueJob) {
          queueJob.progress = Math.max(0, Math.min(100, progress))
          queueJob.status = status as PrintJob['status']
        }
        
        // Clear active job if completed
        if (status === 'completed' || status === 'failed') {
          if (activePrintJob.value && activePrintJob.value.id === job_id) {
            activePrintJob.value = null
          }
        }
      })
      
      // Set up status refresh interval with global reference for cleanup
      const interval = setInterval(() => {
        loadPrinterStatus()
      }, 10000) // Every 10 seconds
      
      // Store interval globally for cleanup
      ;(window as any).__printInterval = interval
    } catch (error) {
      console.warn('Failed to start print monitoring:', error)
      
      // Fallback polling
      const interval = setInterval(() => {
        loadPrinterStatus()
      }, 15000) // Every 15 seconds as fallback
      
      ;(window as any).__printInterval = interval
    }
  }
  
  // NASA JPL: Initialize store with bounded polling
  async function initialize(): Promise<void> {
    await loadPrinterStatus()
    await startPrintMonitoring()
    
    // Start bounded polling
    startPolling()
  }
  
  // NASA JPL: Bounded polling with timeout
  function startPolling(): void {
    // Clear existing interval
    if (pollingInterval.value) {
      clearInterval(pollingInterval.value)
    }
    
    pollingStartTime.value = Date.now()
    
    pollingInterval.value = setInterval(() => {
      // NASA JPL Rule 2: Check bounds
      if (Date.now() - pollingStartTime.value > maxPollingDuration) {
        stopPolling()
        console.warn('Printer polling stopped after maximum duration')
        return
      }
      
      loadPrinterStatus()
    }, 5000)
  }
  
  // NASA JPL: Clean polling cleanup
  function stopPolling(): void {
    if (pollingInterval.value) {
      clearInterval(pollingInterval.value)
      pollingInterval.value = null
    }
  }
  
  // NASA JPL: Create mock printer data for web mode
  function createMockPrinterStatus(): PrinterStatus[] {
    return [
      {
        id: 'printer_1',
        name: 'Printer 1',
        status: 'idle',
        ip_address: '192.168.1.100',
        port: 80
      },
      {
        id: 'printer_2', 
        name: 'Printer 2',
        status: 'active',
        ip_address: '192.168.1.101',
        port: 80
      },
      {
        id: 'printer_3',
        name: 'Printer 3', 
        status: 'error',
        ip_address: '192.168.1.102',
        port: 80
      }
    ]
  }

  return {
    printers,
    activePrintJob,
    printQueue,
    availablePrinters,
    activePrinters,
    printerStatuses,
    loadPrinterStatus,
    updatePrinterSettings,
    startPrintJob,
    initialize,
    startPolling,
    stopPolling
  }
})