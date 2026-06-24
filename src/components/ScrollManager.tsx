import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Scrolls to top on route change, or to the #hash target when present. */
export function ScrollManager() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      // wait a frame for the target route to render
      requestAnimationFrame(() => {
        const el = document.querySelector(hash)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
          return
        }
        window.scrollTo({ top: 0 })
      })
      return
    }
    window.scrollTo({ top: 0 })
  }, [pathname, hash])

  return null
}
