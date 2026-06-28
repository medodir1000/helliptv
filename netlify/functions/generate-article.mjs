/* Server-side article generation (OpenRouter). Key stays on the server. */
import { generateArticle } from '../../server/generate.mjs'

export default async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })
  let body
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const env = {
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    OPENROUTER_MODEL: process.env.OPENROUTER_MODEL,
  }
  try {
    const out = await generateArticle(env, body)
    return Response.json(out)
  } catch (e) {
    return Response.json({ error: e?.message || 'Article generation failed' }, { status: e?.unconfigured ? 503 : 502 })
  }
}
