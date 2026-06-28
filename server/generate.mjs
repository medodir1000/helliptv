/* Server-side AI generation — shared by the Vite dev middleware and the Netlify
   functions. Text (articles + image prompts) via OpenRouter; images via OpenAI.
   All API keys stay server-side and never reach the browser bundle.

   Includes retry-on-network-drop (Avast/AV TLS interception can terminate Node's
   outbound HTTPS mid-flight — the same drops that broke bulk translate). */

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const NET = /fetch failed|terminated|ECONNRESET|ETIMEDOUT|EAI_AGAIN|network|socket hang up/i

function parseJson(text) {
  try {
    return JSON.parse(text)
  } catch {
    /* try harder */
  }
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenced) {
    try { return JSON.parse(fenced[1]) } catch { /* keep trying */ }
  }
  const obj = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/)
  if (obj) {
    try { return JSON.parse(obj[0]) } catch { /* fall through */ }
  }
  throw new Error('Could not parse the model response as JSON')
}

/* ── OpenRouter chat (text) — retries network drops + rate limits ── */
async function chat(env, prompt, { json = true, temperature = 0.7, maxTokens } = {}) {
  const key = env.OPENROUTER_API_KEY
  if (!key) {
    const e = new Error('No OPENROUTER_API_KEY configured (set it in .env).')
    e.unconfigured = true
    throw e
  }
  const model = env.OPENROUTER_MODEL || 'openai/gpt-4o-mini'
  const payload = { model, messages: [{ role: 'user', content: prompt }], temperature }
  if (maxTokens) payload.max_tokens = maxTokens
  let lastErr = 'OpenRouter request failed'
  for (let attempt = 0; attempt < 5; attempt++) {
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
        body: JSON.stringify(payload),
      })
    } catch (e) {
      lastErr = e?.message || String(e)
      if (attempt < 4 && NET.test(lastErr)) { await sleep(1500 * (attempt + 1)); continue }
      throw new Error(lastErr)
    }
    const data = await r.json().catch(() => ({}))
    if (r.ok && !data?.error) {
      const content = data?.choices?.[0]?.message?.content || ''
      return json ? parseJson(content) : content
    }
    lastErr = data?.error?.message || `OpenRouter error (${r.status})`
    if ((r.status === 429 || /rate.?limit/i.test(lastErr)) && attempt < 4) { await sleep(1500 * (attempt + 1)); continue }
    throw new Error(lastErr)
  }
  throw new Error(lastErr)
}

/* ── Full article ── */
export async function generateArticle(env, { topic, keyword } = {}) {
  const t = (topic || '').trim()
  const kw = (keyword || '').trim()
  const prompt =
    `You are a senior SEO content writer for the IPTV streaming brand "HellIPTV". ` +
    `Write a COMPLETE, in-depth, genuinely helpful blog article ` +
    `${t ? `about: "${t}".` : 'about a useful IPTV/streaming topic for cord-cutters.'}` +
    `${kw ? ` Primary keyword: "${kw}".` : ''}\n\n` +
    `LENGTH: 1500-2000 words. Write thoroughly and in depth with concrete steps, examples and detail — ` +
    `do NOT stop early or write a thin summary.\n\n` +
    `SEO (2026 best practices) — follow EVERY rule:\n` +
    `- Choose a "focus_keyword" of 2-4 words${kw ? ` (use "${kw}")` : ''}.\n` +
    `- The focus_keyword MUST appear verbatim in ALL of: the title, the FIRST sentence of the body, ` +
    `the slug (hyphenated), and the meta_description.\n` +
    `- "title": 40-60 characters, compelling, with the keyword near the front.\n` +
    `- "meta_description": 140-160 characters, includes the keyword, action-oriented.\n` +
    `- Structure the "body" (Markdown, NO H1/title line): a 2-3 sentence intro whose FIRST sentence ` +
    `contains the keyword, then a "## Key Takeaways" bullet list, then 6-9 "## " sections ` +
    `(with "### " subsections and "- " bullet lists), a "## Frequently Asked Questions" section with ` +
    `4-5 "### " question subheadings, and a "## Conclusion".\n` +
    `- Use **bold** for key terms. Keep the brand "HellIPTV" and tech terms ` +
    `(IPTV, VOD, EPG, M3U, Xtream Codes, 4K, HDR, Firestick, TiviMate) in English.\n` +
    `- Helpful, accurate, demonstrates real expertise (E-E-A-T). NO invented statistics, NO fake legal claims.\n\n` +
    `Return ONLY a JSON object with keys: ` +
    `"title", "slug" (kebab-case, contains the keyword), "excerpt" (<=160 chars, includes the keyword), ` +
    `"meta_description", "focus_keyword", ` +
    `"category" (one of: Guides, Streaming, Devices, Sports, Comparisons), "tags" (array of 4-6 short tags), ` +
    `"body" (the full long Markdown article), ` +
    `"image_prompts" (array of EXACTLY 3 vivid photorealistic image prompts showing real scenes from the article — ` +
    `modern living rooms, streaming devices, families/friends watching 4K TV; NO text, NO logos, NO watermarks, NO brand names).`
  const out = await chat(env, prompt, { temperature: 0.75, maxTokens: 4096 })
  if (!out || !out.body) throw new Error('Model did not return an article body')
  return out
}

