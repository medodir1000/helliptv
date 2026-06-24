import { motion, useReducedMotion } from 'framer-motion'
import { EASE_OUT, inViewOnce } from './motion'

interface TextRevealProps {
  text: string
  className?: string
  /** className applied to highlighted words (wrap target words in *asterisks*) */
  highlightClassName?: string
  delay?: number
}

/**
 * Word-by-word staggered reveal. Wrap any word in *asterisks* to apply the
 * highlight class (e.g. a gradient). Degrades to a single fade for reduced motion.
 */
export function TextReveal({
  text,
  className,
  highlightClassName = 'text-gradient',
  delay = 0,
}: TextRevealProps) {
  const reduce = useReducedMotion()
  const words = text.split(' ')

  if (reduce) {
    return (
      <span className={className}>
        {words.map((w, i) => {
          const hot = w.startsWith('*') && w.endsWith('*')
          const clean = hot ? w.slice(1, -1) : w
          return (
            <span key={i} className={hot ? highlightClassName : undefined}>
              {clean}
              {i < words.length - 1 ? ' ' : ''}
            </span>
          )
        })}
      </span>
    )
  }

  return (
    <motion.span
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={inViewOnce}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.045, delayChildren: delay } } }}
      style={{ display: 'inline' }}
    >
      {words.map((w, i) => {
        const hot = w.startsWith('*') && w.endsWith('*')
        const clean = hot ? w.slice(1, -1) : w
        return (
          <span key={i} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom' }}>
            <motion.span
              style={{ display: 'inline-block', willChange: 'transform' }}
              variants={{
                hidden: { y: '110%', opacity: 0 },
                show: { y: '0%', opacity: 1, transition: { duration: 0.6, ease: EASE_OUT } },
              }}
              className={hot ? highlightClassName : undefined}
            >
              {clean}
            </motion.span>
            {i < words.length - 1 ? ' ' : ''}
          </span>
        )
      })}
    </motion.span>
  )
}
