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
