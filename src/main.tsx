import ReactDOM from 'react-dom/client'
import App from './app/App'
import './styles/globals.css'
import './styles/design-tokens.css'

// StrictMode is intentionally disabled for LIFF stability
// LIFF SDK does not handle double-mounting gracefully
const root = ReactDOM.createRoot(document.getElementById('root')!)

root.render(<App />)
