import { motion } from 'framer-motion'
import { Icon } from './ui/Icon'
import { Button } from './ui/Button'
import { useCountdown } from '../hooks/useCountdown'
import { useFixtures } from '../hooks/useFixtures'
import { WA } from '../lib/whatsapp'
import { Reveal } from './anim/Reveal'

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="font-mono-nums grid min-w-[3.25rem] place-items-center rounded-xl glass-strong px-2 py-2.5 text-2xl font-bold text-fg sm:min-w-[4rem] sm:text-4xl">
        {String(value).padStart(2, '0')}
      </div>
      <span className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-faint">{label}</span>
    </div>
  )
}

export function MatchCountdown() {
  const { fixtures, source } = useFixtures()
  const headline = fixtures[0]
  const target = headline?.start ?? Date.now() + 3_600_000
  const t = useCountdown(target)

  return (
    <Reveal className="relative z-10 mx-auto -mt-6 w-full max-w-6xl px-5 sm:px-8">
      <div className="relative overflow-hidden rounded-3xl border border-neon/20 bg-[linear-gradient(120deg,rgba(168,85,247,0.12),rgba(45,255,140,0.06))] p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-neon/20 blur-3xl" />

        <div className="relative flex flex-col items-center gap-6 lg:flex-row lg:justify-between">
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center gap-2 lg:justify-start">
              <span className="inline-flex items-center gap-2 rounded-full bg-danger/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-danger ring-1 ring-danger/30">
                <Icon name="trophy" size={13} /> Next big match
              </span>
              {source === 'live' && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-volt/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-volt ring-1 ring-volt/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-volt animate-ticker" /> Live data
                </span>
              )}
            </div>
            <h3 className="mt-3 font-display text-2xl font-bold text-fg sm:text-3xl">
              {headline ? (
                <>
                  {headline.home} <span className="text-faint">vs</span> {headline.away}
                </>
              ) : (
                'Big match incoming'
              )}
            </h3>
            <p className="mt-1 text-sm text-muted">{headline?.league ?? 'Live sport'} · Live in 4K on HellIPTV</p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Unit value={t.days} label="Days" />
            <span className="pb-5 text-2xl font-bold text-neon sm:text-3xl">:</span>
            <Unit value={t.hours} label="Hrs" />
            <span className="pb-5 text-2xl font-bold text-neon sm:text-3xl">:</span>
            <Unit value={t.minutes} label="Min" />
            <span className="pb-5 text-2xl font-bold text-neon sm:text-3xl">:</span>
            <Unit value={t.seconds} label="Sec" />
          </div>

          <Button href={WA.worldCup} variant="volt" size="lg" icon="whatsapp" className="shrink-0">
            Watch free
          </Button>
        </div>
      </div>

      {/* fixtures ticker */}
      <div className="mask-x mt-4 overflow-hidden">
        <motion.div
          className="flex w-max gap-3"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
        >
          {[...fixtures, ...fixtures].map((f, i) => (
            <span
              key={i}
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-line bg-surface/50 px-4 py-2 text-sm text-muted"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-volt animate-ticker" />
              <span className="font-medium text-fg">{f.home}</span> v {f.away}
              <span className="text-faint">· {f.league.split('·')[0].trim()}</span>
            </span>
          ))}
        </motion.div>
      </div>
    </Reveal>
  )
}
