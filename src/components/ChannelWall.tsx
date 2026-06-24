import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react'
import { Reveal } from './anim/Reveal'
import channelWall from '../assets/channel-wall.webp'

const FRAME = 'overflow-hidden rounded-3xl border border-line shadow-[0_24px_60px_-40px_rgba(17,19,28,0.4)]'
const ALT = 'A wall of the live TV networks and channels included with HellIPTV'

/* Soft circular torch that tracks the cursor (CSS vars set on mousemove). */
const SPOTLIGHT = 'radial-gradient(circle 175px at var(--x) var(--y), #000 0%, #000 34%, transparent 72%)'

/**
 * Channel-logo wall that sits unlit (dark, desaturated) and lights up the
 * networks under a spotlight that follows the cursor — like sweeping a torch
 * across them. Touch devices and reduced-motion users get the plain, fully
 * visible wall (no hover dependency).
 */
export function ChannelWall() {
  const ref = useRef<HTMLDivElement>(null)
  const [interactive, setInteractive] = useState(false)
  const [lit, setLit] = useState(false)

  useEffect(() => {
    const fineHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setInteractive(fineHover && !reduce)
  }, [])

  const track = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--x', `${e.clientX - r.left}px`)
    el.style.setProperty('--y', `${e.clientY - r.top}px`)
  }

  // Touch / reduced-motion → plain, always-visible wall.
  if (!interactive) {
    return (
      <Reveal className={`mt-6 bg-surface ${FRAME}`}>
        <img src={channelWall} alt={ALT} loading="lazy" width={1200} height={672} className="w-full object-cover" />
      </Reveal>
    )
  }

  return (
    <Reveal className={`relative mt-6 bg-[#090a11] ${FRAME}`}>
      <div
        ref={ref}
        onMouseEnter={(e) => {
          track(e)
          setLit(true)
        }}
        onMouseMove={track}
        onMouseLeave={() => setLit(false)}
        className="relative"
        style={{ '--x': '50%', '--y': '50%' } as CSSProperties}
      >
        {/* unlit base — channels sit as faint, desaturated silhouettes */}
        <img
          src={channelWall}
          alt={ALT}
          loading="lazy"
          width={1200}
          height={672}
          draggable={false}
          className="w-full select-none object-cover opacity-[0.13] saturate-0"
        />

        {/* lit layer — revealed only inside the torch circle */}
        <img
          src={channelWall}
          alt=""
          aria-hidden
          width={1200}
          height={672}
          draggable={false}
          className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover transition-opacity duration-300 ease-out"
          style={{ opacity: lit ? 1 : 0, WebkitMaskImage: SPOTLIGHT, maskImage: SPOTLIGHT }}
        />

        {/* the light itself — a soft warm/neon glow halo */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            opacity: lit ? 1 : 0,
            background:
              'radial-gradient(circle 210px at var(--x) var(--y), rgba(255,255,255,0.16), rgba(114,14,236,0.12) 42%, transparent 70%)',
            mixBlendMode: 'screen',
          }}
        />
      </div>
    </Reveal>
  )
}
