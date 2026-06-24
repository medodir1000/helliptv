import { motion, useReducedMotion, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'
import { EASE_OUT, inViewOnce } from './motion'

type Direction = 'up' | 'down' | 'left' | 'right' | 'none'

const offset: Record<Direction, { x?: number; y?: number }> = {
  up: { y: 28 },
  down: { y: -28 },
  left: { x: 28 },
  right: { x: -28 },
  none: {},
}

interface RevealProps {
  children: ReactNode
  direction?: Direction
  delay?: number
  duration?: number
  className?: string
  as?: 'div' | 'section' | 'li' | 'span'
}

/**
 * Scroll-triggered reveal. Fades + slides content in once it enters the
 * viewport. Collapses to a plain fade when the user prefers reduced motion.
 */
export function Reveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.6,
  className,
  as = 'div',
}: RevealProps) {
  const reduce = useReducedMotion()
  const from = reduce ? {} : offset[direction]

  const variants: Variants = {
    hidden: { opacity: 0, ...from },
    show: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration, ease: EASE_OUT, delay },
    },
  }

  const MotionTag = motion[as] as typeof motion.div
  return (
    <MotionTag
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={inViewOnce}
    >
      {children}
    </MotionTag>
  )
}
