import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Section } from '../components/ui/Section'
import { Icon } from '../components/ui/Icon'
import { Button } from '../components/ui/Button'
import { Aurora } from '../components/ui/Aurora'
import { FinalCTA } from '../components/FinalCTA'
import { Reveal } from '../components/anim/Reveal'
import { useSeo } from '../hooks/useSeo'
import { getPostBySlug, type Post } from '../lib/blog'
import { WA } from '../lib/whatsapp'

function fmtDate(s: string | null) {
  if (!s) return ''
  return new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function BlogPost() {
  const { slug } = useParams()
  const [post, setPost] = useState<Post | null | undefined>(undefined) // undefined = loading
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    setPost(undefined)
    getPostBySlug(slug)
      .then((p) => setPost(p))
      .catch((e) => setError(e?.message ?? 'Could not load this article'))
  }, [slug])

  useSeo({
    title: post ? `${post.title}` : 'Article',
    description: post?.meta_description ?? post?.excerpt ?? 'HellIPTV blog',
    path: `/blog/${slug ?? ''}`,
    image: post?.cover_image ?? undefined,
  })

  if (post === null || error) {
    return (
      <Section className="!py-32 text-center">
        <p className="font-display text-2xl font-bold text-fg">Article not found</p>
        <p className="mt-2 text-muted">{error ?? 'This post may have been moved or unpublished.'}</p>
        <Button to="/blog" variant="outline" size="md" icon="arrow" className="mt-6">
          Back to the blog
        </Button>
      </Section>
    )
  }

  return (
    <>
      <article>
        <header className="relative overflow-hidden px-5 pt-28 sm:px-8 sm:pt-36">
          <Aurora />
          <div className="relative mx-auto max-w-3xl">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-faint">
              <Link to="/" className="hover:text-fg">Home</Link>
              <Icon name="chevron" size={12} className="-rotate-90 text-line" />
              <Link to="/blog" className="hover:text-fg">Blog</Link>
            </nav>

            {post === undefined ? (
              <div className="mt-6 space-y-4">
                <div className="h-4 w-24 animate-pulse rounded bg-surface-3" />
                <div className="h-10 w-full animate-pulse rounded bg-surface-3" />
                <div className="h-10 w-2/3 animate-pulse rounded bg-surface-3" />
              </div>
            ) : (
              <Reveal className="mt-6">
                {post.category && (
                  <span className="inline-flex rounded-full border border-neon/25 bg-neon/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-neon">
                    {post.category}
                  </span>
                )}
                <h1 className="mt-4 text-balance text-3xl font-bold leading-[1.1] sm:text-4xl md:text-5xl">
                  {post.title}
                </h1>
                <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-faint">
                  <span className="font-medium text-muted">{post.author ?? 'HellIPTV Team'}</span>
                  <span className="h-1 w-1 rounded-full bg-faint" />
                  <span>{fmtDate(post.published_at)}</span>
                  {post.read_minutes ? (
                    <>
                      <span className="h-1 w-1 rounded-full bg-faint" />
                      <span>{post.read_minutes} min read</span>
                    </>
                  ) : null}
                </div>
              </Reveal>
            )}
          </div>
        </header>

        {post && post.cover_image && (
          <div className="mx-auto mt-8 max-w-4xl px-5 sm:px-8">
            <img
              src={post.cover_image}
              alt={post.title}
              width={1280}
              height={720}
              className="aspect-[16/9] w-full rounded-3xl object-cover ring-1 ring-line"
            />
          </div>
        )}

        <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
          {post === undefined ? (
            <div className="space-y-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-4 w-full animate-pulse rounded bg-surface-3" style={{ width: `${70 + (i % 3) * 10}%` }} />
              ))}
            </div>
          ) : (
            <div className="prose prose-zinc max-w-none prose-headings:font-display prose-headings:tracking-tight prose-a:text-neon prose-a:no-underline hover:prose-a:underline prose-img:rounded-2xl prose-img:ring-1 prose-img:ring-line prose-blockquote:border-l-neon">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.body ?? ''}</ReactMarkdown>
            </div>
          )}

          {post && post.tags && post.tags.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-2 border-t border-line pt-6">
              {post.tags.map((t) => (
                <span key={t} className="rounded-full border border-line bg-surface-2 px-3 py-1 text-xs text-muted">
                  #{t}
                </span>
              ))}
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-volt/30 bg-volt/10 p-5">
            <p className="text-sm font-semibold text-fg">Ready to watch it all in 4K?</p>
            <Button href={WA.freeTrial} variant="volt" size="md" icon="whatsapp">
              Claim your free trial
            </Button>
          </div>

          <div className="mt-8">
            <Button to="/blog" variant="ghost" size="md" icon="arrow">
              More articles
            </Button>
          </div>
        </div>
      </article>

      <FinalCTA />
    </>
  )
}
