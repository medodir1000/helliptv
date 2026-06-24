import { useEffect } from 'react'

/** Sets the browser tab title for a route, restoring the previous one on unmount. */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    const prev = document.title
    document.title = title
    return () => {
      document.title = prev
    }
  }, [title])
}
