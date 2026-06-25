import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { Icon, type IconName } from './Icon'
import { springSnappy } from '../anim/motion'

const MotionLink = motion.create(Link)

type Variant = 'primary' | 'volt' | 'ghost' | 'outline'
type Size = 'md' | 'lg'

interface BaseProps {
  children: ReactNode
  variant?: Variant
  size?: Size
  icon?: IconName
  iconRight?: IconName
  className?: string
  fullWidth?: boolean
  /** external link (https / wa.me) */
  href?: string
  /** internal route (react-router) */
  to?: string
  onClick?: () => void
  type?: 'button' | 'submit'
}

const base =
  'group relative inline-flex items-center justify-center gap-2.5 rounded-full font-semibold tracking-tight whitespace-nowrap transition-colors duration-200 cursor-pointer select-none'

const sizes: Record<Size, string> = {
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
}

const variants: Record<Variant, string> = {
  primary: 'text-white bg-[linear-gradient(100deg,#720eec,#8b1fe0,#c000ff)] glow-purple hover:brightness-110',
  volt: 'text-white bg-[linear-gradient(100deg,#16a34a,#15803d)] glow-volt hover:brightness-105 font-bold',
  ghost: 'text-fg glass hover:bg-surface-2',
  outline: 'text-fg border border-line bg-surface hover:border-neon/55 hover:text-neon',
}

export function Button(props: BaseProps) {
  const { children, variant = 'primary', size = 'md', icon, iconRight, className = '', fullWidth, href, to, onClick, type } = props

  const cls = `${base} ${sizes[size]} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`
  const inner = (
    <>
      {icon && <Icon name={icon} size={size === 'lg' ? 20 : 18} />}
      <span>{children}</span>
      {iconRight && (
        <Icon name={iconRight} size={size === 'lg' ? 20 : 18} className="transition-transform duration-200 group-hover:translate-x-0.5" />
      )}
    </>
  )

  const motionProps = {
    whileHover: { y: -2, transition: springSnappy },
    whileTap: { scale: 0.97 },
  }

  if (to) {
    return (
      <MotionLink to={to} className={cls} {...motionProps}>
        {inner}
      </MotionLink>
    )
  }
  if (href) {
    const external = href.startsWith('http') || href.startsWith('wa.me') || href.startsWith('mailto')
    return (
      <motion.a
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        className={cls}
        {...motionProps}
      >
        {inner}
      </motion.a>
    )
  }
  return (
    <motion.button type={type ?? 'button'} onClick={onClick} className={cls} {...motionProps}>
      {inner}
    </motion.button>
  )
}
