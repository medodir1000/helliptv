/* Generates dist/sitemap.xml at build time: static routes + every PUBLISHED
   blog post (so Google can discover and index each article). Needs the
   Supabase env at build (set on Netlify). Falls back to static-only and never
   fails the build. */
import { createClient } from '@supabase/supabase-js'
import { writeFileSync } from 'node:fs'

const SITE = 'https://helliptv.com'
const today = new Date().toISOString().slice(0, 10)

const STATIC = [
  ['/', 'daily', '1.0'],
  ['/pricing', 'weekly', '0.9'],
  ['/features', 'monthly', '0.8'],
  ['/channels', 'weekly', '0.8'],
  ['/blog', 'daily', '0.8'],
  ['/faq', 'monthly', '0.7'],
  ['/setup-guides', 'monthly', '0.7'],
  ['/speed-test', 'monthly', '0.6'],
  ['/devices/smart-tv-firestick', 'monthly', '0.7'],
  ['/devices/android-ios', 'monthly', '0.7'],
  ['/devices/apple-tv-mac', 'monthly', '0.7'],
  ['/devices/mag-formuler', 'monthly', '0.7'],
]

const urls = STATIC.map(([loc, changefreq, priority]) => ({ loc, lastmod: today, changefreq, priority }))

const url = process.env.VITE_SUPABASE_URL
const key = process.env.VITE_SUPABASE_ANON_KEY
if (url && key) {
  try {
    const sb = createClient(url, key)
    const { data, error } = await sb
      .from('landing_posts')
      .select('slug,updated_at,published_at')
      .eq('status', 'published')
    if (error) throw error
    for (const p of data ?? []) {
      urls.push({
        loc: `/blog/${p.slug}`,
        lastmod: (p.updated_at || p.published_at || '').slice(0, 10) || today,
        changefreq: 'weekly',
        priority: '0.7',
      })
    }
    console.log(`[sitemap] added ${data?.length ?? 0} published blog posts`)
  } catch (e) {
    console.warn('[sitemap] skipped blog posts —', e.message)
  }
} else {
  console.warn('[sitemap] no Supabase env at build — static routes only')
}

const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls
    .map(
      (u) =>
        `  <url><loc>${SITE}${u.loc}</loc><lastmod>${u.lastmod}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`,
    )
    .join('\n') +
  `\n</urlset>\n`

writeFileSync('dist/sitemap.xml', xml)
console.log(`[sitemap] wrote ${urls.length} URLs to dist/sitemap.xml`)
