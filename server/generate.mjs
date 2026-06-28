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
export async function generateArticle(env, { topic, keyword, links } = {}) {
  const t = (topic || '').trim()
  const kw = (keyword || '').trim()
  const linkList = (Array.isArray(links) ? links : [])
    .filter((l) => l && l.slug && l.title)
    .slice(0, 14)
    .map((l) => `- "${l.title}" -> /blog/${l.slug}`)
    .join('\n')
  const prompt =
    `You are a senior SEO content writer for the IPTV streaming brand "HellIPTV". ` +
    `Write a COMPLETE, in-depth, genuinely helpful blog article ` +
    `${t ? `about: "${t}".` : 'about a useful IPTV/streaming topic for cord-cutters.'}` +
    `${kw ? ` Primary keyword: "${kw}".` : ''}\n\n` +
    `LENGTH: 2000-2500 words — LONG and detailed. Each "## " section must be 200-300 words with concrete ` +
    `steps, examples, comparisons and specifics. Do NOT stop early or write a thin summary.\n\n` +
    `SEO (2026 best practices) — follow EVERY rule:\n` +
    `- Choose a "focus_keyword" of 2-4 words${kw ? ` (use "${kw}")` : ''}.\n` +
    `- The focus_keyword MUST appear verbatim in ALL of: the title, the FIRST sentence of the body, ` +
    `the slug (hyphenated), and the meta_description.\n` +
    `- "title": 40-60 characters, compelling, with the keyword near the front.\n` +
    `- "meta_description": 140-160 characters, includes the keyword, action-oriented.\n` +
    `- Structure the "body" (Markdown, NO H1/title line): a 2-3 sentence intro whose FIRST sentence ` +
    `contains the keyword, then a "## Key Takeaways" bullet list, then 7-9 "## " sections ` +
    `(with "### " subsections and "- " bullet lists), a "## Frequently Asked Questions" section with ` +
    `4-5 "### " question subheadings, and a "## Conclusion".\n` +
    (linkList
      ? `- INTERNAL LINKS: naturally weave in 3-5 Markdown links to the MOST relevant of these existing ` +
        `HellIPTV articles, using their exact paths as [descriptive anchor text](/blog/slug). Only link ones ` +
        `that genuinely fit the context. Available articles:\n${linkList}\n`
      : '') +
    `- Use **bold** for key terms. Keep the brand "HellIPTV" and tech terms ` +
    `(IPTV, VOD, EPG, M3U, Xtream Codes, 4K, HDR, Firestick, TiviMate) in English.\n` +
    `- Helpful, accurate, demonstrates real expertise (E-E-A-T). NO invented statistics, NO fake legal claims.\n\n` +
    `Return ONLY a JSON object with keys: ` +
    `"title", "slug" (kebab-case, contains the keyword), "excerpt" (<=160 chars, includes the keyword), ` +
    `"meta_description", "focus_keyword", ` +
    `"category" (one of: Guides, Streaming, Devices, Sports, Comparisons), "tags" (array of 4-6 short tags), ` +
    `"body" (the full long Markdown article WITH the internal links embedded), ` +
    `"image_prompts" (array of EXACTLY 3 vivid photorealistic image prompts of real scenes from the article — ` +
    `modern living rooms, streaming devices, families/friends watching 4K TV; NO text/logos/watermarks/brands), ` +
    `"image_queries" (array of EXACTLY 3 short 2-4 word stock-photo search phrases matching those scenes, ` +
    `e.g. "modern living room tv", "family watching television", "home cinema 4k").`
  const out = await chat(env, prompt, { temperature: 0.75, maxTokens: 6000 })
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

/* ── One image: OpenAI (if key) → Pexels (free key) → Picsum (keyless). Always returns {b64, mime}. ── */
export async function generateImage(env, { prompt, query, size } = {}) {
  const errors = []
  if (env.OPENAI_API_KEY && prompt) {
    try { return await viaOpenAI(env, prompt, size) }
    catch (e) { errors.push(`OpenAI: ${String(e?.message || e).slice(0, 80)}`) }
  }
  if (env.PEXELS_API_KEY) {
    try { return await viaPexels(env.PEXELS_API_KEY, query || prompt) }
    catch (e) { errors.push(`Pexels: ${String(e?.message || e).slice(0, 80)}`) }
  }
  try { return await viaPicsum(query || prompt) }
  catch (e) { errors.push(`Picsum: ${String(e?.message || e).slice(0, 80)}`) }
  throw new Error(errors.join(' | ') || 'Image generation failed')
}

async function imageToB64(url) {
  let r
  try { r = await fetch(url, { redirect: 'follow' }) }
  catch (e) { throw new Error(`fetch failed: ${e?.message || e}`) }
  if (!r.ok) throw new Error(`fetch ${r.status}`)
  const mime = (r.headers.get('content-type') || 'image/jpeg').split(';')[0]
  const buf = Buffer.from(await r.arrayBuffer())
  if (buf.length < 1024) throw new Error('empty image')
  return { b64: buf.toString('base64'), mime }
}

async function viaOpenAI(env, prompt, size) {
  const key = env.OPENAI_API_KEY
  const preferred = env.OPENAI_IMAGE_MODEL || 'gpt-image-1'
  const models = preferred === 'dall-e-3' ? ['dall-e-3'] : [preferred, 'dall-e-3']
  let lastErr = 'OpenAI image failed'
  for (const model of models) {
    const isGpt = model === 'gpt-image-1'
    const sz = size || (isGpt ? '1536x1024' : '1792x1024')
    const payload = isGpt
      ? { model, prompt, size: sz, quality: 'medium', n: 1 }
      : { model, prompt, size: sz, quality: 'standard', response_format: 'b64_json', n: 1 }
    for (let attempt = 0; attempt < 3; attempt++) {
      let r
      try {
        r = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } catch (e) {
        lastErr = e?.message || String(e)
        if (attempt < 2 && NET.test(lastErr)) { await sleep(1500 * (attempt + 1)); continue }
        break
      }
      const data = await r.json().catch(() => ({}))
      if (r.ok && data?.data?.[0]?.b64_json) return { b64: data.data[0].b64_json, mime: 'image/png', source: model }
      if (r.ok && data?.data?.[0]?.url) return { ...(await imageToB64(data.data[0].url)), source: model }
      lastErr = data?.error?.message || `OpenAI error (${r.status})`
      if (/verif|do not have access|not allowed|unsupported|invalid.*model|model_not_found|incorrect api key|invalid_api_key|401/i.test(lastErr)) break
      if ((r.status === 429 || r.status >= 500) && attempt < 2) { await sleep(2000 * (attempt + 1)); continue }
      break
    }
  }
  throw new Error(lastErr)
}

async function viaPexels(key, query) {
  const q = String(query || 'television').replace(/[^a-z0-9 ]/gi, ' ').replace(/\s+/g, ' ').trim().slice(0, 50) || 'television'
  const r = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=20&orientation=landscape&size=large`, {
    headers: { Authorization: key },
  })
  if (!r.ok) throw new Error(`Pexels (${r.status})`)
  const data = await r.json()
  const photos = (data?.photos || []).filter((p) => p?.src)
  if (!photos.length) throw new Error('no results')
  const pick = photos[Math.floor((Date.now() / 997) % photos.length)] || photos[0]
  const out = await imageToB64(pick.src.large2x || pick.src.large || pick.src.original)
  return { ...out, source: 'pexels' }
}

async function viaPicsum(seedText) {
  const seed = String(seedText || 'helliptv').replace(/[^a-z0-9]+/gi, '-').slice(0, 24) || 'helliptv'
  const out = await imageToB64(`https://picsum.photos/seed/${encodeURIComponent(seed)}/1280/720`)
  return { ...out, source: 'picsum' }
}
