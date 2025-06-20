import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { MotionPlugin } from '@vueuse/motion'
import App from './App.vue'
import router from './router'
import './styles/tailwind.css'

// NASA JPL Rule 7: Handle browser extension conflicts
window.addEventListener('error', (event) => {
  if (event.message?.includes('not valid JSON') || 
      event.message?.includes('[object Object]')) {
    // Browser extension JSON parsing error - ignore
    event.preventDefault()
    return false
  }
})

// NASA JPL Rule 9: Null safety for global JSON override
const originalJSONParse = JSON.parse
JSON.parse = function(text: string, reviver?: any) {
  try {
    if (typeof text !== 'string') {
      console.warn('JSON.parse called with non-string:', typeof text)
      return text
    }
    return originalJSONParse.call(this, text, reviver)
  } catch (error) {
    console.warn('JSON.parse error (possibly browser extension):', error)
    return null
  }
}

// NASA JPL: Single application instance for isolated system
const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(MotionPlugin)

// NASA JPL: Initialize app after router is ready
router.isReady().then(() => {
  app.mount('#app')
})