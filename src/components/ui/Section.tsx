import type { ReactNode } from 'react'
import { Reveal } from '../anim/Reveal'

interface SectionProps {
  id?: string
  children: ReactNode
  className?: string
}

export function Section({ id, children, className = '' }: SectionProps) {
  return (
    <section id={id} className={`relative mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 sm:py-28 ${className}`}>
      {children}
    </section>
  )
}

interface PillProps {
  children: ReactNode
  icon?: ReactNode
  className?: string
}
export function Pill({ children, icon, className = '' }: PillProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-neon/25 bg-neon/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-neon ${className}`}
    >
      {icon}
      {children}
    </span>
  )
}

interface HeadingProps {
  eyebrow?: string
  title: ReactNode
  subtitle?: ReactNode
  align?: 'left' | 'center'
  className?: string
}
export function SectionHeading({ eyebrow, title, subtitle, align = 'center', className = '' }: HeadingProps) {
  const center = align === 'center'
  return (
    <Reveal
      className={`flex flex-col gap-5 ${center ? 'items-center text-center' : 'items-start text-left'} ${className}`}
    >
      {eyebrow && <span className="kicker">{eyebrow}</span>}
      <h2
        className={`text-balance text-[1.95rem] font-semibold leading-[1.1] tracking-[-0.01em] sm:text-[2.4rem] md:text-[2.85rem] ${
          center ? 'max-w-3xl' : 'max-w-2xl'
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p className={`text-pretty text-[15px] leading-relaxed text-muted sm:text-[17px] ${center ? 'max-w-xl' : 'max-w-lg'}`}>
          {subtitle}
        </p>
      )}
    </Reveal>
  )
}
