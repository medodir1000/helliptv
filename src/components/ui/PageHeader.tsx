import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Aurora } from './Aurora'
import { Pill } from './Section'
import { Icon } from './Icon'
import { Reveal } from '../anim/Reveal'

interface Crumb {
  label: string
  to?: string
}
interface PageHeaderProps {
  eyebrow?: string
  title?: ReactNode
  subtitle?: ReactNode
  crumbs?: Crumb[]
}

/** Page hero. With a title → full header + aurora; without → slim breadcrumb bar. */
export function PageHeader({ eyebrow, title, subtitle, crumbs = [] }: PageHeaderProps) {
  const full = !!title
  return (
    <section className={`relative overflow-hidden px-5 sm:px-8 ${full ? 'pt-32 pb-10 sm:pt-40 sm:pb-12' : 'pt-28 pb-1 sm:pt-32'}`}>
      {full && <Aurora />}
      <div className="relative mx-auto max-w-7xl">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-faint">
          <Link to="/" className="transition-colors hover:text-fg">Home</Link>
          {crumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <Icon name="chevron" size={12} className="-rotate-90 text-line" />
              {c.to ? (
                <Link to={c.to} className="transition-colors hover:text-fg">{c.label}</Link>
              ) : (
                <span className="text-muted">{c.label}</span>
              )}
            </span>
          ))}
        </nav>

        {full ? (
          <Reveal className="mt-5 flex flex-col items-start gap-4">
            {eyebrow && <Pill>{eyebrow}</Pill>}
            <h1 className="max-w-3xl text-balance text-4xl font-bold sm:text-5xl md:text-6xl">{title}</h1>
            {subtitle && <p className="max-w-2xl text-pretty text-lg text-muted">{subtitle}</p>}
          </Reveal>
        ) : (
          /* slim pages reuse a section's h2 below — keep a single, page-level h1 for SEO/a11y */
          <h1 className="sr-only">{crumbs[crumbs.length - 1]?.label ?? 'HellIPTV'}</h1>
        )}
      </div>
    </section>
  )
}