/* ── 3 image prompts for an existing article ── */
export async function imagePrompts(env, { title, excerpt, body } = {}) {
  const prompt =
    `Generate exactly 3 vivid, photorealistic image-generation prompts to illustrate this IPTV blog article. ` +
    `Each prompt is ONE detailed sentence describing a real-world scene (modern living room with a big 4K TV, ` +
    `streaming devices, a family or friends watching sports, a cozy home cinema, etc.), with cinematic lighting. ` +
    `Absolutely NO text, NO logos, NO watermarks, NO brand names in the image.\n\n` +
    `Title: ${title || ''}\nSummary: ${excerpt || ''}\n` +
    `${body ? `Article excerpt: ${String(body).slice(0, 800)}\n` : ''}\n` +
    `Return ONLY a JSON array of exactly 3 strings.`
  const out = await chat(env, prompt, { temperature: 0.8 })
  const arr = Array.isArray(out) ? out : out?.prompts || out?.image_prompts || []
  const cleaned = arr.map((s) => String(s)).filter(Boolean).slice(0, 3)
  if (!cleaned.length) throw new Error('Model did not return image prompts')
  return cleaned
}

/* ── One image via OpenAI Images (gpt-image-1 → dall-e-3 fallback) ── */
export async function generateImage(env, { prompt, size } = {}) {
  const key = env.OPENAI_API_KEY
  if (!key) {
    const e = new Error('No OPENAI_API_KEY configured (set it in .env).')
    e.unconfigured = true
    throw e
  }
  if (!prompt) throw new Error('Missing image prompt')

  const preferred = env.OPENAI_IMAGE_MODEL || 'gpt-image-1'
  const models = preferred === 'dall-e-3' ? ['dall-e-3'] : [preferred, 'dall-e-3']
  let lastErr = 'Image generation failed'

  for (const model of models) {
    const isGpt = model === 'gpt-image-1'
    const sz = size || (isGpt ? '1536x1024' : '1792x1024')
    const payload = isGpt
      ? { model, prompt, size: sz, quality: 'medium', n: 1 }
      : { model, prompt, size: sz, quality: 'standard', response_format: 'b64_json', n: 1 }

    for (let attempt = 0; attempt < 4; attempt++) {
      let r
      try {
        r = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } catch (e) {
        lastErr = e?.message || String(e)
        if (attempt < 3 && NET.test(lastErr)) { await sleep(1500 * (attempt + 1)); continue }
        break // try next model
      }
      const data = await r.json().catch(() => ({}))
      if (r.ok && data?.data?.[0]) {
        if (data.data[0].b64_json) return { b64: data.data[0].b64_json, model }
        if (data.data[0].url) return { url: data.data[0].url, model }
      }
      lastErr = data?.error?.message || `OpenAI image error (${r.status})`
      // Org not verified / no access to this model → try the fallback model.
      if (/verif|do not have access|not allowed|unsupported|invalid.*model|model_not_found/i.test(lastErr)) break
      if ((r.status === 429 || r.status >= 500) && attempt < 3) { await sleep(2000 * (attempt + 1)); continue }
      break
    }
  }
  throw new Error(lastErr)
}
