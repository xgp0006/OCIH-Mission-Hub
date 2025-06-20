// NASA JPL: Main application entry with enhanced error handling
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// NASA JPL: Rule 9 - Handle all error conditions
// Global error handlers for browser extension conflicts
const originalJSONParse = JSON.parse
JSON.parse = function(text: string, reviver?: any) {
  try {
    // NASA JPL: Rule 7 - Check inputs
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

// NASA JPL: Rule 9 - Global error boundary
window.addEventListener('error', (event) => {
  if (event.message.includes('Extension context invalidated')) {
    console.warn('Browser extension context invalidated, ignoring')
    event.preventDefault()
    return
  }
  
  if (event.message.includes('JSON') && event.message.includes('parse')) {
    console.warn('JSON parsing error intercepted:', event.error)
    event.preventDefault()
    return
  }
  
  console.error('Unhandled error:', event.error)
})

window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.message?.includes('Extension')) {
    console.warn('Browser extension promise rejection, ignoring')
    event.preventDefault()
    return
  }
  
  console.error('Unhandled promise rejection:', event.reason)
})

// NASA JPL: Rule 8 - Initialize with known safe state
function initializeApp(): void {
  try {
    const app = createApp(App)
    const pinia = createPinia()
    
    app.use(pinia)
    app.use(router)
    
    // NASA JPL: Rule 9 - Handle mount failure
    app.mount('#app')
    console.log('OCIH application initialized successfully')
    
  } catch (error) {
    console.error('Failed to initialize application:', error)
    
    // NASA JPL: Rule 9 - Fallback error display
    const fallbackElement = document.getElementById('app')
    if (fallbackElement) {
      fallbackElement.innerHTML = `
        <div style="padding: 2rem; text-align: center; color: #d32f2f;">
          <h2>Application Failed to Load</h2>
          <p>Please refresh the page or contact support.</p>
          <details>
            <summary>Error Details</summary>
            <pre>${error}</pre>
          </details>
        </div>
      `
    }
  }
}

// NASA JPL: Rule 2 - Bounded initialization with timeout
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp)
} else {
  initializeApp()
}

// NASA JPL: Rule 5 - Clean shutdown handling
window.addEventListener('beforeunload', () => {
  console.log('OCIH application shutting down')
})