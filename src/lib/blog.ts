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
export async function uploadImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const safe = file.name.replace(/\.[^.]+$/, '').replace(/[^a-z0-9]+/gi, '-').toLowerCase().slice(0, 40)
  const path = `${safe || 'image'}-${Math.round(performance.now())}.${ext}`
  const { error } = await supabase.storage.from('landing-blog').upload(path, file, { upsert: false, cacheControl: '31536000' })
  if (error) throw error
  return supabase.storage.from('landing-blog').getPublicUrl(path).data.publicUrl
}

/* Download a data:/remote image URL and upload it to the bucket → public URL. */
export async function uploadImageFromUrl(url: string, name = 'ai-image'): Promise<string> {
  const blob = await (await fetch(url)).blob()
  const ext = (blob.type.split('/')[1] || 'png').replace('jpeg', 'jpg')
  const file = new File([blob], `${slugify(name) || 'ai-image'}.${ext}`, { type: blob.type || 'image/png' })
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
  const res = await fetch('/api/generate-article', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.error || 'Article generation failed')
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
 *  `prompt` = scene for AI gen; `query` = short stock-photo search terms (Pexels). */
export async function generateImage(prompt: string, query?: string, size?: string): Promise<string> {
  const res = await fetch('/api/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, query, size }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.error || 'Image generation failed')
  if (data.b64) return `data:${data.mime || 'image/png'};base64,${data.b64}`
  if (data.url) return data.url as string
  throw new Error('No image returned')
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
