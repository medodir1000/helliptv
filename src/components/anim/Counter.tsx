import { useEffect, useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'framer-motion'
import { EASE_OUT } from './motion'

interface CounterProps {
  to: number
  decimals?: number
  suffix?: string
  duration?: number
  className?: string
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

/** Counts up from 0 → `to` once it scrolls into view. */
export function Counter({ to, decimals = 0, suffix = '', duration = 1.6, className }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  const reduce = useReducedMotion()
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!inView) return
    if (reduce) {
      setValue(to)
      return
    }
    let raf = 0
    let start = 0
    const tick = (ts: number) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / (duration * 1000), 1)
      setValue(to * easeOutCubic(p))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, to, duration, reduce])

  const formatted =
    decimals > 0
      ? value.toFixed(decimals)
      : Math.round(value).toLocaleString('en-US')

  return (
    <span ref={ref} className={className} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {formatted}
      {suffix}
    </span>
  )
}
