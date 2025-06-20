<template>
  <div 
    class="viewport-container"
    :class="{ 
      'enlarged': isEnlarged,
      'resizing': isResizing 
    }"
    :style="viewportStyle"
  >
    <!-- NASA JPL: Resize handle for real-time viewport adjustment -->
    <div 
      class="resize-handle"
      @mousedown="startResize"
      @touchstart="startResize"
    >
      <div class="resize-grip"></div>
    </div>
    
    <!-- NASA JPL: Content wrapper with swap animation -->
    <div class="viewport-content">
      <!-- Dynamic content area -->
      <div class="viewport-display" v-if="currentContent">
        <component :is="currentContent" v-bind="currentProps" />
      </div>
      
      <!-- Empty state -->
      <div v-else class="viewport-empty">
        <div class="empty-content">
          <div class="empty-icon">📊</div>
          <h3>No Content Active</h3>
          <p>Select a view from the control panel</p>
        </div>
      </div>
    </div>
    
    <!-- NASA JPL: Mission Planning Overlay -->
    <div 
      v-if="showMissionPlanning"
      class="mission-planning-overlay"
      @click="closeMissionPlanning"
    >
      <div class="mission-planning-content" @click.stop>
        <button 
          class="close-button"
          @click="closeMissionPlanning"
          aria-label="Close Mission Planning"
        >
          <X :size="20" />
        </button>
        
        <h2>Mission Planning Interface</h2>
        <div class="planning-tools">
          <!-- Mission planning tools would go here -->
          <p>Mission planning interface coming soon...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch, onUnmounted } from 'vue'
import { X } from 'lucide-vue-next'

// NASA JPL: Type definitions with validation
interface ViewportSize {
  width: number
  height: number
}

interface ViewportPosition {
  x: number
  y: number
}

interface Props {
  defaultSize?: ViewportSize
  minSize?: ViewportSize
  maxSize?: ViewportSize
  hideComponents?: string[]
  enableMissionPlanning?: boolean
}

interface Emits {
  (e: 'size-change', size: ViewportSize): void
  (e: 'content-swap', content: string): void
  (e: 'mission-planning-open'): void
  (e: 'mission-planning-close'): void
}

// NASA JPL: Props with safe defaults
const props = withDefaults(defineProps<Props>(), {
  defaultSize: () => ({ width: 800, height: 600 }),
  minSize: () => ({ width: 320, height: 240 }),
  maxSize: () => ({ width: 1920, height: 1080 }),
  hideComponents: () => [],
  enableMissionPlanning: false
})

const emit = defineEmits<Emits>()

// NASA JPL: Reactive state with bounds checking
const currentSize = ref<ViewportSize>({ ...props.defaultSize })
const isResizing = ref<boolean>(false)
const isEnlarged = ref<boolean>(false)
const currentContent = ref<string | null>(null)
const currentProps = ref<Record<string, any>>({})
const showMissionPlanning = ref<boolean>(false)

// NASA JPL: Touch/Mouse interaction state
const touchState = reactive({
  startPos: { x: 0, y: 0 },
  lastTap: 0,
  tapCount: 0
})

// NASA JPL: Timing controls with bounded operations
const tapTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const longPressTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const DOUBLE_TAP_DELAY = 300 // ms
const LONG_PRESS_DELAY = 800 // ms

// NASA JPL: Computed viewport styling
const viewportStyle = computed(() => ({
  width: `${currentSize.value.width}px`,
  height: `${currentSize.value.height}px`,
  maxWidth: `${props.maxSize.width}px`,
  maxHeight: `${props.maxSize.height}px`,
  minWidth: `${props.minSize.width}px`,
  minHeight: `${props.minSize.height}px`
}))

// NASA JPL: Safe size validation
function validateSize(size: ViewportSize): ViewportSize {
  return {
    width: Math.max(props.minSize.width, Math.min(props.maxSize.width, size.width)),
    height: Math.max(props.minSize.height, Math.min(props.maxSize.height, size.height))
  }
}

// NASA JPL: Resize handling with bounds
function startResize(event: MouseEvent | TouchEvent): void {
  event.preventDefault()
  isResizing.value = true
  
  const startX = 'touches' in event ? event.touches[0].clientX : event.clientX
  const startY = 'touches' in event ? event.touches[0].clientY : event.clientY
  const startSize = { ...currentSize.value }
  
  function handleResize(e: MouseEvent | TouchEvent): void {
    if (!isResizing.value) return
    
    const currentX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const currentY = 'touches' in e ? e.touches[0].clientY : e.clientY
    
    const deltaX = currentX - startX
    const deltaY = currentY - startY
    
    const newSize = validateSize({
      width: startSize.width + deltaX,
      height: startSize.height + deltaY
    })
    
    currentSize.value = newSize
    emit('size-change', newSize)
  }
  
  function stopResize(): void {
    isResizing.value = false
    document.removeEventListener('mousemove', handleResize)
    document.removeEventListener('mouseup', stopResize)
    document.removeEventListener('touchmove', handleResize)
    document.removeEventListener('touchend', stopResize)
  }
  
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
  document.addEventListener('touchmove', handleResize)
  document.addEventListener('touchend', stopResize)
}

