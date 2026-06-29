import { supabase } from './supabase'

export type PostStatus = 'draft' | 'published'

export interface Post {
  id: string
  slug: string
  title: string
  excerpt: string | null
  body: string | null
  cover_image: string | null
  category: string | null
  author: string | null
  tags: string[] | null
  status: PostStatus
  meta_description: string | null
  focus_keyword: string | null
  read_minutes: number | null
  published_at: string | null
  created_at: string
  updated_at: string
}

export type PostInput = Partial<
  Pick<
    Post,
    | 'slug' | 'title' | 'excerpt' | 'body' | 'cover_image' | 'category'
    | 'author' | 'tags' | 'status' | 'meta_description' | 'focus_keyword' | 'read_minutes' | 'published_at'
  >
>

const LIST_COLS = 'id,slug,title,excerpt,cover_image,category,author,tags,read_minutes,published_at,created_at'

/* ── Public reads (RLS allows only published) ── */
export async function getPublishedPosts(limit?: number, lang = 'en'): Promise<Post[]> {
  let q = supabase
    .from('landing_posts')
    .select(LIST_COLS)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
  if (limit) q = q.limit(limit)
  const { data, error } = await q
  if (error) throw error
  const posts = (data ?? []) as Post[]
  if (lang === 'en' || posts.length === 0) return posts
  const { data: tr } = await supabase
    .from('landing_post_translations')
    .select('post_id,title,excerpt')
    .eq('lang', lang)
    .in('post_id', posts.map((p) => p.id))
  const m = new Map((tr ?? []).map((t) => [(t as any).post_id, t as any]))
  return posts.map((p) => {
    const t = m.get(p.id)
    return t ? { ...p, title: t.title || p.title, excerpt: t.excerpt || p.excerpt } : p
  })
}

export async function getRelatedPosts(excludeSlug: string, category: string | null, limit = 3, lang = 'en'): Promise<Post[]> {
  const out: Post[] = []
  const seen = new Set<string>([excludeSlug])
  const pull = async (cat: string | null) => {
    let q = supabase
      .from('landing_posts')
      .select(LIST_COLS)
      .eq('status', 'published')
      .neq('slug', excludeSlug)
      .order('published_at', { ascending: false })
      .limit(limit + 3)
    if (cat) q = q.eq('category', cat)
    const { data } = await q
    for (const p of (data ?? []) as Post[]) {
      if (!seen.has(p.slug) && out.length < limit) {
        out.push(p)
        seen.add(p.slug)
      }
    }
  }
  if (category) await pull(category) // prefer same category
  if (out.length < limit) await pull(null) // fill with latest
  if (lang === 'en' || out.length === 0) return out
  const { data: tr } = await supabase
    .from('landing_post_translations')
    .select('post_id,title,excerpt')
    .eq('lang', lang)
    .in('post_id', out.map((p) => p.id))
  const m = new Map((tr ?? []).map((t) => [(t as any).post_id, t as any]))
  return out.map((p) => {
    const t = m.get(p.id)
    return t ? { ...p, title: t.title || p.title, excerpt: t.excerpt || p.excerpt } : p
  })
}

