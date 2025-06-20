// NASA JPL: Advanced viewport management for Olympus 3D system integration
<template>
  <div class="viewport-manager" :class="{ active: isActive }">
    <!-- Primary viewport controls -->
    <div class="viewport-controls">
      <div class="view-toggle-group">
        <button 
          v-for="view in viewModes" 
          :key="view.id"
          @click="setViewMode(view.id)"
          :class="['view-btn', { active: currentView === view.id }]"
          :disabled="!view.available"
        >
          <i :class="view.icon"></i>
          {{ view.label }}
        </button>
      </div>
      
      <!-- Viewport size controls -->
      <div class="size-controls">
        <label>Viewport Size:</label>
        <select v-model="selectedSize" @change="updateViewportSize">
          <option v-for="size in availableSizes" :key="size.name" :value="size">
            {{ size.name }} ({{ size.width }}x{{ size.height }})
          </option>
        </select>
      </div>
    </div>
    
    <!-- Active viewport container -->
    <div 
      ref="viewportContainer" 
      class="viewport-container"
      :style="containerStyle"
    >
      <iframe 
        v-if="currentView === '3d'"
        ref="olympusFrame"
        :src="olympusUrl"
        class="olympus-frame"
        @load="handleOlympusLoad"
      ></iframe>
      
      <div v-else-if="currentView === '2d'" class="map-viewport">
        <LeafletMap 
          :height="selectedSize.height"
          :width="selectedSize.width"
          :telemetry="telemetry"
        />
      </div>
      
      <div v-else-if="currentView === 'split'" class="split-viewport">
        <div class="split-left">
          <LeafletMap 
            :height="selectedSize.height"
            :width="selectedSize.width / 2"
            :telemetry="telemetry"
          />
        </div>
        <div class="split-right">
          <iframe 
            :src="olympusUrl"
            class="olympus-frame split-frame"
            @load="handleOlympusLoad"
          ></iframe>
        </div>
      </div>
    </div>
    
    <!-- Viewport status indicators -->
    <div class="viewport-status">
      <div class="status-item" :class="{ active: olympusConnected }">
        <i class="icon-3d"></i>
        <span>Olympus 3D: {{ olympusConnected ? 'Connected' : 'Disconnected' }}</span>
      </div>
      <div class="status-item" :class="{ active: mapLoaded }">
        <i class="icon-map"></i>
        <span>Map: {{ mapLoaded ? 'Loaded' : 'Loading' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch, onUnmounted } from 'vue'
import LeafletMap from './LeafletMap.vue'
import { useMavLink } from '../services/MAVLinkService'

// NASA JPL: Rule 6 - Data objects declared at smallest possible scope
interface ViewMode {
  id: string
  label: string
  icon: string
  available: boolean
}

interface ViewportSize {
  name: string
  width: number
  height: number
}

// Props
interface Props {
  isActive?: boolean
  defaultView?: string
  olympusUrl?: string
}

const props = withDefaults(defineProps<Props>(), {
  isActive: true,
  defaultView: '2d',
  olympusUrl: '/olympus-3d-test.html'
})

// Reactive state
const currentView = ref(props.defaultView)
const olympusConnected = ref(false)
const mapLoaded = ref(false)
const viewportContainer = ref<HTMLElement>()
const olympusFrame = ref<HTMLIFrameElement>()

// MAVLink integration
const { telemetry } = useMavLink()

// Available view modes
const viewModes = reactive<ViewMode[]>([
  { id: '2d', label: '2D Map', icon: 'icon-map', available: true },
  { id: '3d', label: '3D View', icon: 'icon-3d', available: true },
  { id: 'split', label: 'Split View', icon: 'icon-split', available: true }
])

// Available viewport sizes
const availableSizes = reactive<ViewportSize[]>([
  { name: 'Small', width: 800, height: 600 },
  { name: 'Medium', width: 1024, height: 768 },
  { name: 'Large', width: 1280, height: 960 },
  { name: 'Full HD', width: 1920, height: 1080 }
])

const selectedSize = ref<ViewportSize>(availableSizes[1]) // Default to Medium

// Computed styles
const containerStyle = computed(() => ({
  width: `${selectedSize.value.width}px`,
  height: `${selectedSize.value.height}px`
}))

// NASA JPL: Rule 7 - Check inputs for validity
function setViewMode(viewId: string): void {
  const mode = viewModes.find(m => m.id === viewId)
  if (!mode || !mode.available) {
    console.warn(`Invalid or unavailable view mode: ${viewId}`)
    return
  }
  
  currentView.value = viewId
  
  // NASA JPL: Rule 9 - Handle edge cases
  if (viewId === '3d' || viewId === 'split') {
    // Ensure Olympus frame loads properly
    setTimeout(() => {
      if (olympusFrame.value) {
        checkOlympusConnection()
      }
    }, 100)
  }
}

function updateViewportSize(): void {
  // NASA JPL: Rule 7 - Validate size constraints
  if (selectedSize.value.width < 400 || selectedSize.value.height < 300) {
    console.warn('Viewport size too small, using minimum dimensions')
    selectedSize.value = { name: 'Minimum', width: 400, height: 300 }
  }
  
  // Trigger viewport resize
  emitViewportResize()
}

function handleOlympusLoad(): void {
  olympusConnected.value = true
  console.log('Olympus 3D viewport loaded successfully')
  
  // NASA JPL: Rule 3 - Set bounds on loops
  setTimeout(() => {
    checkOlympusConnection()
  }, 500)
}

// NASA JPL: Rule 7 - Check connection status
function checkOlympusConnection(): void {
  try {
    if (olympusFrame.value?.contentWindow) {
      // Test if frame is responsive
      olympusFrame.value.contentWindow.postMessage({ type: 'ping' }, '*')
      
      // NASA JPL: Rule 2 - Bound the wait time
      setTimeout(() => {
        if (!olympusConnected.value) {
          console.warn('Olympus 3D connection timeout')
          markOlympusDisconnected()
        }
      }, 3000)
    }
  } catch (error) {
    console.error('Error checking Olympus connection:', error)
    markOlympusDisconnected()
  }
}

function markOlympusDisconnected(): void {
  olympusConnected.value = false
  viewModes.find(m => m.id === '3d')!.available = false
  viewModes.find(m => m.id === 'split')!.available = false
}

// NASA JPL: Rule 9 - Handle communication errors
function emitViewportResize(): void {
  try {
    const event = new CustomEvent('viewport-resize', {
      detail: {
        width: selectedSize.value.width,
        height: selectedSize.value.height,
        view: currentView.value
      }
    })
    
    if (viewportContainer.value) {
      viewportContainer.value.dispatchEvent(event)
    }
  } catch (error) {
    console.error('Error emitting viewport resize event:', error)
  }
}

// Watch for telemetry changes to update map
watch(() => telemetry.lat, () => {
  if (currentView.value === '2d' || currentView.value === 'split') {
    mapLoaded.value = true
  }
})

// NASA JPL: Rule 8 - Use static memory allocation patterns
const messageHandler = (event: MessageEvent) => {
  if (event.data?.type === 'pong') {
    olympusConnected.value = true
  }
}

// Setup message listener for Olympus communication
window.addEventListener('message', messageHandler)

// NASA JPL: Rule 5 - Clean up resources
onUnmounted(() => {
  window.removeEventListener('message', messageHandler)
  olympusConnected.value = false
  mapLoaded.value = false
})

// Expose methods for parent components
defineExpose({
  setViewMode,
  updateViewportSize,
  getCurrentView: () => currentView.value,
  getViewportSize: () => selectedSize.value
})
</script>

<style scoped>
.viewport-manager {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background: var(--color-background-soft);
  border-radius: 8px;
  border: 1px solid var(--color-border);
}

.viewport-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem;
  background: var(--color-background);
  border-radius: 6px;
}

