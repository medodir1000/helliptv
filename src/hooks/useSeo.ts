import { useEffect } from 'react'

const SITE = 'https://helliptv.com'

function upsertMeta(key: 'name' | 'property', id: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${key}="${id}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(key, id)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

interface SeoOptions {
  /** page-specific title; “ · HellIPTV” is appended automatically */
  title: string
  description: string
  /** route path, e.g. "/pricing" */
  path: string
  /** absolute image URL for social cards (og:image / twitter:image) */
  image?: string
  /** og:type — 'article' for blog posts, 'website' otherwise */
  type?: string
  noindex?: boolean
}

/** Per-route SEO: title, meta description, canonical, Open Graph & Twitter tags. */
export function useSeo({ title, description, path, image, type, noindex }: SeoOptions) {
  useEffect(() => {
    const fullTitle = title.includes('HellIPTV') ? title : `${title} · HellIPTV`
    const url = SITE + path

    document.title = fullTitle
    upsertMeta('name', 'description', description)
    upsertMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow')
    upsertMeta('property', 'og:type', type ?? 'website')
    upsertMeta('property', 'og:site_name', 'HellIPTV')
    upsertMeta('property', 'og:title', fullTitle)
    upsertMeta('property', 'og:description', description)
    upsertMeta('property', 'og:url', url)
    upsertMeta('name', 'twitter:title', fullTitle)
    upsertMeta('name', 'twitter:description', description)
    upsertMeta('name', 'twitter:card', image ? 'summary_large_image' : 'summary')
    if (image) {
      upsertMeta('property', 'og:image', image)
      upsertMeta('name', 'twitter:image', image)
    }
    upsertLink('canonical', url)
  }, [title, description, path, image, type, noindex])
}