export async function getPostBySlug(slug: string, lang = 'en'): Promise<Post | null> {
  const { data, error } = await supabase
    .from('landing_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()
  if (error) throw error
  const post = (data as Post) ?? null
  if (!post || lang === 'en') return post
  const t = await getTranslation(post.id, lang)
  return t
    ? {
        ...post,
        title: t.title || post.title,
        excerpt: t.excerpt || post.excerpt,
        body: t.body || post.body,
        meta_description: t.meta_description || post.meta_description,
      }
    : post
}

/* ── Admin (requires an authenticated session; RLS enforces it) ── */
export async function listAllPosts(): Promise<Post[]> {
  const { data, error } = await supabase
    .from('landing_posts')
    .select('id,slug,title,status,category,updated_at,published_at')
    .order('updated_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Post[]
}

export async function getPostById(id: string): Promise<Post | null> {
  const { data, error } = await supabase.from('landing_posts').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return (data as Post) ?? null
}

export async function createPost(input: PostInput): Promise<Post> {
  const { data, error } = await supabase.from('landing_posts').insert(input).select('*').single()
  if (error) throw error
  return data as Post
}

export async function updatePost(id: string, input: PostInput): Promise<Post> {
  const { data, error } = await supabase.from('landing_posts').update(input).eq('id', id).select('*').single()
  if (error) throw error
  return data as Post
}

export async function deletePost(id: string): Promise<void> {
  const { error } = await supabase.from('landing_posts').delete().eq('id', id)
  if (error) throw error
}

/* ── Translations (Gemini via /api/translate + landing_post_translations) ── */
export interface Translation {
  title: string
  excerpt: string
  meta_description: string
  body: string
}

export async function translateArticle(
  fields: { title?: string; excerpt?: string; meta_description?: string; body?: string },
  language: string,
): Promise<Translation> {
  const res = await fetch('/api/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...fields, language }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.error || 'Translation failed')
  return data as Translation
}

export async function saveTranslation(post_id: string, lang: string, t: Translation): Promise<void> {
  const { error } = await supabase
    .from('landing_post_translations')
    .upsert({ post_id, lang, ...t }, { onConflict: 'post_id,lang' })
  if (error) throw error
}

export async function getTranslatedLangs(post_id: string): Promise<string[]> {
  const { data, error } = await supabase.from('landing_post_translations').select('lang').eq('post_id', post_id)
  if (error) throw error
  return (data ?? []).map((r) => (r as { lang: string }).lang)
}

export async function getTranslation(post_id: string, lang: string): Promise<Translation | null> {
  const { data, error } = await supabase
    .from('landing_post_translations')
    .select('title,excerpt,meta_description,body')
    .eq('post_id', post_id)
    .eq('lang', lang)
    .maybeSingle()
  if (error) throw error
  return (data as Translation) ?? null
}

/* ── Image upload → public URL in the "landing-blog" bucket ── */

/** Resize + re-encode to WebP so 2MB AI PNGs become ~150-300KB → fast pages (Core Web Vitals).
 *  Falls back to the original on any failure or if WebP isn't smaller. */
async function compressImage(input: Blob): Promise<{ blob: Blob; ext: string }> {
  const rawExt = (input.type.split('/')[1] || 'png').replace('jpeg', 'jpg')
  try {
    if (!input.type.startsWith('image/') || /svg|gif/.test(input.type)) return { blob: input, ext: rawExt }
    const bmp = await createImageBitmap(input)
    const maxW = 1280
    const scale = Math.min(1, maxW / bmp.width)
    const w = Math.round(bmp.width * scale)
    const h = Math.round(bmp.height * scale)
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    canvas.getContext('2d')!.drawImage(bmp, 0, 0, w, h)
    bmp.close?.()
    const webp = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/webp', 0.82))
    if (webp && webp.size < input.size) return { blob: webp, ext: 'webp' }
  } catch {
    /* fall back to original */
  }
  return { blob: input, ext: rawExt }
}

export async function uploadImage(file: File): Promise<string> {
  const { blob, ext } = await compressImage(file)
  const safe = (file.name || 'image').replace(/\.[^.]+$/, '').replace(/[^a-z0-9]+/gi, '-').toLowerCase().slice(0, 40)
  const path = `${safe || 'image'}-${Math.round(performance.now())}.${ext}`
  const { error } = await supabase.storage
    .from('landing-blog')
    .upload(path, blob, { upsert: false, cacheControl: '31536000', contentType: blob.type || `image/${ext}` })
  if (error) throw error
  return supabase.storage.from('landing-blog').getPublicUrl(path).data.publicUrl
}

/* Download a data:/remote image URL and upload it (compressed to WebP) → public URL. */
export async function uploadImageFromUrl(url: string, name = 'ai-image'): Promise<string> {
  const blob = await (await fetch(url)).blob()
  const file = new File([blob], slugify(name) || 'ai-image', { type: blob.type || 'image/png' })
  return uploadImage(file)
}

/* ── AI generation (server endpoints — keys stay server-side) ── */
export interface GeneratedArticle {
  title: string
  slug?: string
  excerpt: string
  meta_description: string
  focus_keyword?: string
  category?: string
  tags?: string[]
  body: string
  image_prompts?: string[]
  image_queries?: string[]
}

/** Published posts (slug + title) the generator can link to internally. */
export async function listPublishedLinks(): Promise<{ slug: string; title: string }[]> {
  const { data, error } = await supabase
    .from('landing_posts')
    .select('slug,title')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(30)
  if (error) return []
  return (data ?? []) as { slug: string; title: string }[]
}

export async function generateArticle(input: {
  topic?: string
  keyword?: string
  links?: { slug: string; title: string }[]
}): Promise<GeneratedArticle> {
  // PROD (live) → Supabase Edge Function (no Netlify ~26s timeout; long articles fit).
  // DEV (localhost) → Vite middleware (.env keys).
  let data: any
  if (import.meta.env.PROD) {
    const { data: out, error } = await supabase.functions.invoke('generate-article', { body: input })
    if (error) {
      let msg = error.message || 'Article generation failed'
      try { const b = await (error as any)?.context?.json?.(); if (b?.error) msg = b.error } catch { /* keep msg */ }
      throw new Error(msg)
    }
    data = out
  } else {
    const res = await fetch('/api/generate-article', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data?.error || 'Article generation failed')
  }
  if (data?.error) throw new Error(data.error)
  return data as GeneratedArticle
}

export async function getImagePrompts(fields: { title?: string | null; excerpt?: string | null; body?: string | null }): Promise<string[]> {
  const res = await fetch('/api/image-prompts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fields),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.error || 'Could not build image prompts')
  return (data.prompts || []) as string[]
}

/** Generate one image → returns a usable image URL (data: URL for base64).
 *  `prompt` = scene for AI gen; `query` = short stock-photo search terms.
 *  DEV (localhost) uses the Vite middleware (.env keys). PROD (live) uses the
 *  Supabase Edge Function (no Netlify 10s timeout) — its OpenAI key is a Supabase secret. */
export async function generateImage(prompt: string, query?: string, size?: string): Promise<string> {
  let data: any
  if (import.meta.env.PROD) {
    const { data: out, error } = await supabase.functions.invoke('generate-image', { body: { prompt, query, size } })
    if (error) {
      let msg = error.message || 'Image generation failed'
      try { const b = await (error as any)?.context?.json?.(); if (b?.error) msg = b.error } catch { /* keep msg */ }
      throw new Error(msg)
    }
    data = out
  } else {
    const res = await fetch('/api/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, query, size }),
    })
    data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data?.error || 'Image generation failed')
  }
  if (data?.error) throw new Error(data.error)
  if (data?.b64) return `data:${data.mime || 'image/png'};base64,${data.b64}`
  if (data?.url) return data.url as string
  throw new Error('No image returned')
}

/** IndexNow — tell Bing/Yandex/Seznam (and indirectly Google) a post is new/updated
 *  so it gets crawled in minutes. Submits the English + all localized URLs. */
export async function pingIndexNow(slug: string): Promise<{ ok: boolean; submitted?: number; status?: number }> {
  try {
    const res = await fetch('/api/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
    })
    return await res.json().catch(() => ({ ok: false }))
  } catch {
    return { ok: false }
  }
}

/* ── Web push (bring readers back on new posts) ── */
const VAPID_PUBLIC = (import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined) || ''

function urlB64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(b64)
  const arr = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i)
  return arr
}

