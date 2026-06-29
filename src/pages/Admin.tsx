import { useCallback, useEffect, useRef, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { supabase, hasSupabase } from '../lib/supabase'
import {
  listAllPosts, getPostById, createPost, updatePost, deletePost, uploadImage,
  slugify, estimateReadMinutes, translateArticle, saveTranslation, getTranslatedLangs,
  generateArticle, getImagePrompts, generateImage, uploadImageFromUrl, listPublishedLinks, pingIndexNow, sendPushToAll,
  type Post, type PostInput, type PostStatus,
} from '../lib/blog'
import { TRANSLATE_LANGS } from '../lib/i18n'
import { Icon } from '../components/ui/Icon'
import { Logo } from '../components/ui/Logo'
import { formatArticle } from '../lib/format'
import { useSeo } from '../hooks/useSeo'

const input = 'w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-fg outline-none transition-colors focus:border-neon focus:ring-2 focus:ring-neon/20'
const btn = 'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50'
const btnPrimary = `${btn} bg-[linear-gradient(100deg,#720eec,#8b1fe0,#c000ff)] text-white`
const btnGhost = `${btn} border border-line bg-surface text-fg hover:border-neon/40`
const label = 'mb-1.5 block text-xs font-semibold uppercase tracking-wider text-faint'

/* ────────────────────────────── Login ────────────────────────────── */
function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setBusy(false)
  }

  return (
    <div className="grid min-h-dvh place-items-center bg-canvas p-5">
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl border border-line bg-surface p-7 shadow-xl">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <Logo className="h-8" />
          <p className="text-sm text-muted">Sign in to manage the blog</p>
        </div>
        <label className={label}>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" className={input} />
        <label className={`${label} mt-4`}>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" className={input} />
        {error && <p className="mt-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
        <button type="submit" disabled={busy} className={`${btnPrimary} mt-6 w-full`}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}

/* ───────────────────────────── SEO panel ─────────────────────────── */
function seoChecks(f: PostInput) {
  const kw = (f.focus_keyword || '').toLowerCase().trim()
  const kwSlug = kw.replace(/\s+/g, '-')
  const body = f.body || ''
  const intro = body.slice(0, 300).toLowerCase()
  const words = body.trim().split(/\s+/).filter(Boolean).length
  const t = (f.title || '').length
  const m = (f.meta_description || '').length
  return [
    { ok: !!kw && (f.title || '').toLowerCase().includes(kw), label: 'Focus keyword in the title' },
    { ok: !!kw && intro.includes(kw), label: 'Keyword in the intro' },
    { ok: !!kw && (f.slug || '').toLowerCase().includes(kwSlug), label: 'Keyword in the URL' },
    { ok: !!kw && (f.meta_description || '').toLowerCase().includes(kw), label: 'Keyword in meta description' },
    { ok: t >= 30 && t <= 60, label: `Title length (${t}/60)` },
    { ok: m >= 120 && m <= 160, label: `Meta description (${m}/160)` },
    { ok: words >= 300, label: `Body ${words} words (≥300)` },
    { ok: /(^|\n)#{2,3}\s/.test(body), label: 'Has a subheading (##)' },
    { ok: !!f.cover_image, label: 'Cover image set' },
  ]
}

function SeoPanel({ form, onKeyword }: { form: PostInput; onKeyword: (v: string) => void }) {
  const checks = seoChecks(form)
  const score = checks.filter((c) => c.ok).length
  const pct = Math.round((score / checks.length) * 100)
  const color = pct >= 80 ? 'text-volt' : pct >= 50 ? 'text-warn' : 'text-danger'
  const t = (form.title || '').length
  const m = (form.meta_description || '').length

  return (
    <div className="mt-5 rounded-2xl border border-line bg-canvas/40 p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-faint">SEO assistant</span>
        <span className={`text-sm font-bold ${color}`}>{score}/{checks.length} · {pct}%</span>
      </div>

      <label className={`${label} mt-3`}>Focus keyword</label>
      <input value={form.focus_keyword ?? ''} onChange={(e) => onKeyword(e.target.value)} className={input} placeholder="e.g. watch world cup in 4k" />

      <p className="mb-1.5 mt-4 text-xs font-semibold uppercase tracking-wider text-faint">Google preview</p>
      <div className="rounded-xl border border-line bg-surface p-3">
        <p className="truncate text-xs text-[#4d5156]">helliptv.com › blog › {form.slug || '…'}</p>
        <p className="truncate text-base text-[#1a0dab]">{form.title || 'Your title'} · HellIPTV</p>
        <p className="line-clamp-2 text-sm text-[#4d5156]">{form.meta_description || 'Your meta description preview shows here…'}</p>
      </div>
      <div className="mt-2 flex gap-4 text-[11px]">
        <span className={t > 60 ? 'text-danger' : 'text-faint'}>Title {t}/60</span>
        <span className={m > 160 ? 'text-danger' : 'text-faint'}>Description {m}/160</span>
      </div>

      <ul className="mt-4 grid gap-1.5 sm:grid-cols-2">
        {checks.map((c) => (
          <li key={c.label} className={`flex items-center gap-2 text-[13px] ${c.ok ? 'text-fg' : 'text-faint'}`}>
            <span className={`grid h-4 w-4 shrink-0 place-items-center rounded-full ${c.ok ? 'bg-volt text-white' : 'bg-surface-2 text-faint'}`}>
              <Icon name={c.ok ? 'check' : 'close'} size={10} />
            </span>
            {c.label}
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ─────────────────────────── Translations ────────────────────────── */
function TranslationsPanel({ id, form }: { id: string; form: PostInput }) {
  const [done, setDone] = useState<string[]>([])
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getTranslatedLangs(id).then(setDone).catch(() => {})
  }, [id])

  const fields = () => ({
    title: form.title,
    excerpt: form.excerpt,
    meta_description: form.meta_description,
    body: form.body,
  })

  const run = async (code: string, name: string) => {
    const t = await translateArticle(fields(), name)
    await saveTranslation(id, code, t)
    setDone((d) => [...new Set([...d, code])])
  }

  const one = async (l: { code: string; name: string }) => {
    setBusy(l.code); setError(null)
    try { await run(l.code, l.name) } catch (e: any) { setError(`${l.code}: ${e?.message || 'failed'}`) }
    setBusy(null)
  }

  const all = async () => {
    setBusy('all'); setError(null)
    for (const l of TRANSLATE_LANGS) {
      try { await run(l.code, l.name) } catch (e: any) { setError(`${l.code}: ${e?.message || 'failed'}`); break }
    }
    setBusy(null)
  }

  return (
    <div className="mt-5 rounded-2xl border border-line bg-canvas/40 p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-faint">
          Translations · {done.length}/{TRANSLATE_LANGS.length}
        </span>
        <button type="button" disabled={!!busy} onClick={all} className={`${btnPrimary} px-3 py-1.5 text-xs`}>
          {busy === 'all' ? 'Translating…' : 'Translate all'}
        </button>
      </div>
      <p className="mt-1.5 text-xs text-faint">Translates the current article. Click a language to (re)do just that one.</p>
      {error && <p className="mt-2 rounded-lg bg-danger/10 px-3 py-2 text-xs text-danger">{error}</p>}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {TRANSLATE_LANGS.map((l) => {
          const ok = done.includes(l.code)
          return (
            <button
              key={l.code}
              type="button"
              disabled={!!busy}
              onClick={() => one(l)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors ${
                ok ? 'border-volt/40 bg-volt/10 text-volt' : 'border-line text-muted hover:border-neon/40'
              }`}
            >
              {busy === l.code ? (
                <span className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
              ) : ok ? (
                <Icon name="check" size={11} />
              ) : null}
              {l.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ────────────────────────────── Editor ───────────────────────────── */
const EMPTY: PostInput = { title: '', slug: '', excerpt: '', body: '', category: '', author: 'HellIPTV Team', tags: [], status: 'draft', cover_image: '', meta_description: '', focus_keyword: '' }

/* Drop generated images into the Markdown body — before spread-out "## " headings,
   leftovers appended at the end. */
function insertImages(body: string, items: { url: string; alt?: string }[]): string {
  if (!items.length) return body
  const md = (it: { url: string; alt?: string }) =>
    `![${(it.alt || 'IPTV illustration').replace(/[[\]]/g, '').slice(0, 90)}](${it.url})`
  const lines = body.split('\n')
  const heads: number[] = []
  for (let i = 0; i < lines.length; i++) if (/^##\s/.test(lines[i])) heads.push(i)
  const slots: number[] = []
  if (heads.length >= 2) slots.push(heads[1])
  if (heads.length >= 4) slots.push(heads[3])
  else if (heads.length >= 3) slots.push(heads[2])
  const placed = Math.min(slots.length, items.length)
  const ordered = slots
    .slice(0, placed)
    .map((at, k) => ({ at, it: items[k] }))
    .sort((a, b) => b.at - a.at)
  for (const { at, it } of ordered) lines.splice(at, 0, '', md(it), '')
  let out = lines.join('\n')
  if (placed < items.length) out += '\n\n' + items.slice(placed).map(md).join('\n\n') + '\n'
  return out
}

function ToolBtn({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()} // keep the textarea selection
      onClick={onClick}
      className="grid h-7 min-w-[1.75rem] place-items-center rounded-md px-1.5 text-[13px] font-semibold text-muted transition-colors hover:bg-surface-2 hover:text-fg"
    >
      {children}
    </button>
  )
}

const toolSelect = 'h-7 rounded-md border border-line bg-surface px-1.5 text-xs text-muted outline-none hover:border-neon/40'

function Editor({ id, onDone }: { id: string | null; onDone: () => void }) {
  const [form, setForm] = useState<PostInput>(EMPTY)
  const [tagsText, setTagsText] = useState('')
  const [slugLocked, setSlugLocked] = useState(false)
  const [wasPublished, setWasPublished] = useState(false)
  const [tab, setTab] = useState<'write' | 'preview'>('write')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const coverInput = useRef<HTMLInputElement>(null)
  const bodyInput = useRef<HTMLInputElement>(null)
  const bodyRef = useRef<HTMLTextAreaElement>(null)
  const [aiTopic, setAiTopic] = useState('')
  const [aiBusy, setAiBusy] = useState<'article' | 'images' | 'all' | null>(null)
  const [aiStatus, setAiStatus] = useState<string | null>(null)
  const [imgPrompts, setImgPrompts] = useState<string[] | null>(null)
  const [imgQueries, setImgQueries] = useState<string[] | null>(null)

  useEffect(() => {
    if (!id) return
    getPostById(id).then((p) => {
      if (!p) return
      setForm({
        title: p.title, slug: p.slug, excerpt: p.excerpt ?? '', body: p.body ?? '', category: p.category ?? '',
        author: p.author ?? 'HellIPTV Team', tags: p.tags ?? [], status: p.status, cover_image: p.cover_image ?? '',
        meta_description: p.meta_description ?? '', focus_keyword: p.focus_keyword ?? '', published_at: p.published_at ?? null,
      })
      setTagsText((p.tags ?? []).join(', '))
      setSlugLocked(true)
      setWasPublished(p.status === 'published')
    })
  }, [id])

  const set = (patch: PostInput) => setForm((f) => ({ ...f, ...patch }))

  const onTitle = (v: string) => set({ title: v, ...(slugLocked ? {} : { slug: slugify(v) }) })

  const upload = async (file: File, target: 'cover' | 'body') => {
    setBusy(true); setError(null)
    try {
      const url = await uploadImage(file)
      if (target === 'cover') set({ cover_image: url })
      else set({ body: `${form.body ?? ''}\n\n![](${url})\n` })
    } catch (e: any) {
      setError(e?.message ?? 'Upload failed')
    }
    setBusy(false)
  }

  /* AI: write a full structured article, then auto-format it. */
  const genArticle = async () => {
    const topic = (aiTopic || form.title || '').trim()
    setAiBusy('article'); setError(null); setAiStatus('Writing a long, SEO article with internal links… (~30s)')
    try {
      const links = (await listPublishedLinks()).filter((l) => l.slug !== form.slug)
      const a = await generateArticle({ topic, keyword: form.focus_keyword || '', links })
      const body = formatArticle(a.body || '', a.focus_keyword || form.focus_keyword || '')
      setForm((f) => ({
        ...f,
        title: a.title || f.title,
        slug: slugLocked && f.slug ? f.slug : slugify(a.slug || a.title || f.title || 'post'),
        excerpt: a.excerpt || f.excerpt,
        body,
        meta_description: a.meta_description || f.meta_description,
        focus_keyword: a.focus_keyword || f.focus_keyword,
        category: a.category || f.category,
        tags: a.tags?.length ? a.tags : f.tags,
      }))
      if (a.tags?.length) setTagsText(a.tags.join(', '))
      if (a.image_prompts?.length) { setImgPrompts(a.image_prompts.slice(0, 3)); setImgQueries(a.image_queries?.slice(0, 3) || null) }
      setAiStatus(null)
    } catch (e: any) {
      setError(e?.message || 'Article generation failed'); setAiStatus(null)
    }
    setAiBusy(null)
  }

  /* AI: 3 related images → cover + in-body, uploaded to storage. */
  const genImages = async () => {
    if (!form.title && !form.body) { setError('Add a title or generate an article first.'); return }
    setAiBusy('images'); setError(null)
    try {
      let prompts = imgPrompts
      let queries = imgQueries
      if (!prompts?.length) {
        setAiStatus('Thinking up 3 scenes…')
        prompts = await getImagePrompts({ title: form.title, excerpt: form.excerpt, body: form.body })
        queries = null
      }
      const hadCover = !!form.cover_image
      const urls: string[] = []
      for (let i = 0; i < prompts.length; i++) {
        setAiStatus(`Generating image ${i + 1}/${prompts.length}…`)
        const dataUrl = await generateImage(prompts[i], queries?.[i])
        setAiStatus(`Uploading image ${i + 1}/${prompts.length}…`)
        urls.push(await uploadImageFromUrl(dataUrl, `${slugify(form.title || 'image')}-${i + 1}`))
      }
      const bodyUrls = hadCover ? urls : urls.slice(1)
      const bodyAlts = hadCover ? prompts : prompts.slice(1)
      setForm((f) => ({
        ...f,
        cover_image: f.cover_image || urls[0],
        body: insertImages(f.body || '', bodyUrls.map((u, i) => ({ url: u, alt: bodyAlts[i] }))),
      }))
      setImgPrompts(null); setImgQueries(null)
      setAiStatus(null)
    } catch (e: any) {
      setError(e?.message || 'Image generation failed'); setAiStatus(null)
    }
    setAiBusy(null)
  }

  /* AI: full SEO article + cover image + 2 in-body images — all from the title, one click. */
  const genEverything = async () => {
    const topic = (aiTopic || form.title || '').trim()
    if (!topic) { setError('Type a title or topic first.'); return }
    setAiBusy('all'); setError(null)
    let articleDone = false
    try {
      setAiStatus('Writing a long, SEO article with internal links… (~30s)')
      const links = (await listPublishedLinks()).filter((l) => l.slug !== form.slug)
      const a = await generateArticle({ topic, keyword: form.focus_keyword || '', links })
      const body0 = formatArticle(a.body || '', a.focus_keyword || form.focus_keyword || '')
      setForm((f) => ({
        ...f,
        title: a.title || f.title,
        slug: slugLocked && f.slug ? f.slug : slugify(a.slug || a.title || f.title || 'post'),
        excerpt: a.excerpt || f.excerpt,
        body: body0,
        meta_description: a.meta_description || f.meta_description,
        focus_keyword: a.focus_keyword || f.focus_keyword,
        category: a.category || f.category,
        tags: a.tags?.length ? a.tags : f.tags,
      }))
      if (a.tags?.length) setTagsText(a.tags.join(', '))
      articleDone = true

      const prompts = a.image_prompts?.length
        ? a.image_prompts.slice(0, 3)
        : await getImagePrompts({ title: a.title, excerpt: a.excerpt, body: a.body })
      const queries = a.image_queries?.slice(0, 3) || []
      const urls: string[] = []
      for (let i = 0; i < prompts.length; i++) {
        setAiStatus(`Generating image ${i + 1}/${prompts.length}…`)
        const dataUrl = await generateImage(prompts[i], queries[i])
        urls.push(await uploadImageFromUrl(dataUrl, `${slugify(a.title || 'image')}-${i + 1}`))
      }
      setForm((f) => ({
        ...f,
        cover_image: urls[0] || f.cover_image,
        body: insertImages(body0, urls.slice(1).map((u, i) => ({ url: u, alt: prompts[i + 1] }))),
      }))
      setAiStatus(null)
    } catch (e: any) {
      const msg = e?.message || 'Generation failed'
      setError(articleDone ? `Article created ✓ — but images failed: ${msg}` : msg)
      setAiStatus(null)
    }
    setAiBusy(null)
  }

  /* ── Body formatting toolbar (operates on the textarea selection) ── */
  const editBody = (fn: (sel: string, before: string, after: string) => { body: string; start: number; end: number }) => {
    const ta = bodyRef.current
    const full = form.body || ''
    const s = ta?.selectionStart ?? full.length
    const e = ta?.selectionEnd ?? full.length
    const r = fn(full.slice(s, e), full.slice(0, s), full.slice(e))
    set({ body: r.body })
    requestAnimationFrame(() => { ta?.focus(); ta?.setSelectionRange(r.start, r.end) })
  }
  const wrap = (open: string, close: string, ph = 'text') =>
    editBody((sel, before, after) => {
      const inner = sel || ph
      const start = before.length + open.length
      return { body: before + open + inner + close + after, start, end: start + inner.length }
    })
  const prefixLines = (prefix: string) =>
    editBody((sel, before, after) => {
      const block = (sel || 'text').split('\n').map((l) => prefix + l.replace(/^\s*(?:#{1,6}\s+|[-*]\s+|>\s+)/, '')).join('\n')
      return { body: before + block + after, start: before.length, end: before.length + block.length }
    })
  const alignBlock = (align: string) =>
    editBody((sel, before, after) => {
      const inner = sel || 'text'
      const open = `<div style="text-align:${align}">\n\n`
      const start = before.length + open.length
      return { body: before + open + inner + '\n\n</div>\n' + after, start, end: start + inner.length }
    })
  const styleWrap = (css: string) => wrap(`<span style="${css}">`, '</span>')

  const save = async (status: PostStatus) => {
    setBusy(true); setError(null)
    try {
      const tags = tagsText.split(',').map((t) => t.trim()).filter(Boolean)
      const payload: PostInput = {
        ...form,
        slug: form.slug || slugify(form.title || 'post'),
        tags,
        status,
        read_minutes: estimateReadMinutes(form.body ?? ''),
        published_at: status === 'published' ? form.published_at ?? new Date().toISOString() : form.published_at ?? null,
      }
      if (id) await updatePost(id, payload)
      else await createPost(payload)
      if (status === 'published' && payload.slug) {
        // Instant indexing on publish (non-fatal).
        try { await pingIndexNow(payload.slug) } catch { /* ignore */ }
        // Push subscribers only when a post goes live for the first time (not on edits).
        if (!wasPublished) {
          try {
            await sendPushToAll({
              title: payload.title || 'New on HellIPTV',
              body: payload.excerpt || 'A new article just dropped.',
              url: `/blog/${payload.slug}`,
              image: payload.cover_image || undefined,
            })
          } catch { /* ignore */ }
        }
      }
      onDone()
    } catch (e: any) {
      setError(e?.message ?? 'Save failed')
      setBusy(false)
    }
  }

  const removeArticle = async () => {
    if (!id) return
    if (!confirm('Delete this article permanently? This cannot be undone.')) return
    setBusy(true); setError(null)
    try {
      await deletePost(id)
      onDone()
    } catch (e: any) {
      setError(e?.message ?? 'Delete failed'); setBusy(false)
    }
  }

  const submitToSearch = async () => {
    if (!form.slug) { setError('Save the post first (it needs a slug).'); return }
    setBusy(true); setError(null)
    const r = await pingIndexNow(form.slug)
    setBusy(false)
    alert(r.ok
      ? `✓ Submitted ${r.submitted ?? ''} URLs to IndexNow (Bing, Yandex, Seznam…). Google picks the signal up too — expect crawling within minutes.`
      : `IndexNow submit failed (${r.status ?? 'network'}). Try again in a moment.`)
  }

  return (
    <div className="mx-auto max-w-3xl">
      <button onClick={onDone} className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
        <Icon name="arrow" size={15} className="rotate-180" /> Back to posts
      </button>

      <div className="rounded-3xl border border-line bg-surface p-6 sm:p-8">
        {/* ── AI Studio ── */}
        <div className="mb-6 rounded-2xl border border-neon/30 bg-neon/5 p-4">
          <div className="flex items-center gap-2">
            <Icon name="sparkles" size={15} className="text-neon" />
            <span className="text-xs font-semibold uppercase tracking-wider text-neon">AI Studio</span>
          </div>
          <p className="mt-1.5 text-xs text-faint">
            Type a title → a long, SEO-ready article <span className="font-semibold text-muted">plus</span> 3 images (cover + 2 in-article), in one click.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              className={input}
              placeholder="Article title, e.g. “Best IPTV for Firestick in 2026” — or leave blank to use the Title field"
            />
            <button type="button" disabled={!!aiBusy || busy} onClick={genEverything} className={`${btnPrimary} shrink-0`}>
              <Icon name="sparkles" size={15} /> {aiBusy === 'all' ? 'Generating…' : 'Generate article + images'}
            </button>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
            <span className="text-faint">or just:</span>
            <button type="button" disabled={!!aiBusy || busy} onClick={genArticle} className="font-semibold text-neon hover:underline disabled:opacity-50">
              {aiBusy === 'article' ? 'Writing…' : 'Article only'}
            </button>
            <span className="text-faint">·</span>
            <button type="button" disabled={!!aiBusy || busy} onClick={genImages} className="font-semibold text-neon hover:underline disabled:opacity-50">
              {aiBusy === 'images' ? 'Generating…' : 'Images only'}
            </button>
            {aiStatus && (
              <span className="inline-flex items-center gap-1.5 text-neon">
                <span className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
                {aiStatus}
              </span>
            )}
          </div>
        </div>

        <div>
          <label className={label}>Title</label>
          <input value={form.title ?? ''} onChange={(e) => onTitle(e.target.value)} className={input} placeholder="Article title" />
        </div>

        <div className="mt-4">
          <label className={label}>Slug · /blog/{form.slug || '…'}</label>
          <input value={form.slug ?? ''} onChange={(e) => { setSlugLocked(true); set({ slug: slugify(e.target.value) }) }} className={input} />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>Category</label>
            <input value={form.category ?? ''} onChange={(e) => set({ category: e.target.value })} className={input} placeholder="Guides" />
          </div>
          <div>
            <label className={label}>Tags (comma-separated)</label>
            <input value={tagsText} onChange={(e) => setTagsText(e.target.value)} className={input} placeholder="4K, Streaming" />
          </div>
        </div>

        <div className="mt-4">
          <label className={label}>Excerpt</label>
          <textarea value={form.excerpt ?? ''} onChange={(e) => set({ excerpt: e.target.value })} rows={2} className={`${input} resize-y`} placeholder="One-line summary shown on cards" />
        </div>

        <div className="mt-4">
          <label className={label}>Cover image</label>
          <div className="flex items-center gap-3">
            {form.cover_image ? (
              <img src={form.cover_image} alt="" className="h-16 w-28 rounded-lg object-cover ring-1 ring-line" />
            ) : (
              <div className="grid h-16 w-28 place-items-center rounded-lg border border-dashed border-line text-faint"><Icon name="play" size={18} /></div>
            )}
            <input ref={coverInput} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], 'cover')} />
            <button type="button" onClick={() => coverInput.current?.click()} className={btnGhost}>
              <Icon name="download" size={15} /> Upload cover
            </button>
            {form.cover_image && <button type="button" onClick={() => set({ cover_image: '' })} className="text-sm text-faint hover:text-danger">Remove</button>}
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between">
            <span className={label.replace('mb-1.5 block', 'inline-block')}>Body (Markdown)</span>
            <div className="flex gap-1">
              {(['write', 'preview'] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)} className={`rounded-lg px-3 py-1 text-xs font-semibold capitalize ${tab === t ? 'bg-neon/10 text-neon' : 'text-faint hover:text-fg'}`}>{t}</button>
              ))}
              <button
                type="button"
                onClick={() => set({ body: formatArticle(form.body || '', form.focus_keyword || '') })}
                title="Tidy spacing, punctuation & headings, and bold the focus keyword"
                className="ml-1 inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-neon hover:bg-neon/10"
              >
                <Icon name="sparkles" size={12} /> Format
              </button>
              <input ref={bodyInput} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], 'body')} />
              <button type="button" onClick={() => bodyInput.current?.click()} className="rounded-lg px-3 py-1 text-xs font-semibold text-faint hover:text-fg">+ Image</button>
            </div>
          </div>
          {tab === 'write' ? (
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-1 rounded-xl border border-line bg-canvas/40 p-1.5">
                <ToolBtn onClick={() => wrap('**', '**', 'bold')} title="Bold"><b>B</b></ToolBtn>
                <ToolBtn onClick={() => wrap('*', '*', 'italic')} title="Italic"><span className="italic">I</span></ToolBtn>
                <span className="mx-0.5 h-5 w-px bg-line" />
                <ToolBtn onClick={() => prefixLines('## ')} title="Heading">H2</ToolBtn>
                <ToolBtn onClick={() => prefixLines('### ')} title="Subheading">H3</ToolBtn>
                <ToolBtn onClick={() => prefixLines('- ')} title="Bullet list">• List</ToolBtn>
                <ToolBtn onClick={() => prefixLines('> ')} title="Quote">❝</ToolBtn>
                <span className="mx-0.5 h-5 w-px bg-line" />
                <ToolBtn onClick={() => alignBlock('left')} title="Align left">⇤</ToolBtn>
                <ToolBtn onClick={() => alignBlock('center')} title="Center text">↔</ToolBtn>
                <ToolBtn onClick={() => alignBlock('right')} title="Align right">⇥</ToolBtn>
                <span className="mx-0.5 h-5 w-px bg-line" />
                <select defaultValue="" title="Text size" onChange={(e) => { if (e.target.value) styleWrap(`font-size:${e.target.value}`); e.currentTarget.value = '' }} className={toolSelect}>
                  <option value="" disabled>Size</option>
                  <option value="0.85em">Small</option>
                  <option value="1.25em">Large</option>
                  <option value="1.6em">Huge</option>
                </select>
                <select defaultValue="" title="Font / typography" onChange={(e) => { if (e.target.value) styleWrap(`font-family:${e.target.value}`); e.currentTarget.value = '' }} className={toolSelect}>
                  <option value="" disabled>Font</option>
                  <option value="Georgia, 'Times New Roman', serif">Serif</option>
                  <option value="system-ui, sans-serif">Sans</option>
                  <option value="'Courier New', ui-monospace, monospace">Mono</option>
                </select>
                <span className="mx-0.5 h-5 w-px bg-line" />
                {['#e11d48', '#f59e0b', '#10b981', '#3b82f6', '#a855f7'].map((c) => (
                  <button key={c} type="button" title={`Color ${c}`} onMouseDown={(ev) => ev.preventDefault()} onClick={() => styleWrap(`color:${c}`)} style={{ backgroundColor: c }} className="h-6 w-6 rounded-md ring-1 ring-inset ring-line" />
                ))}
                <input type="color" title="Custom color" onChange={(e) => styleWrap(`color:${e.target.value}`)} className="h-6 w-7 cursor-pointer rounded-md border border-line bg-surface p-0.5" />
              </div>
              <textarea ref={bodyRef} value={form.body ?? ''} onChange={(e) => set({ body: e.target.value })} rows={16} className={`${input} resize-y font-mono-nums`} placeholder={'## Heading\n\nWrite in **Markdown** — then select text and use the toolbar to center it, change color, size or font.'} />
            </div>
          ) : (
            <div className="prose prose-zinc min-h-[16rem] max-w-none rounded-xl border border-line bg-canvas/40 p-4 prose-headings:font-display prose-a:text-neon prose-img:rounded-xl">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{form.body || '_Nothing to preview yet._'}</ReactMarkdown>
            </div>
          )}
        </div>

        <div className="mt-4">
          <label className={label}>Meta description (SEO)</label>
          <textarea value={form.meta_description ?? ''} onChange={(e) => set({ meta_description: e.target.value })} rows={2} className={`${input} resize-y`} placeholder="~155 characters for Google" />
        </div>

        <SeoPanel form={form} onKeyword={(v) => set({ focus_keyword: v })} />

        {id && <TranslationsPanel id={id} form={form} />}

        {error && <p className="mt-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button disabled={busy} onClick={() => save('published')} className={btnPrimary}>
            <Icon name="check" size={16} /> {busy ? 'Saving…' : 'Publish'}
          </button>
          <button disabled={busy} onClick={() => save('draft')} className={btnGhost}>Save as draft</button>
          {id && (
            <button disabled={busy} onClick={submitToSearch} className={`${btnGhost} text-sm`} title="IndexNow — instant Bing / Yandex / Seznam indexing (Google picks it up too)">
              <Icon name="sparkles" size={15} /> Submit to search engines
            </button>
          )}
          {id && (
            <button disabled={busy} onClick={removeArticle} className={`${btn} ml-auto border border-danger/40 text-danger hover:bg-danger/10`}>
              <Icon name="close" size={16} /> Delete article
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/* ────────────────────────────── List ─────────────────────────────── */
/* High-traffic IPTV blog topics — each targets a real search query. */
const SUGGESTED_TOPICS = [
  'Best IPTV service for Firestick in 2026',
  'How to stop IPTV buffering: fixes that actually work',
  'IPTV vs Cable TV: which saves you more in 2026',
  'How to set up IPTV on Samsung & LG Smart TVs',
  'Watch live football on IPTV: the complete guide',
  'Best 4K IPTV setup for sports fans',
  'IPTV on Apple TV: setup and best apps',
  'How to use a VPN with IPTV (and why you should)',
  'Xtream Codes vs M3U: what is the difference',
  'Best IPTV for movies and series (VOD) in 2026',
  'How to fix IPTV not working on Firestick',
  'IPTV EPG guide: get a working TV guide',
  'Best IPTV players for Android TV',
  'How many devices can one IPTV subscription use',
  'IPTV for families: parental controls & multi-screen',
  'How to install and set up TiviMate',
  'IPTV free trial: how to test before you buy',
  'Best player settings for smooth, lag-free 4K IPTV',
]

/* Bulk "content factory" — generate many keyword-targeted drafts in one go. */
function BulkGenerate({ onDone }: { onDone: () => void }) {
  const [open, setOpen] = useState(false)
  const [topics, setTopics] = useState('')
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  const suggest = () => {
    const picks = [...SUGGESTED_TOPICS].sort(() => Math.random() - 0.5).slice(0, 10)
    setTopics((t) => (t.trim() ? t.trim() + '\n' : '') + picks.join('\n'))
  }

  const run = async () => {
    const list = topics.split('\n').map((s) => s.trim()).filter(Boolean).slice(0, 25)
    if (!list.length) return
    setBusy(true)
    let ok = 0
    let fail = 0
    let links: { slug: string; title: string }[] = []
    try { links = await listPublishedLinks() } catch { /* ignore */ }
    for (let i = 0; i < list.length; i++) {
      setStatus(`Writing ${i + 1}/${list.length}: ${list[i].slice(0, 44)}…`)
      try {
        const a = await generateArticle({ topic: list[i], links })
        const body = formatArticle(a.body || '', a.focus_keyword || '')
        await createPost({
          title: a.title || list[i],
          slug: slugify(a.slug || a.title || list[i]),
          excerpt: a.excerpt || '',
          body,
          meta_description: a.meta_description || '',
          focus_keyword: a.focus_keyword || '',
          category: a.category || 'Guides',
          tags: a.tags?.length ? a.tags : [],
          author: 'HellIPTV Team',
          status: 'draft',
          read_minutes: estimateReadMinutes(body),
        })
        ok++
      } catch { fail++ }
    }
    setBusy(false)
    setStatus(null)
    setTopics('')
    onDone()
    alert(`Done — ${ok} draft${ok === 1 ? '' : 's'} created${fail ? `, ${fail} failed` : ''}.\n\nReview each one, add images if you like, then Publish — every publish auto-submits to IndexNow.`)
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className={`${btnGhost} text-sm`}>
        <Icon name="sparkles" size={15} /> Bulk generate
      </button>
    )
  }
  return (
    <div className="mb-6 rounded-2xl border border-neon/30 bg-neon/5 p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-neon">⚡ Content Studio — bulk generate</span>
        <button onClick={() => setOpen(false)} className="text-faint hover:text-fg"><Icon name="close" size={16} /></button>
      </div>
      <p className="mt-1.5 text-xs text-faint">
        One topic per line → a full SEO article (with internal links) is drafted for each. More quality articles = more keywords you rank for = more traffic.
        <span className="text-muted"> They save as drafts — review &amp; publish the good ones (quality beats quantity).</span>
      </p>
      <textarea
        value={topics}
        onChange={(e) => setTopics(e.target.value)}
        rows={6}
        disabled={busy}
        className={`${input} mt-3 resize-y font-mono-nums`}
        placeholder={'Best IPTV for Firestick in 2026\nHow to stop IPTV buffering\nIPTV vs Cable: which is better'}
      />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button type="button" disabled={busy} onClick={suggest} className={`${btnGhost} text-sm`}>+ Suggest 10 topics</button>
        <button type="button" disabled={busy || !topics.trim()} onClick={run} className={btnPrimary}>
          <Icon name="sparkles" size={15} /> {busy ? 'Generating…' : `Generate ${topics.split('\n').filter((s) => s.trim()).length || ''} drafts`}
        </button>
        {status && (
          <span className="inline-flex items-center gap-1.5 text-xs text-neon">
            <span className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
            {status}
          </span>
        )}
      </div>
      <p className="mt-2 text-[11px] text-faint">~30-60s per article — keep this tab open. Runs without a time limit on localhost.</p>
    </div>
  )
}

function PostList({ onEdit, onNew }: { onEdit: (id: string) => void; onNew: () => void }) {
  const [posts, setPosts] = useState<Post[] | null>(null)
  const load = useCallback(() => { listAllPosts().then(setPosts).catch(() => setPosts([])) }, [])
  useEffect(() => { load() }, [load])

  const remove = async (id: string) => {
    if (!confirm('Delete this post permanently?')) return
    await deletePost(id)
    load()
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-fg">Posts</h1>
        <button onClick={onNew} className={btnPrimary}><Icon name="sparkles" size={16} /> New post</button>
      </div>
      <div className="mb-6"><BulkGenerate onDone={load} /></div>

      {posts === null ? (
        <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-surface-3" />)}</div>
      ) : posts.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface p-10 text-center text-muted">No posts yet — create your first one.</div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
          {posts.map((p) => (
            <div key={p.id} className="flex items-center gap-3 border-b border-line px-4 py-3 last:border-0">
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${p.status === 'published' ? 'bg-volt/15 text-volt' : 'bg-surface-2 text-faint'}`}>{p.status}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-fg">{p.title}</p>
                <p className="truncate text-xs text-faint">/blog/{p.slug}{p.category ? ` · ${p.category}` : ''}</p>
              </div>
              {p.status === 'published' && (
                <a href={`/blog/${p.slug}`} target="_blank" rel="noopener noreferrer" className="rounded-lg p-2 text-faint hover:text-fg" title="View"><Icon name="arrow" size={15} /></a>
              )}
              <button onClick={() => onEdit(p.id)} className="rounded-lg px-3 py-1.5 text-sm font-medium text-neon hover:bg-neon/10">Edit</button>
              <button onClick={() => remove(p.id)} className="rounded-lg p-2 text-faint hover:text-danger" title="Delete"><Icon name="close" size={16} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ────────────────────────────── Shell ────────────────────────────── */
export function Admin() {
  useSeo({ title: 'Admin', description: 'HellIPTV blog admin', path: '/admin', noindex: true })
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [view, setView] = useState<{ mode: 'list' } | { mode: 'edit'; id: string | null }>({ mode: 'list' })

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  if (!hasSupabase) {
    return <div className="grid min-h-dvh place-items-center bg-canvas p-6 text-center text-muted">Supabase isn’t configured. Add <code className="mx-1 font-mono-nums">VITE_SUPABASE_URL</code> and <code className="mx-1 font-mono-nums">VITE_SUPABASE_ANON_KEY</code> to <code className="mx-1 font-mono-nums">.env.local</code>.</div>
  }
  if (session === undefined) return <div className="grid min-h-dvh place-items-center bg-canvas text-muted">Loading…</div>
  if (!session) return <Login />

  return (
    <div className="min-h-dvh bg-canvas">
      <header className="sticky top-0 z-10 border-b border-line bg-surface/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
          <button onClick={() => setView({ mode: 'list' })} className="flex items-center gap-2">
            <Logo className="h-7" />
            <span className="text-sm font-semibold text-faint">Blog admin</span>
          </button>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-faint sm:block">{session.user.email}</span>
            <button onClick={() => supabase.auth.signOut()} className="rounded-lg border border-line px-3 py-1.5 font-medium text-muted hover:text-fg">Sign out</button>
          </div>
        </div>
      </header>

      <main className="px-5 py-8">
        {view.mode === 'list' ? (
          <PostList onNew={() => setView({ mode: 'edit', id: null })} onEdit={(id) => setView({ mode: 'edit', id })} />
        ) : (
          <Editor id={view.id} onDone={() => setView({ mode: 'list' })} />
        )}
      </main>
    </div>
  )
}
