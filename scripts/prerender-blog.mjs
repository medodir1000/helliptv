/* Build-time prerender for the blog: writes static HTML for /blog and every
   published article with the correct <title>, meta, Open Graph, canonical and
   JSON-LD baked in — so search engines AND social crawlers (which don't run
   JS) get the real article, not the generic SPA shell. Also emits /feed.xml.
   Needs Supabase env (Netlify); skips cleanly without it. */
import { createClient } from '@supabase/supabase-js'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { marked } from 'marked'

const url = process.env.VITE_SUPABASE_URL
const key = process.env.VITE_SUPABASE_ANON_KEY
if (!url || !key) {
  console.warn('[prerender] no Supabase env — skipped (SPA still works)')
  process.exit(0)
}

const SITE = 'https://helliptv.com'
const esc = (s) =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

let template
try {
  template = readFileSync('dist/index.html', 'utf8')
} catch {
  console.warn('[prerender] dist/index.html missing — run after build')
  process.exit(0)
}

function setMeta(html, attr, name, content) {
  const escName = name.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
  const re = new RegExp(`(<meta\\s+${attr}="${escName}"\\s+content=")[^"]*(")`, 'i')
  if (re.test(html)) return html.replace(re, `$1${esc(content)}$2`)
  return html.replace('</head>', `<meta ${attr}="${name}" content="${esc(content)}"/></head>`)
}

function renderPage({ title, description, canonical, image, type, publishedTime, jsonld, bodyHtml }) {
  let html = template
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
  html = setMeta(html, 'name', 'description', description)
  html = setMeta(html, 'property', 'og:title', title)
  html = setMeta(html, 'property', 'og:description', description)
  html = setMeta(html, 'property', 'og:url', canonical)
  html = setMeta(html, 'name', 'twitter:title', title)
  html = setMeta(html, 'name', 'twitter:description', description)
  html = setMeta(html, 'property', 'og:type', type)
  html = html.replace(/<link\s+rel="canonical"[^>]*>/i, `<link rel="canonical" href="${canonical}"/>`)
  const extra = [
    image ? `<meta property="og:image" content="${esc(image)}"/>` : '',
    image ? `<meta name="twitter:image" content="${esc(image)}"/>` : '',
    publishedTime ? `<meta property="article:published_time" content="${publishedTime}"/>` : '',
    jsonld ? `<script type="application/ld+json">${jsonld}</script>` : '',
  ].filter(Boolean).join('')
  html = html.replace('</head>', extra + '</head>')
  html = html.replace(/<div id="root">\s*<\/div>/, `<div id="root">${bodyHtml}</div>`)
  return html
}

const sb = createClient(url, key)
const { data: posts, error } = await sb
  .from('landing_posts')
  .select('*')
  .eq('status', 'published')
  .order('published_at', { ascending: false })
if (error) {
  console.warn('[prerender] query failed —', error.message)
  process.exit(0)
}

const wrap = (inner) =>
  `<main style="max-width:48rem;margin:0 auto;padding:7rem 1.25rem 4rem"><nav style="font-size:.8rem;color:#797d89;margin-bottom:1.5rem"><a href="/">Home</a> &rsaquo; <a href="/blog">Blog</a></nav>${inner}</main>`

mkdirSync('dist/blog', { recursive: true })

// Individual articles
for (const p of posts) {
  const canonical = `${SITE}/blog/${p.slug}`
  const description = p.meta_description || p.excerpt || ''
  const jsonld = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: p.title,
    description,
    image: p.cover_image ? [p.cover_image] : undefined,
    datePublished: p.published_at || undefined,
    dateModified: p.updated_at || p.published_at || undefined,
    author: { '@type': 'Organization', name: p.author || 'HellIPTV' },
    publisher: { '@type': 'Organization', name: 'HellIPTV' },
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
    keywords: (p.tags || []).join(', ') || undefined,
  })
  const body = wrap(
    `<article class="prose prose-zinc">` +
      (p.cover_image ? `<img src="${esc(p.cover_image)}" alt="${esc(p.title)}" style="border-radius:1rem"/>` : '') +
      `<h1>${esc(p.title)}</h1>` +
      marked.parse(p.body || '') +
      `</article>`,
  )
  mkdirSync(`dist/blog/${p.slug}`, { recursive: true })
  writeFileSync(
    `dist/blog/${p.slug}/index.html`,
    renderPage({
      title: `${p.title} · HellIPTV`,
      description,
      canonical,
      image: p.cover_image || undefined,
      type: 'article',
      publishedTime: p.published_at || undefined,
      jsonld,
      bodyHtml: body,
    }),
  )
}

// Blog index
const cards = posts
  .map(
    (p) =>
      `<a href="/blog/${p.slug}" style="display:block;margin-bottom:1.5rem;color:inherit;text-decoration:none"><h2 style="margin:0 0 .25rem">${esc(p.title)}</h2><p style="margin:0;color:#4a4d57">${esc(p.excerpt || '')}</p></a>`,
  )
  .join('')
writeFileSync(
  'dist/blog/index.html',
  renderPage({
    title: 'Blog — IPTV guides, tips & streaming news · HellIPTV',
    description: 'How-to guides, setup tips and streaming news from HellIPTV — watch every match in 4K on any device.',
    canonical: `${SITE}/blog`,
    type: 'website',
    bodyHtml: wrap(`<h1>Guides, tips &amp; streaming news</h1>${cards}`),
  }),
)

// RSS feed
const rss =
  `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel>` +
  `<title>HellIPTV Blog</title><link>${SITE}/blog</link>` +
  `<description>IPTV guides, 4K streaming tips and the matches worth watching.</description>` +
  posts
    .map(
      (p) =>
        `<item><title>${esc(p.title)}</title><link>${SITE}/blog/${p.slug}</link>` +
        `<guid>${SITE}/blog/${p.slug}</guid>` +
        (p.published_at ? `<pubDate>${new Date(p.published_at).toUTCString()}</pubDate>` : '') +
        `<description>${esc(p.excerpt || '')}</description></item>`,
    )
    .join('') +
  `</channel></rss>\n`
writeFileSync('dist/feed.xml', rss)

console.log(`[prerender] ${posts.length} articles + /blog + feed.xml`)
