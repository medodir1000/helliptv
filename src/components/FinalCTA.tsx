import { motion } from 'framer-motion'
import { Button } from './ui/Button'
import { Icon } from './ui/Icon'
import { WA } from '../lib/whatsapp'
import { EASE_OUT } from './anim/motion'

export function FinalCTA() {
  return (
    <section className="relative mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, ease: EASE_OUT }}
        className="relative overflow-hidden rounded-[2.25rem] border border-neon/20 bg-[radial-gradient(120%_140%_at_50%_0%,rgba(124,58,237,0.12),#ffffff)] px-6 py-16 text-center shadow-[0_30px_80px_-50px_rgba(124,58,237,0.5)] sm:px-12 sm:py-20"
      >
        <div className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-neon/25 blur-[110px]" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-volt/20 blur-[110px]" />

        <span className="relative inline-flex items-center gap-2 rounded-full bg-volt/15 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-volt ring-1 ring-volt/30">
          <Icon name="fire" size={14} /> Free 12h trial · No card needed
        </span>

        <h2 className="relative mx-auto mt-6 max-w-3xl text-balance text-4xl font-bold leading-[1.05] sm:text-5xl md:text-6xl">
          Experience the <span className="text-gradient">future of streaming</span> tonight.
        </h2>
        <p className="relative mx-auto mt-5 max-w-xl text-pretty text-lg text-muted">
          Join 60,000+ members streaming every match and movie in flawless 4K. Activate your free trial in minutes —
          straight on WhatsApp.
        </p>

        <div className="relative mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button href={WA.worldCup} variant="volt" size="lg" icon="whatsapp">
            Claim my free 12h trial
          </Button>
          <Button to="/pricing" variant="outline" size="lg" iconRight="arrow">
            See all plans
          </Button>
        </div>

        <div className="relative mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted">
          <span className="inline-flex items-center gap-1.5"><Icon name="bolt" size={15} className="text-volt" /> Instant activation</span>
          <span className="inline-flex items-center gap-1.5"><Icon name="shield" size={15} className="text-volt" /> Anti-freeze servers</span>
          <span className="inline-flex items-center gap-1.5"><Icon name="devices" size={15} className="text-volt" /> All devices</span>
        </div>
      </motion.div>
    </section>
  )
}
