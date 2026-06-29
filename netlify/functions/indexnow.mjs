/* Instant search-engine indexing via IndexNow. Fast (~1s) — fits Netlify limits. */
import { submitIndexNow, postUrls } from '../../server/indexnow.mjs'

export default async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })
  let body
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const urls = body.urls?.length ? body.urls : body.slug ? postUrls(body.slug) : []
  return Response.json(await submitIndexNow(urls))
}
