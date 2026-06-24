import { motion } from 'framer-motion'
import { Button } from './ui/Button'
import { Icon } from './ui/Icon'
import { Pill } from './ui/Section'
import { Aurora } from './ui/Aurora'
import { HeroVisual } from './visuals/HeroVisual'
import { TextReveal } from './anim/TextReveal'
import { EASE_OUT } from './anim/motion'
import { WA } from '../lib/whatsapp'

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-28 sm:pt-36">
      <Aurora />

      <div className="relative grid items-center gap-12 px-5 pb-16 pt-10 sm:px-8 lg:grid-cols-[30rem_minmax(0,1fr)] lg:gap-12 lg:pb-24 lg:pl-[max(2rem,calc(50vw-38rem))] lg:pr-6 xl:pr-10">
        {/* ── Copy ── */}
        <div className="flex flex-col items-start gap-7">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE_OUT }}>
            <Pill icon={<Icon name="globe" size={13} />}>Worldwide · 4K UHD · No contract</Pill>
          </motion.div>

          <h1 className="text-balance text-4xl font-bold leading-[1.03] sm:text-5xl lg:text-6xl xl:text-[4.25rem]">
            <TextReveal text="Stream every match in" />{' '}
            <TextReveal text="*4K.* *Zero* buffer." highlightClassName="text-gradient-volt text-glow-volt" />
            <br className="hidden sm:block" />{' '}
            <TextReveal text="Anywhere on Earth." highlightClassName="text-gradient" delay={0.15} />
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.35 }}
            className="max-w-xl text-pretty text-lg text-muted"
          >
            22,000+ live channels and 90,000+ movies in true 4K UHD — powered by our{' '}
            <span className="font-semibold text-fg">Anti-Buffer Engine™</span> and anti-freeze servers built for
            kickoff. US, UK, Europe & Gulf. <span className="font-semibold text-volt">Free 12-hour trial.</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.45 }}
            className="flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Button href={WA.worldCup} variant="volt" size="lg" icon="whatsapp">
              Claim Free 12h Trial
            </Button>
            <Button href="#pricing" variant="ghost" size="lg" iconRight="arrow">
              View plans
            </Button>
          </motion.div>

          {/* trust row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2"
          >
            <div className="flex items-center gap-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Icon key={i} name="star" size={16} className="text-volt" />
                ))}
              </div>
              <span className="text-sm text-muted">
                <span className="font-bold text-fg">4.8</span>/5 · 60,000+ members
              </span>
            </div>
            <div className="h-4 w-px bg-line" />
            <div className="flex items-center gap-2 text-sm text-muted">
              <Icon name="lock" size={15} className="text-volt" />
              No credit card · Cancel anytime
            </div>
          </motion.div>
        </div>

        {/* ── Visual ── */}
        <div className="relative w-full">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.2 }}
            className="w-full"
          >
            <HeroVisual />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