export function pushSupported(): boolean {
  return typeof navigator !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && !!VAPID_PUBLIC
}

export async function getPushState(): Promise<'subscribed' | 'default' | 'denied' | 'unsupported'> {
  if (!pushSupported()) return 'unsupported'
  if (Notification.permission === 'denied') return 'denied'
  try {
    const reg = await navigator.serviceWorker.getRegistration()
    const sub = reg ? await reg.pushManager.getSubscription() : null
    return sub ? 'subscribed' : 'default'
  } catch {
    return 'default'
  }
}

export async function subscribeToPush(lang = 'en'): Promise<'subscribed' | 'denied' | 'unsupported' | 'error'> {
  if (!pushSupported()) return 'unsupported'
  try {
    let reg = await navigator.serviceWorker.getRegistration()
    if (!reg) reg = await navigator.serviceWorker.register('/sw.js')
    await navigator.serviceWorker.ready
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return permission === 'denied' ? 'denied' : 'error'
    let sub = await reg.pushManager.getSubscription()
    if (!sub) {
      sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlB64ToUint8Array(VAPID_PUBLIC) })
    }
    const json: any = sub.toJSON()
    const { error } = await supabase
      .from('push_subscriptions')
      .insert({ endpoint: json.endpoint, p256dh: json.keys?.p256dh, auth: json.keys?.auth, lang })
    if (error && !/duplicate|unique|conflict/i.test(error.message || '')) return 'error'
    return 'subscribed' // duplicate = already subscribed = fine
  } catch {
    return 'error'
  }
}

/** Admin: push a new post to every subscriber. */
export async function sendPushToAll(payload: {
  title: string
  body?: string
  url?: string
  image?: string
}): Promise<{ sent: number; failed: number }> {
  const { data: subs } = await supabase.from('push_subscriptions').select('endpoint,p256dh,auth')
  if (!subs?.length) return { sent: 0, failed: 0 }
  const res = await fetch('/api/send-push', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subscriptions: subs, payload }),
  })
  const out = await res.json().catch(() => ({ sent: 0, failed: 0 }))
  if (out.gone?.length) await supabase.from('push_subscriptions').delete().in('endpoint', out.gone)
  return { sent: out.sent ?? 0, failed: out.failed ?? 0 }
}

/* ── Helpers ── */
export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 70)
}

export function estimateReadMinutes(body: string): number {
  const words = (body || '').trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}
