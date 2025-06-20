// NASA JPL: Bounded printer management store
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// NASA JPL: Rule 6 - Declare data objects at smallest scope
interface PrinterStatus {
  id: string
  name: string
  state: 'idle' | 'printing' | 'paused' | 'error' | 'offline'
  progress: number
  temperature: {
    extruder: number
    bed: number
  }
  estimatedTime: number
  lastUpdate: number
}

interface PrintJob {
  id: string
  filename: string
  progress: number
  timeRemaining: number
  startTime: number
}

export const usePrintersStore = defineStore('printers', () => {
  // State
  const printers = ref<PrinterStatus[]>([])
  const activePrintJobs = ref<PrintJob[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const selectedPrinterId = ref<string | null>(null)
  
  // NASA JPL: Rule 2 - Bounded polling with timeout
  const pollingInterval = ref<ReturnType<typeof setInterval> | null>(null)
  const pollingStartTime = ref<number>(Date.now())
  const maxPollingDuration = 30 * 60 * 1000 // 30 minutes max
  const isPolling = ref(false)
  
  // Computed
  const activePrinters = computed(() => 
    printers.value.filter(p => p.state !== 'offline')
  )
  
  const selectedPrinter = computed(() => 
    printers.value.find(p => p.id === selectedPrinterId.value)
  )
  
  const totalProgress = computed(() => {
    if (activePrintJobs.value.length === 0) return 0
    const total = activePrintJobs.value.reduce((sum, job) => sum + job.progress, 0)
    return Math.round(total / activePrintJobs.value.length)
  })
  
  // NASA JPL: Rule 7 - Check all inputs
  function addPrinter(printer: Omit<PrinterStatus, 'lastUpdate'>): void {
    if (!printer.id || !printer.name) {
      console.error('Invalid printer data: missing id or name')
      return
    }
    
    const existingIndex = printers.value.findIndex(p => p.id === printer.id)
    const newPrinter: PrinterStatus = {
      ...printer,
      lastUpdate: Date.now()
    }
    
    if (existingIndex >= 0) {
      printers.value[existingIndex] = newPrinter
    } else {
      printers.value.push(newPrinter)
    }
  }
  
  function removePrinter(printerId: string): void {
    if (!printerId) return
    
    const index = printers.value.findIndex(p => p.id === printerId)
    if (index >= 0) {
      printers.value.splice(index, 1)
      
      // Clear selection if removed printer was selected
      if (selectedPrinterId.value === printerId) {
        selectedPrinterId.value = null
      }
    }
  }
  
  function updatePrinterStatus(printerId: string, updates: Partial<PrinterStatus>): void {
    if (!printerId) return
    
    const printer = printers.value.find(p => p.id === printerId)
    if (printer) {
      Object.assign(printer, updates, { lastUpdate: Date.now() })
    }
  }
  
  function selectPrinter(printerId: string | null): void {
    selectedPrinterId.value = printerId
  }
  
  // NASA JPL: Rule 2 - Bounded operations
  async function loadPrinterStatus(): Promise<void> {
    if (isLoading.value) return
    
    try {
      isLoading.value = true
      error.value = null
      
      // NASA JPL: Rule 3 - Limit data processing
      const maxPrinters = 10
      
      // Simulate API call with timeout
      const response = await Promise.race([
        fetchPrintersFromAPI(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 5000)
        )
      ]) as PrinterStatus[]
      
      if (response.length > maxPrinters) {
        console.warn(`Too many printers (${response.length}), limiting to ${maxPrinters}`)
        printers.value = response.slice(0, maxPrinters)
      } else {
        printers.value = response
      }
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load printer status'
      console.error('Error loading printer status:', err)
    } finally {
      isLoading.value = false
    }
  }
  
  // NASA JPL: Rule 2 - Bounded polling with cleanup
  function startPolling(): void {
    if (isPolling.value) return
    
    pollingStartTime.value = Date.now()
    isPolling.value = true
    
    pollingInterval.value = setInterval(() => {
      // NASA JPL: Rule 2 - Check bounds
      if (Date.now() - pollingStartTime.value > maxPollingDuration) {
        console.log('Polling timeout reached, stopping polling')
        stopPolling()
        return
      }
      
      loadPrinterStatus()
    }, 2000) // Poll every 2 seconds
  }
  
  function stopPolling(): void {
    if (pollingInterval.value) {
      clearInterval(pollingInterval.value)
      pollingInterval.value = null
    }
    isPolling.value = false
  }
  
  // NASA JPL: Rule 9 - Handle all possible outcomes
  async function fetchPrintersFromAPI(): Promise<PrinterStatus[]> {
    try {
      // Simulate API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Mock data
      return [
        {
          id: 'printer-1',
          name: 'Ender 3 Pro',
          state: 'printing',
          progress: 75,
          temperature: { extruder: 210, bed: 60 },
          estimatedTime: 1800,
          lastUpdate: Date.now()
        },
        {
          id: 'printer-2', 
          name: 'Prusa MK3S',
          state: 'idle',
          progress: 0,
          temperature: { extruder: 25, bed: 25 },
          estimatedTime: 0,
          lastUpdate: Date.now()
        }
      ]
    } catch (error) {
      console.error('Failed to fetch printers:', error)
      throw error
    }
  }
  
  // NASA JPL: Rule 5 - Clean up resources
  function cleanup(): void {
    stopPolling()
    printers.value = []
    activePrintJobs.value = []
    selectedPrinterId.value = null
    error.value = null
  }
  
  return {
    // State
    printers,
    activePrintJobs,
    isLoading,
    error,
    selectedPrinterId,
    isPolling,
    
    // Computed
    activePrinters,
    selectedPrinter,
    totalProgress,
    
    // Actions
    addPrinter,
    removePrinter,
    updatePrinterStatus,
    selectPrinter,
    loadPrinterStatus,
    startPolling,
    stopPolling,
    cleanup
  }
})