.view-toggle-group {
  display: flex;
  gap: 0.5rem;
}

.view-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--color-background-mute);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-btn:hover:not(:disabled) {
  background: var(--color-background-soft);
  border-color: var(--color-border-hover);
}

.view-btn.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.view-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.size-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.size-controls label {
  font-weight: 500;
  color: var(--color-text-soft);
}

.size-controls select {
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-background);
}

.viewport-container {
  position: relative;
  border: 2px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
  background: #000;
  transition: all 0.3s ease;
}

.olympus-frame {
  width: 100%;
  height: 100%;
  border: none;
}

.map-viewport {
  width: 100%;
  height: 100%;
  position: relative;
}

.split-viewport {
  display: flex;
  width: 100%;
  height: 100%;
}

.split-left,
.split-right {
  flex: 1;
  position: relative;
}

.split-frame {
  width: 100%;
  height: 100%;
}

.viewport-status {
  display: flex;
  gap: 1rem;
  padding: 0.5rem;
  background: var(--color-background);
  border-radius: 6px;
  font-size: 0.875rem;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.status-item.active {
  background: var(--color-success-background);
  color: var(--color-success);
}

.status-item:not(.active) {
  background: var(--color-warning-background);
  color: var(--color-warning);
}

/* Icons */
.icon-map::before { content: '🗺️'; }
.icon-3d::before { content: '🌐'; }
.icon-split::before { content: '⚡'; }

@media (max-width: 768px) {
  .viewport-controls {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .view-toggle-group {
    flex-wrap: wrap;
  }
  
  .split-viewport {
    flex-direction: column;
  }
}
</style>