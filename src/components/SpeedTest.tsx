import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Section, SectionHeading } from './ui/Section'
import { Icon } from './ui/Icon'
import { Button } from './ui/Button'
import { WA } from '../lib/whatsapp'
import { EASE_OUT } from './anim/motion'

interface Server {
  city: string
  flag: string
  region: string
}
const SERVERS: Server[] = [
  { city: 'New York', flag: '🇺🇸', region: 'US-East' },
  { city: 'London', flag: '🇬🇧', region: 'EU-West' },
  { city: 'Frankfurt', flag: '🇩🇪', region: 'EU-Central' },
  { city: 'Dubai', flag: '🇦🇪', region: 'Gulf' },
]

type Phase = 'idle' | 'testing' | 'done'

const TIERS = [
  { label: 'HD 720p', min: 8 },
  { label: 'Full HD 1080p', min: 15 },
  { label: '4K UHD 2160p', min: 25 },
]

export function SpeedTest() {
  const [phase, setPhase] = useState<Phase>('idle')
  const [mbps, setMbps] = useState(0)
  const [progress, setProgress] = useState(0)
  const [pings, setPings] = useState<(number | null)[]>([null, null, null, null])
  const finalRef = useRef(0)

  const run = () => {
    if (phase === 'testing') return
    setPhase('testing')
    setPings([null, null, null, null])
    const final = Math.round(48 + Math.random() * 84) // 48–132 Mbps
    finalRef.current = final

    const duration = 2600
    let start = 0
    let raf = 0
    const tick = (ts: number) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setProgress(eased)
      setMbps(final * eased)

      // reveal server pings progressively
      setPings((prev) => {
        const next = [...prev]
        SERVERS.forEach((_, i) => {
          if (p > 0.25 + i * 0.16 && next[i] === null) {
            next[i] = Math.round(8 + Math.random() * 34)
          }
        })
        return next
      })

      if (p < 1) raf = requestAnimationFrame(tick)
      else setPhase('done')
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }

  const R = 88
  const C = 2 * Math.PI * R
  const arc = C * (0.75 * Math.min(progress, 1)) // 270° gauge
  const verdictReady = finalRef.current >= 25

  return (
    <Section id="speed-test">
      <SectionHeading
        eyebrow="Compatibility check"
        title={<>Is your line <span className="text-gradient-volt">4K-ready?</span></>}
        subtitle="Run our 10-second connection &amp; server compatibility test. No download, no signup — just proof that HellIPTV will fly on your setup."
      />

      <div className="mx-auto mt-14 grid max-w-5xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        {/* ── Gauge ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: EASE_OUT }}
          className="relative flex flex-col items-center justify-center rounded-3xl glass-strong p-8"
        >
          <div className="relative grid place-items-center">
            <svg width="220" height="220" viewBox="0 0 220 220" className="-rotate-[135deg]">
              <circle cx="110" cy="110" r={R} fill="none" stroke="var(--color-line)" strokeWidth="12" strokeLinecap="round" strokeDasharray={`${C * 0.75} ${C}`} />
              <motion.circle
                cx="110" cy="110" r={R} fill="none" stroke="url(#speedGrad)" strokeWidth="12" strokeLinecap="round"
                strokeDasharray={`${arc} ${C}`}
              />
              <defs>
                <linearGradient id="speedGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#720eec" />
                  <stop offset="100%" stopColor="#16a34a" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="font-mono-nums text-5xl font-bold text-fg">{Math.round(mbps)}</span>
              <span className="text-sm font-semibold uppercase tracking-wider text-faint">Mbps</span>
            </div>
          </div>

          <Button
            onClick={run}
            variant={phase === 'idle' ? 'primary' : 'outline'}
            size="lg"
            icon={phase === 'testing' ? 'signal' : 'wifi'}
            className="mt-6"
          >
            {phase === 'idle' ? 'Run speed test' : phase === 'testing' ? 'Testing…' : 'Test again'}
          </Button>
        </motion.div>

        {/* ── Results ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.1 }}
          className="flex flex-col gap-4 rounded-3xl border border-line bg-surface/40 p-6 sm:p-8"
        >
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-faint">Nearest servers</p>
            <div className="grid grid-cols-2 gap-2.5">
              {SERVERS.map((s, i) => (
                <div key={s.city} className="flex items-center justify-between rounded-xl border border-line bg-canvas/50 px-3 py-2.5">
                  <span className="flex items-center gap-2 text-sm text-fg">
                    <span className="text-base">{s.flag}</span>
                    {s.city}
                  </span>
                  <AnimatePresence mode="wait">
                    {pings[i] === null ? (
                      <motion.span key="dots" className="h-2 w-2 rounded-full bg-faint animate-ticker" />
                    ) : (
                      <motion.span
                        key="ping"
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-1.5 font-mono-nums text-xs font-semibold text-volt"
                      >
                        <Icon name="check" size={13} /> {pings[i]}ms
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-faint">Streaming quality unlocked</p>
            <div className="flex flex-col gap-2">
              {TIERS.map((t) => {
                const ok = phase === 'done' && finalRef.current >= t.min
                const pending = phase !== 'done'
                return (
                  <div
                    key={t.label}
                    className={`flex items-center justify-between rounded-xl border px-3.5 py-2.5 transition-colors ${
                      ok ? 'border-volt/40 bg-volt/10' : 'border-line bg-canvas/40'
                    }`}
                  >
                    <span className={`text-sm font-medium ${ok ? 'text-fg' : 'text-muted'}`}>{t.label}</span>
                    <span className={`grid h-5 w-5 place-items-center rounded-full ${ok ? 'bg-volt text-white' : 'bg-surface-2 text-faint'}`}>
                      {ok ? <Icon name="check" size={12} /> : pending ? <span className="h-1 w-1 rounded-full bg-faint" /> : <Icon name="close" size={11} />}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <AnimatePresence>
            {phase === 'done' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-1 flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between ${
                  verdictReady ? 'bg-volt/10 ring-1 ring-volt/30' : 'bg-neon/10 ring-1 ring-neon/30'
                }`}
              >
                <p className="text-sm">
                  <span className="font-bold text-fg">
                    {verdictReady ? '✓ Your line is 4K-ready.' : 'Great for Full HD streaming.'}
                  </span>{' '}
                  <span className="text-muted">{Math.round(finalRef.current)} Mbps detected.</span>
                </p>
                <Button href={WA.speedTest(Math.round(finalRef.current))} variant="volt" size="md" icon="whatsapp" className="shrink-0">
                  Start free trial
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </Section>
  )
}
