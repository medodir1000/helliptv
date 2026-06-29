/* IndexNow — instant search-engine notification (Bing, Yandex, Seznam, Naver;
   Google reads the same signal). The key is PUBLIC by design — it's hosted at
   https://helliptv.com/<key>.txt to prove ownership. Submitting a URL gets it
   crawled in minutes instead of days. */

const HOST = 'helliptv.com'
const KEY = '996f98ec28dc5557c43f812cb396dc2c'
const LANGS = ['es', 'fr', 'de', 'pt', 'ar', 'it', 'nl', 'tr', 'pl', 'ru', 'hi', 'vi']

/** All indexable URLs for a published post — English + every localized route. */
export function postUrls(slug) {
  const base = `https://${HOST}`
  const urls = [`${base}/blog/${slug}`, `${base}/blog`]
  for (const l of LANGS) urls.push(`${base}/${l}/blog/${slug}`)
  return urls
}

/** Submit a batch of URLs to IndexNow. */
export async function submitIndexNow(urls) {
  const urlList = [...new Set((urls || []).filter(Boolean))].slice(0, 10000)
  if (!urlList.length) return { ok: false, error: 'no urls' }
  try {
    const r = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList }),
    })
    // IndexNow returns 200 or 202 on success.
    return { ok: r.status === 200 || r.status === 202, status: r.status, submitted: urlList.length }
  } catch (e) {
    return { ok: false, error: e?.message || String(e) }
  }
}
