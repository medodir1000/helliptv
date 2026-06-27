import { useCallback, useEffect, useRef, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { supabase, hasSupabase } from '../lib/supabase'
import {
  listAllPosts, getPostById, createPost, updatePost, deletePost, uploadImage,
  slugify, estimateReadMinutes, type Post, type PostInput, type PostStatus,
} from '../lib/blog'
import { Icon } from '../components/ui/Icon'
import { Logo } from '../components/ui/Logo'
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

/* ────────────────────────────── Editor ───────────────────────────── */
const EMPTY: PostInput = { title: '', slug: '', excerpt: '', body: '', category: '', author: 'HellIPTV Team', tags: [], status: 'draft', cover_image: '', meta_description: '' }

function Editor({ id, onDone }: { id: string | null; onDone: () => void }) {
  const [form, setForm] = useState<PostInput>(EMPTY)
  const [tagsText, setTagsText] = useState('')
  const [slugLocked, setSlugLocked] = useState(false)
  const [tab, setTab] = useState<'write' | 'preview'>('write')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const coverInput = useRef<HTMLInputElement>(null)
  const bodyInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!id) return
    getPostById(id).then((p) => {
      if (!p) return
      setForm({
        title: p.title, slug: p.slug, excerpt: p.excerpt ?? '', body: p.body ?? '', category: p.category ?? '',
        author: p.author ?? 'HellIPTV Team', tags: p.tags ?? [], status: p.status, cover_image: p.cover_image ?? '',
        meta_description: p.meta_description ?? '', published_at: p.published_at ?? null,
      })
      setTagsText((p.tags ?? []).join(', '))
      setSlugLocked(true)
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
      onDone()
    } catch (e: any) {
      setError(e?.message ?? 'Save failed')
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <button onClick={onDone} className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
        <Icon name="arrow" size={15} className="rotate-180" /> Back to posts
      </button>

      <div className="rounded-3xl border border-line bg-surface p-6 sm:p-8">
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
              <input ref={bodyInput} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], 'body')} />
              <button type="button" onClick={() => bodyInput.current?.click()} className="ml-1 rounded-lg px-3 py-1 text-xs font-semibold text-faint hover:text-fg">+ Image</button>
            </div>
          </div>
          {tab === 'write' ? (
            <textarea value={form.body ?? ''} onChange={(e) => set({ body: e.target.value })} rows={16} className={`${input} resize-y font-mono-nums`} placeholder={'## Heading\n\nWrite in **Markdown**. Use the “+ Image” button to upload pictures.'} />
          ) : (
            <div className="prose prose-zinc min-h-[16rem] max-w-none rounded-xl border border-line bg-canvas/40 p-4 prose-headings:font-display prose-a:text-neon prose-img:rounded-xl">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{form.body || '_Nothing to preview yet._'}</ReactMarkdown>
            </div>
          )}
        </div>

        <div className="mt-4">
          <label className={label}>Meta description (SEO)</label>
          <textarea value={form.meta_description ?? ''} onChange={(e) => set({ meta_description: e.target.value })} rows={2} className={`${input} resize-y`} placeholder="~155 characters for Google" />
        </div>

        {error && <p className="mt-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

        <div className="mt-6 flex flex-wrap gap-3">
          <button disabled={busy} onClick={() => save('published')} className={btnPrimary}>
            <Icon name="check" size={16} /> {busy ? 'Saving…' : 'Publish'}
          </button>
          <button disabled={busy} onClick={() => save('draft')} className={btnGhost}>Save as draft</button>
        </div>
      </div>
    </div>
  )
}

/* ────────────────────────────── List ─────────────────────────────── */
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
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-fg">Posts</h1>
        <button onClick={onNew} className={btnPrimary}><Icon name="sparkles" size={16} /> New post</button>
      </div>

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
