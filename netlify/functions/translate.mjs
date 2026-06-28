/* Server-side translation via Google Gemini (free tier). Translates a blog
   article's fields into one target language and returns JSON. The GEMINI_API_KEY
   stays on the server — never shipped to the browser. */

const MODEL = 'gemini-2.0-flash'

export default async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  const key = process.env.GEMINI_API_KEY
  if (!key) return Response.json({ error: 'GEMINI_API_KEY is not configured on the server.' }, { status: 503 })

  let payload
  try {
    payload = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const { title = '', excerpt = '', meta_description = '', body = '', language } = payload
  if (!language) return Response.json({ error: 'Missing target language' }, { status: 400 })

  const prompt =
    `You are a professional translator localising an IPTV streaming blog into ${language}. ` +
    `Translate the fields below into natural, fluent, SEO-friendly ${language}. ` +
    `Rules: keep ALL Markdown formatting in "body" intact (## headings, **bold**, - lists, [links](url), tables). ` +
    `Do NOT translate the brand name "HellIPTV", proper nouns, or technical terms ` +
    `(IPTV, VOD, EPG, M3U, Xtream Codes, 4K, HDR, Dolby Vision, Firestick, TiviMate). ` +
    `Return ONLY a JSON object with exactly these keys: "title", "excerpt", "meta_description", "body".\n\n` +
    `Input:\n${JSON.stringify({ title, excerpt, meta_description, body })}`

  let r, data
  try {
    r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, responseMimeType: 'application/json' },
      }),
    })
    data = await r.json()
  } catch (e) {
    return Response.json({ error: 'Translation request failed: ' + (e?.message || e) }, { status: 502 })
  }
  if (!r.ok) return Response.json({ error: data?.error?.message || 'Gemini request failed' }, { status: r.status })

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
  let out
  try {
    out = JSON.parse(text)
  } catch {
    return Response.json({ error: 'Could not parse the translation' }, { status: 502 })
  }
  return Response.json({
    title: out.title ?? title,
    excerpt: out.excerpt ?? excerpt,
    meta_description: out.meta_description ?? meta_description,
    body: out.body ?? body,
  })
}
