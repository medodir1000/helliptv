import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

/* Register the PWA service worker — PRODUCTION ONLY.
   In dev it would cache Vite's HMR modules and break hot-reload / cause
   duplicate-module ("Invalid hook call") issues. */
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* non-fatal: app still works without SW */
    })
  })
}