// NASA JPL: Content swapping with validation
function swapContent(contentType: string, contentProps: Record<string, any> = {}): void {
  // Validate content type
  if (typeof contentType !== 'string' || contentType.length === 0) {
    console.warn('Invalid content type provided to viewport')
    return
  }
  
  currentContent.value = contentType
  currentProps.value = { ...contentProps }
  emit('content-swap', contentType)
}

// NASA JPL: Touch gesture handling
function handleTouchStart(event: TouchEvent): void {
  if (event.touches.length !== 1) return
  
  const touch = event.touches[0]
  touchState.startPos = { x: touch.clientX, y: touch.clientY }
  
  // Start long press timer
  longPressTimer.value = setTimeout(() => {
    handleLongPress()
  }, LONG_PRESS_DELAY)
}

function handleTouchEnd(event: TouchEvent): void {
  cancelLongPress()
  
  const now = Date.now()
  const timeSinceLastTap = now - touchState.lastTap
  
  if (timeSinceLastTap < DOUBLE_TAP_DELAY) {
    touchState.tapCount++
    if (touchState.tapCount === 2) {
      handleDoubleTap()
      touchState.tapCount = 0
      return
    }
  } else {
    touchState.tapCount = 1
  }
  
  touchState.lastTap = now
  
  // Single tap timer
  if (tapTimer.value) {
    clearTimeout(tapTimer.value)
  }
  
  tapTimer.value = setTimeout(() => {
    if (touchState.tapCount === 1) {
      handleSingleTap()
    }
    touchState.tapCount = 0
  }, DOUBLE_TAP_DELAY)
}

function handleSingleTap(): void {
  // Single tap action
  console.log('Viewport single tap')
}

function handleDoubleTap(): void {
  // Toggle enlarged view
  isEnlarged.value = !isEnlarged.value
  
  if (isEnlarged.value) {
    currentSize.value = { ...props.maxSize }
  } else {
    currentSize.value = { ...props.defaultSize }
  }
  
  emit('size-change', currentSize.value)
}

function handleLongPress(): void {
  // Open mission planning if enabled
  if (props.enableMissionPlanning) {
    showMissionPlanning.value = true
    emit('mission-planning-open')
  }
}

function cancelLongPress(): void {
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value)
    longPressTimer.value = null
  }
}

// NASA JPL: Mission planning controls
function openMissionPlanning(): void {
  if (props.enableMissionPlanning) {
    showMissionPlanning.value = true
    emit('mission-planning-open')
  }
}

function closeMissionPlanning(): void {
  showMissionPlanning.value = false
  emit('mission-planning-close')
}

// NASA JPL: Cleanup on unmount
onUnmounted(() => {
  cancelLongPress()
  if (tapTimer.value) {
    clearTimeout(tapTimer.value)
  }
})
</script>

<style scoped>
.viewport-container {
  position: relative;
  border: 2px solid rgb(var(--border));
  border-radius: 8px;
  background: rgb(var(--background));
  overflow: hidden;
  transition: all 0.3s ease;
  user-select: none;
}

.viewport-container.enlarged {
  z-index: 100;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.viewport-container.resizing {
  transition: none;
}

.resize-handle {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 20px;
  height: 20px;
  cursor: se-resize;
  z-index: 10;
  background: rgb(var(--muted));
  border-top-left-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.resize-handle:hover {
  background: rgb(var(--accent));
}

.resize-grip {
  width: 8px;
  height: 8px;
  background: rgb(var(--foreground));
  border-radius: 1px;
  opacity: 0.6;
}

.viewport-content {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.viewport-display {
  width: 100%;
  height: 100%;
}

.viewport-empty {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgb(var(--muted-foreground));
}

.empty-content {
  text-align: center;
  padding: 2rem;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-content h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: rgb(var(--foreground));
}

.empty-content p {
  font-size: 0.875rem;
  opacity: 0.7;
}

.mission-planning-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s ease;
}

.mission-planning-content {
  background: rgb(var(--background));
  border: 1px solid rgb(var(--border));
  border-radius: 12px;
  padding: 2rem;
  max-width: 80vw;
  max-height: 80vh;
  position: relative;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3);
}

.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: transparent;
  border: none;
  color: rgb(var(--muted-foreground));
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: rgb(var(--muted));
  color: rgb(var(--foreground));
}

.mission-planning-content h2 {
  margin: 0 0 1.5rem 0;
  color: rgb(var(--foreground));
  font-size: 1.5rem;
  font-weight: 600;
}

.planning-tools {
  min-height: 200px;
  color: rgb(var(--muted-foreground));
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .resize-handle {
    width: 24px;
    height: 24px;
  }
  
  .mission-planning-content {
    max-width: 95vw;
    max-height: 95vh;
    padding: 1.5rem;
  }
}
</style>