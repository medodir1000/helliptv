/* Server-side image generation (OpenAI Images). Key stays on the server.
   NOTE: image generation can take 15-30s. Netlify's default sync function
   timeout is 10s — bump it in netlify.toml ([functions] timeout) or use a
   background function for production. The dev middleware has no such limit. */
import { generateImage } from '../../server/generate.mjs'

export default async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })
  let body
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const env = {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_IMAGE_MODEL: process.env.OPENAI_IMAGE_MODEL,
  }
  try {
    const out = await generateImage(env, body)
    return Response.json(out)
  } catch (e) {
    return Response.json({ error: e?.message || 'Image generation failed' }, { status: e?.unconfigured ? 503 : 502 })
  }
}
