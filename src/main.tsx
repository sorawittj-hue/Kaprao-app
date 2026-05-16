import ReactDOM from 'react-dom/client'
import App from './app/App'
import './styles/globals.css'
import './styles/design-tokens.css'

// StrictMode is intentionally disabled for LIFF stability
// LIFF SDK does not handle double-mounting gracefully
const root = ReactDOM.createRoot(document.getElementById('root')!)

root.render(<App />)

// Register service worker for PWA / offline support (production only)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    const swUrl = `${import.meta.env.BASE_URL}sw.js`
    navigator.serviceWorker
      .register(swUrl, { scope: import.meta.env.BASE_URL })
      .catch((err) => console.error('SW registration failed:', err))
  })
}

// One-shot recovery: if a previous SW left the user with stale HTML pointing
// at deleted JS bundles, the dynamic import will throw with "Failed to fetch
// dynamically imported module". Detect that, unregister the SW, clear caches
// and force a fresh reload so the user gets the live bundle list.
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
