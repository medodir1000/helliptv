/* Server-side blog translation. Uses OpenRouter (preferred) or Gemini — the key
   stays on the server, never shipped to the browser. */
import { translateFields } from '../../server/translate.mjs'

export default async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  let payload
  try {
    payload = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const { language, ...fields } = payload
  if (!language) return Response.json({ error: 'Missing target language' }, { status: 400 })

  const env = {
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    OPENROUTER_MODEL: process.env.OPENROUTER_MODEL,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  }
  try {
    const out = await translateFields(env, fields, language)
    return Response.json(out)
  } catch (e) {
    return Response.json({ error: e?.message || 'Translation failed' }, { status: e?.unconfigured ? 503 : 502 })
  }
}
