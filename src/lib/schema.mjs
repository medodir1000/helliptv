/* Shared JSON-LD builders for blog posts — used by BlogPost.tsx (client) AND
   scripts/prerender-blog.mjs (crawler-facing HTML). Richer schema = bigger
   Google listings (FAQ dropdowns, breadcrumbs) = more clicks at the same rank. */

const SITE = 'https://helliptv.com'

/** Find the FAQ Q&A in a Markdown body. Language-agnostic: the FAQ is the "## "
 *  section with the most "### " question subheadings. */
export function extractFaq(body = '') {
  const lines = String(body).split('\n')
  const sections = []
  let cur = null
  for (const line of lines) {
    if (/^##\s/.test(line)) { cur = { lines: [] }; sections.push(cur) }
    else if (cur) cur.lines.push(line)
  }
  let faq = null
  let max = 1
  for (const s of sections) {
    const n = s.lines.filter((l) => /^###\s/.test(l)).length
    if (n > max) { max = n; faq = s }
  }
  if (!faq) return []
  const out = []
  let q = null
  let a = []
  const clean = (s) => s.replace(/\*\*/g, '').replace(/\[(.+?)\]\(.+?\)/g, '$1').replace(/\s+/g, ' ').trim()
  const flush = () => { const ans = clean(a.join(' ')); if (q && ans) out.push({ q: clean(q), a: ans }); q = null; a = [] }
  for (const l of faq.lines) {
    if (/^###\s/.test(l)) { flush(); q = l.replace(/^###\s*/, '') }
    else if (q) a.push(l)
  }
  flush()
  return out.slice(0, 10)
}

/** Build the full JSON-LD @graph (BlogPosting + BreadcrumbList + optional FAQPage). */
export function articleJsonLd({ title, description, body, image, datePublished, dateModified, author, tags, lang, url }) {
  const graph = [
    {
      '@type': 'BlogPosting',
      headline: title,
      description: description || '',
      inLanguage: lang || 'en',
      image: image ? [image] : undefined,
      datePublished: datePublished || undefined,
      dateModified: dateModified || datePublished || undefined,
      author: { '@type': 'Organization', name: author || 'HellIPTV' },
      publisher: { '@type': 'Organization', name: 'HellIPTV', logo: { '@type': 'ImageObject', url: `${SITE}/logo.png` } },
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      keywords: tags && tags.length ? tags.join(', ') : undefined,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE}/blog` },
        { '@type': 'ListItem', position: 3, name: title, item: url },
      ],
    },
  ]
  const faq = extractFaq(body)
  if (faq.length >= 2) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    })
  }
  return { '@context': 'https://schema.org', '@graph': graph }
}
