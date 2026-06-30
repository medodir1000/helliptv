import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { PageHeader } from '../components/ui/PageHeader'
import { Section } from '../components/ui/Section'
import { Icon } from '../components/ui/Icon'
import { NotifyButton } from '../components/ui/NotifyButton'
import { FinalCTA } from '../components/FinalCTA'
import { useSeo } from '../hooks/useSeo'
import { useHreflang } from '../hooks/useHreflang'
import { getPublishedPosts, type Post } from '../lib/blog'
import { hasSupabase } from '../lib/supabase'
import { currentLang, blogPath } from '../lib/i18n'
import { cdnImg } from '../lib/img.mjs'

function fmtDate(s: string | null) {
  if (!s) return ''
  return new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function PostCard({ post, lang }: { post: Post; lang: string }) {
  return (
    <article>
      <Link
        to={blogPath(lang, post.slug)}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-shadow hover:shadow-[0_24px_50px_-30px_rgba(17,19,28,0.45)]"
      >
        <div className="relative aspect-[16/9] overflow-hidden bg-surface-3">
          {post.cover_image ? (
            <img
              src={cdnImg(post.cover_image, 640, 68)}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
            />
          ) : (
            <div className="grid h-full w-full place-items-center bg-[linear-gradient(120deg,#241046,#720eec)]">
              <Icon name="play" size={34} className="text-white/70" />
            </div>
          )}
          {post.category && (
            <span className="absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
              {post.category}
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col p-5">
          <h2 className="font-display text-lg font-bold leading-snug text-fg transition-colors group-hover:text-neon">
            {post.title}
          </h2>
          {post.excerpt && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{post.excerpt}</p>}
          <div className="mt-4 flex items-center gap-3 pt-1 text-xs text-faint">
            <span>{fmtDate(post.published_at)}</span>
            {post.read_minutes ? (
              <>
                <span className="h-1 w-1 rounded-full bg-faint" />
                <span>{post.read_minutes} min read</span>
              </>
            ) : null}
            <Icon name="arrow" size={14} className="ml-auto text-neon transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>
      </Link>
    </article>
  )
}

export function BlogIndex() {
  const lang = currentLang(useLocation().pathname)
  useSeo({
    title: 'Blog — IPTV guides, tips & streaming news',
    description: 'How-to guides, setup tips and streaming news from HellIPTV — watch every match in 4K on any device.',
    path: blogPath(lang),
  })
  useHreflang()
  const [posts, setPosts] = useState<Post[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!hasSupabase) {
      setError('The blog isn’t connected yet — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then restart the dev server (or redeploy).')
      return
    }
    let alive = true
    setPosts(null)
    // Don't let a hung request leave the page stuck on skeletons forever.
    const timeout = setTimeout(() => alive && setError('Took too long to reach Supabase. Check your connection / env vars.'), 12000)
    getPublishedPosts(undefined, lang)
      .then((p) => { if (alive) { clearTimeout(timeout); setPosts(p) } })
      .catch((e) => { if (alive) { clearTimeout(timeout); setError(e?.message ?? 'Could not load posts') } })
    return () => { alive = false; clearTimeout(timeout) }
  }, [lang])

  return (
    <>
      <PageHeader
        eyebrow="HellIPTV blog"
        crumbs={[{ label: 'Blog' }]}
        title={<>Guides, tips & <span className="text-gradient">streaming news</span></>}
        subtitle="Everything you need to stream smarter — setup walkthroughs, 4K tips and the matches worth watching."
      />

      <Section className="!pt-4">
        <div className="mb-6 flex justify-center">
          <NotifyButton lang={lang} />
        </div>
        {error && (
          <p className="mx-auto max-w-md rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-center text-sm text-danger">
            {error}
          </p>
        )}

        {posts === null && !error && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-line bg-surface">
                <div className="aspect-[16/9] animate-pulse bg-surface-3" />
                <div className="space-y-3 p-5">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-surface-3" />
                  <div className="h-3 w-full animate-pulse rounded bg-surface-3" />
                  <div className="h-3 w-2/3 animate-pulse rounded bg-surface-3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {posts && posts.length === 0 && (
          <div className="mx-auto max-w-md rounded-2xl border border-line bg-surface p-10 text-center">
            <Icon name="sparkles" size={26} className="mx-auto text-neon" />
            <p className="mt-3 font-display text-lg font-bold text-fg">No articles yet</p>
            <p className="mt-1 text-sm text-muted">New guides are on the way — check back soon.</p>
          </div>
        )}

        {posts && posts.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <PostCard key={p.id} post={p} lang={lang} />
            ))}
          </div>
        )}
      </Section>

      <FinalCTA />
    </>
  )
}
