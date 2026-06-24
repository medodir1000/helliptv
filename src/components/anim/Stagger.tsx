import { motion, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'
import { fadeUp, inViewOnce, staggerContainer } from './motion'

interface StaggerProps {
  children: ReactNode
  className?: string
  /** seconds between each child */
  gap?: number
}

/** Container that reveals its <Stagger.Item> children in sequence on scroll. */
export function Stagger({ children, className, gap = 0.08 }: StaggerProps) {
  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: gap, delayChildren: 0.05 } },
  }
  return (
    <motion.div
      className={className}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={inViewOnce}
    >
      {children}
    </motion.div>
  )
}

interface ItemProps {
  children: ReactNode
  className?: string
  variants?: Variants
}

function Item({ children, className, variants = fadeUp }: ItemProps) {
  return (
    <motion.div className={className} variants={variants}>
      {children}
    </motion.div>
  )
}

Stagger.Item = Item
export { staggerContainer }
