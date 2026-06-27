import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Section, SectionHeading } from './ui/Section'
import { Icon } from './ui/Icon'
import { Button } from './ui/Button'
import { getPublishedPosts, type Post } from '../lib/blog'
import { fadeUp, inViewOnce, staggerContainer } from './anim/motion'

function fmtDate(s: string | null) {
  if (!s) return ''
  return new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function BlogTeaser() {
  const [posts, setPosts] = useState<Post[]>([])

  useEffect(() => {
    getPublishedPosts(3)
      .then(setPosts)
      .catch(() => setPosts([]))
  }, [])

  if (posts.length === 0) return null // hide the section when there's nothing to show

  return (
    <Section id="blog">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <SectionHeading
          align="left"
          eyebrow="From the blog"
          title={<>Stream <span className="text-gradient">smarter</span></>}
          subtitle="Setup guides, 4K tips and the matches worth watching."
        />
        <Button to="/blog" variant="outline" size="md" iconRight="arrow" className="shrink-0">
          All articles
        </Button>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={inViewOnce}
        className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {posts.map((post) => (
          <motion.article key={post.id} variants={fadeUp}>
            <Link
              to={`/blog/${post.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-shadow hover:shadow-[0_24px_50px_-30px_rgba(17,19,28,0.45)]"
            >
              <div className="relative aspect-[16/9] overflow-hidden bg-surface-3">
                {post.cover_image ? (
                  <img
                    src={post.cover_image}
                    alt=""
                    loading="lazy"
                    width={640}
                    height={360}
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center bg-[linear-gradient(120deg,#241046,#720eec)]">
                    <Icon name="play" size={30} className="text-white/70" />
                  </div>
                )}
                {post.category && (
                  <span className="absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
                    {post.category}
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-display text-base font-bold leading-snug text-fg transition-colors group-hover:text-neon">
                  {post.title}
                </h3>
                {post.excerpt && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{post.excerpt}</p>}
                <div className="mt-4 flex items-center gap-3 pt-1 text-xs text-faint">
                  <span>{fmtDate(post.published_at)}</span>
                  <Icon name="arrow" size={14} className="ml-auto text-neon transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </Link>
          </motion.article>
        ))}
      </motion.div>
    </Section>
  )
}
