/* Server-side image-prompt generation (OpenRouter). Key stays on the server. */
import { imagePrompts } from '../../server/generate.mjs'

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
    const prompts = await imagePrompts(env, body)
    return Response.json({ prompts })
  } catch (e) {
    return Response.json({ error: e?.message || 'Could not build image prompts' }, { status: e?.unconfigured ? 503 : 502 })
  }
}
