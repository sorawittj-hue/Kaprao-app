import ReactDOM from 'react-dom/client'
import App from './app/App'
import './styles/globals.css'
import './styles/design-tokens.css'

const root = ReactDOM.createRoot(document.getElementById('root')!)

root.render(<App />)

// Register service worker with auto-update
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    const swUrl = `${import.meta.env.BASE_URL}sw.js`
    navigator.serviceWorker
      .register(swUrl, { scope: import.meta.env.BASE_URL })
      .then((reg) => {
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('New version available, reloading...')
                window.location.reload()
              }
            })
          }
        })
      })
      .catch((err) => console.error('SW registration failed:', err))
  })
}

// One-shot recovery for stale bundles
if (typeof window !== 'undefined') {
  let recovered = false
  window.addEventListener('error', async (e) => {
    const msg = String((e as ErrorEvent).message || '')
    if (!recovered && (msg.includes('Failed to fetch dynamically imported module') || msg.includes('Importing a module script failed'))) {
      recovered = true
      try {
        const regs = await navigator.serviceWorker?.getRegistrations?.()
        await Promise.all((regs || []).map((r) => r.unregister()))
        const keys = await caches?.keys?.()
        await Promise.all((keys || []).map((k) => caches.delete(k)))
      } catch { /* noop */ }
      location.reload()
    }
  })
}
