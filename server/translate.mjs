/* LLM translation — shared by the Netlify function and the Vite dev middleware.
   Prefers OpenRouter (OpenAI-compatible) when OPENROUTER_API_KEY is set, else
   falls back to Gemini. Keys stay server-side. */

function buildPrompt(fields, language) {
  return (
    `You are a professional translator localising an IPTV streaming blog into ${language}. ` +
    `Translate the fields below into natural, fluent, SEO-friendly ${language}. ` +
    `Keep ALL Markdown in "body" intact (## headings, **bold**, - lists, [links](url), tables). ` +
    `Do NOT translate the brand "HellIPTV", proper nouns, or technical terms ` +
    `(IPTV, VOD, EPG, M3U, Xtream Codes, 4K, HDR, Dolby Vision, Firestick, TiviMate). ` +
    `Return ONLY a JSON object with keys "title", "excerpt", "meta_description", "body".\n\nInput:\n` +
    JSON.stringify({
      title: fields.title || '',
      excerpt: fields.excerpt || '',
      meta_description: fields.meta_description || '',
      body: fields.body || '',
    })
  )
}

function parseJson(text) {
  try {
    return JSON.parse(text)
  } catch {
    /* try harder below */
  }
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenced) {
    try {
      return JSON.parse(fenced[1])
    } catch {
      /* keep trying */
    }
  }
  const obj = text.match(/\{[\s\S]*\}/)
  if (obj) {
    try {
      return JSON.parse(obj[0])
    } catch {
      /* fall through */
    }
  }
  throw new Error('Could not parse the translation response')
}

async function viaOpenRouter(key, model, prompt) {
  const m = model || 'meta-llama/llama-3.3-70b-instruct:free'
  let lastErr = 'OpenRouter failed'
  for (let attempt = 0; attempt < 4; attempt++) {
    let r
    try {
      r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://helliptv.com',
          'X-Title': 'HellIPTV',
        },
        body: JSON.stringify({ model: m, messages: [{ role: 'user', content: prompt }], temperature: 0.3 }),
      })
    } catch (e) {
      // Retry transient network drops (Avast/AV TLS interception terminates Node HTTPS).
      lastErr = e?.message || String(e)
      if (attempt < 3 && /fetch failed|terminated|ECONNRESET|ETIMEDOUT|EAI_AGAIN|network|socket/i.test(lastErr)) {
        await new Promise((s) => setTimeout(s, 1500 * (attempt + 1)))
        continue
      }
      throw new Error(lastErr)
    }
    const data = await r.json()
    if (r.ok && !data?.error) return parseJson(data?.choices?.[0]?.message?.content || '{}')
    const msg = data?.error?.message || `OpenRouter error (${r.status})`
    lastErr = msg
    // Retry transient upstream rate-limits (common on :free models).
    if ((r.status === 429 || /rate.?limit/i.test(msg)) && attempt < 3) {
      await new Promise((s) => setTimeout(s, 1500 * (attempt + 1)))
      continue
    }
    const raw = data?.error?.metadata?.raw
    throw new Error(raw ? `${msg} — ${typeof raw === 'string' ? raw : JSON.stringify(raw)}` : msg)
  }
  throw new Error(lastErr)
}

async function viaGemini(key, prompt) {
  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, responseMimeType: 'application/json' },
      }),
    },
  )
  const data = await r.json()
  if (!r.ok) throw new Error(data?.error?.message || `Gemini error (${r.status})`)
  return parseJson(data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}')
}

/** env: { OPENROUTER_API_KEY, OPENROUTER_MODEL, GEMINI_API_KEY } */
export async function translateFields(env, fields, language) {
  const prompt = buildPrompt(fields, language)
  let out
  if (env.OPENROUTER_API_KEY) {
    out = await viaOpenRouter(env.OPENROUTER_API_KEY, env.OPENROUTER_MODEL, prompt)
  } else if (env.GEMINI_API_KEY) {
    out = await viaGemini(env.GEMINI_API_KEY, prompt)
  } else {
    const err = new Error('No translation key configured (set OPENROUTER_API_KEY or GEMINI_API_KEY).')
    err.unconfigured = true
    throw err
  }
  return {
    title: out.title ?? fields.title,
    excerpt: out.excerpt ?? fields.excerpt,
    meta_description: out.meta_description ?? fields.meta_description,
    body: out.body ?? fields.body,
  }
}
