import { useEffect } from 'react'
import { LANGS, blogPath, SITE_URL } from '../lib/i18n'

/** Injects <link rel="alternate" hreflang> for every language version of a blog
    URL (+ x-default), so search engines index each locale correctly. */
export function useHreflang(slug?: string) {
  useEffect(() => {
    const clear = () => document.head.querySelectorAll('link[data-hreflang]').forEach((e) => e.remove())
    const add = (hreflang: string, code: string) => {
      const el = document.createElement('link')
      el.rel = 'alternate'
      el.hreflang = hreflang
      el.href = SITE_URL + blogPath(code, slug)
      el.setAttribute('data-hreflang', '1')
      document.head.appendChild(el)
    }
    clear()
    LANGS.forEach((l) => add(l.hreflang, l.code))
    add('x-default', 'en')
    return clear
  }, [slug])
}
