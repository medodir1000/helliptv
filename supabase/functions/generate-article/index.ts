// Supabase Edge Function: AI article generation (OpenRouter).
// Lives here so the LIVE site can generate LONG articles without hitting
// Netlify's ~26s function timeout (Edge Functions allow ~150s).
//
// Required secret (Supabase dashboard -> Edge Functions -> Secrets):
//   OPENROUTER_API_KEY   - your OpenRouter key
// Optional: OPENROUTER_MODEL = openai/gpt-4o-mini (default)
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function parseJson(text: string) {
  try { return JSON.parse(text); } catch { /* try harder */ }
  const a = text.indexOf("{");
  const b = text.lastIndexOf("}");
  if (a >= 0 && b > a) { try { return JSON.parse(text.slice(a, b + 1)); } catch { /* */ } }
  throw new Error("Could not parse the model response as JSON");
}

async function chat(prompt: string, temperature = 0.75, maxTokens = 6000) {
  const key = Deno.env.get("OPENROUTER_API_KEY");
  if (!key) { const e: any = new Error("No OPENROUTER_API_KEY secret set on Supabase"); e.unconfigured = true; throw e; }
  const model = Deno.env.get("OPENROUTER_MODEL") || "openai/gpt-4o-mini";
  let lastErr = "OpenRouter request failed";
  for (let attempt = 0; attempt < 4; attempt++) {
    let r: Response;
    try {
      r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + key,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://helliptv.com",
          "X-Title": "HellIPTV",
        },
        body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }], temperature, max_tokens: maxTokens }),
      });
    } catch (e) {
      lastErr = (e as Error)?.message || String(e);
      if (attempt < 3) { await sleep(1500 * (attempt + 1)); continue; }
      throw new Error(lastErr);
    }
    const data = await r.json().catch(() => ({}));
    if (r.ok && !data?.error) return parseJson(data?.choices?.[0]?.message?.content || "{}");
    lastErr = data?.error?.message || ("OpenRouter error " + r.status);
    if ((r.status === 429 || /rate.?limit/i.test(lastErr)) && attempt < 3) { await sleep(1500 * (attempt + 1)); continue; }
    throw new Error(lastErr);
  }
  throw new Error(lastErr);
}

function buildPrompt(topic: string, keyword: string, links: { slug: string; title: string }[]) {
  const t = (topic || "").trim();
  const kw = (keyword || "").trim();
  const aboutLine = t ? ("about: " + JSON.stringify(t) + ".") : "about a useful IPTV/streaming topic for cord-cutters.";
  const kwLine = kw ? (" Primary keyword: " + JSON.stringify(kw) + ".") : "";
  const kwHint = kw ? (" (use " + JSON.stringify(kw) + ")") : "";
  const linkList = (Array.isArray(links) ? links : [])
    .filter((l) => l && l.slug && l.title).slice(0, 14)
    .map((l) => "- " + JSON.stringify(l.title) + " -> /blog/" + l.slug).join("\n");
  const linksSection = linkList
    ? ("\n- INTERNAL LINKS: weave in 3-5 Markdown links to the most relevant of these existing HellIPTV articles, as [descriptive anchor](/blog/slug). Only link ones that fit:\n" + linkList)
    : "";
  return [
    "You are a senior SEO content writer for the IPTV streaming brand HellIPTV. Write a COMPLETE, in-depth, genuinely helpful blog article " + aboutLine + kwLine,
    "",
    "LENGTH: 2000-2500 words. Write long, detailed sections (200-300 words each) with concrete steps, examples and specifics. Do NOT stop early or write a thin summary.",
    "",
    "SEO (follow EVERY rule):",
    "- Choose a focus_keyword of 2-4 words" + kwHint + ".",
    "- The focus_keyword MUST appear verbatim in: the title, the FIRST sentence of the body, the slug (hyphenated), and the meta_description.",
    "- title: 40-60 characters with the keyword near the front. meta_description: 140-160 characters including the keyword.",
    "- body is Markdown with NO H1 line: a 2-3 sentence intro whose first sentence contains the keyword, then a '## Key Takeaways' bullet list, then 7-9 '## ' sections (with '### ' subsections and '- ' bullet lists), a '## Frequently Asked Questions' with 4-5 '### ' questions, and a '## Conclusion'." + linksSection,
    "- Use **bold** for key terms. Keep HellIPTV and tech terms (IPTV, VOD, EPG, M3U, Xtream Codes, 4K, HDR, Firestick, TiviMate) in English. Accurate, demonstrates real expertise, no invented statistics.",
    "",
    "Return ONLY a JSON object with these keys: title, slug (kebab-case, contains the keyword), excerpt (<=160 chars, includes the keyword), meta_description, focus_keyword, category (one of: Guides, Streaming, Devices, Sports, Comparisons), tags (array of 4-6 short tags), body (the full long Markdown article with the internal links embedded), image_prompts (array of EXACTLY 3 photorealistic scene prompts; no text, logos, watermarks or brand names), image_queries (array of EXACTLY 3 short 2-4 word stock-photo search phrases).",
  ].join("\n");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const authHeader = req.headers.get("Authorization") ?? "";
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return json({ error: "Unauthorized - sign in to /admin first." }, 401);

  let body: any = {};
  try { body = await req.json(); } catch { /* empty */ }
  try {
    const prompt = buildPrompt(body.topic, body.keyword, body.links);
    const out = await chat(prompt, 0.75, 6000);
    if (!out || !out.body) throw new Error("Model did not return an article body");
    return json(out);
  } catch (e) {
    return json({ error: (e as Error)?.message || "Article generation failed" }, (e as any)?.unconfigured ? 503 : 502);
  }
});
