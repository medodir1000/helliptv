// Supabase Edge Function: AI image generation for the blog admin.
// Lives here so the LIVE site can generate images without hitting Netlify's
// 10s function timeout (Edge Functions allow ~150s). Deployed via the Supabase
// MCP / `supabase functions deploy generate-image`.
//
// Required secret (set in the Supabase dashboard → Edge Functions → Secrets):
//   OPENAI_API_KEY   — your OpenAI key (billing enabled)
// Optional:
//   OPENAI_IMAGE_MODEL = gpt-image-1 (default) | dall-e-3
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  // Require a logged-in user (not just the public anon key) — protects the OpenAI key.
  const authHeader = req.headers.get("Authorization") ?? "";
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return json({ error: "Unauthorized — sign in to /admin first." }, 401);

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { /* empty body */ }
  const prompt = String(body.prompt ?? "");
  const query = String(body.query ?? "");
  const size = body.size ? String(body.size) : undefined;

  try {
    return json(await generateImage({ prompt, query, size }));
  } catch (e) {
    return json({ error: (e as Error)?.message || "Image generation failed" }, 502);
  }
});

async function generateImage({ prompt, query, size }: { prompt: string; query: string; size?: string }) {
  const errors: string[] = [];
  const key = Deno.env.get("OPENAI_API_KEY");
  if (key && prompt) {
    try { return await viaOpenAI(key, prompt, size); }
    catch (e) { errors.push(`OpenAI: ${String((e as Error)?.message || e).slice(0, 120)}`); }
  } else if (!key) {
    errors.push("OpenAI: no OPENAI_API_KEY secret set on Supabase");
  }
  try { return await viaPicsum(query || prompt); }
  catch (e) { errors.push(`Picsum: ${String((e as Error)?.message || e).slice(0, 80)}`); }
  throw new Error(errors.join(" | ") || "no image");
}

async function viaOpenAI(key: string, prompt: string, size?: string) {
  const preferred = Deno.env.get("OPENAI_IMAGE_MODEL") || "gpt-image-1";
  const models = preferred === "dall-e-3" ? ["dall-e-3"] : [preferred, "dall-e-3"];
  let lastErr = "OpenAI image failed";
  for (const model of models) {
    const isGpt = model === "gpt-image-1";
    const sz = size || (isGpt ? "1536x1024" : "1792x1024");
    const payload = isGpt
      ? { model, prompt, size: sz, quality: "medium", n: 1 }
      : { model, prompt, size: sz, quality: "standard", response_format: "b64_json", n: 1 };
    const r = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await r.json().catch(() => ({}));
    if (r.ok && data?.data?.[0]?.b64_json) return { b64: data.data[0].b64_json, mime: "image/png", source: model };
    lastErr = data?.error?.message || `OpenAI error (${r.status})`;
    continue;
  }
  throw new Error(lastErr);
}

async function viaPicsum(seedText: string) {
  const seed = encodeURIComponent((seedText || "helliptv").replace(/[^a-z0-9]+/gi, "-").slice(0, 24) || "helliptv");
  const r = await fetch(`https://picsum.photos/seed/${seed}/1280/720`, { redirect: "follow" });
  if (!r.ok) throw new Error(`picsum ${r.status}`);
  const buf = new Uint8Array(await r.arrayBuffer());
  if (buf.length < 1024) throw new Error("empty");
  return { b64: encodeBase64(buf), mime: (r.headers.get("content-type") || "image/jpeg").split(";")[0], source: "picsum" };
}
