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
} else if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  // Dev safety net: remove any service worker left over from a past production
  // build on this origin. Otherwise it serves a stale cached bundle that hides
  // code changes and breaks HMR (this caused real "my changes aren't showing" pain).
  navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach((r) => r.unregister()))
}
