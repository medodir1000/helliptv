import { motion } from 'framer-motion'
import { Section, SectionHeading } from './ui/Section'
import { Button } from './ui/Button'
import { Icon, type IconName } from './ui/Icon'
import { STEPS } from '../lib/site'
import { WA } from '../lib/whatsapp'
import { fadeUp, inViewOnce, staggerContainer } from './anim/motion'

export function Steps() {
  return (
    <Section id="steps">
      <SectionHeading
        eyebrow="Quick & easy setup"
        title={<>Get started in <span className="text-gradient">3 simple steps</span></>}
        subtitle="No installers, no contracts, no waiting. From click to kickoff in under ten minutes."
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={inViewOnce}
        className="mt-16 grid gap-y-12 md:grid-cols-3 md:gap-y-0"
      >
        {STEPS.map((s, i) => (
          <motion.div
            key={s.n}
            variants={fadeUp}
            className={`flex flex-col items-center gap-4 px-6 text-center ${i > 0 ? 'md:border-l md:border-white/[0.07]' : ''}`}
          >
            {/* animated icon — springs in, pops on hover, with a crossing shine */}
            <motion.div
              initial={{ scale: 0.4, opacity: 0, rotate: -18 }}
              whileInView={{ scale: 1, opacity: 1, rotate: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ type: 'spring', stiffness: 230, damping: 15, delay: i * 0.12 }}
              whileHover={{ scale: 1.09, rotate: 4 }}
              className="relative grid h-16 w-16 place-items-center overflow-hidden rounded-2xl bg-neon/10 ring-1 ring-neon/25"
            >
              {/* crossing shine */}
              <span
                className="animate-sweep pointer-events-none absolute inset-y-0 -left-3 z-0 w-7 bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.38),transparent)]"
                style={{ animationDelay: `${i * 0.6}s` }}
              />
              <Icon name={s.icon as IconName} size={28} className="relative z-10 text-neon" />
              {/* step number chip */}
              <span className="absolute -right-1.5 -top-1.5 z-20 grid h-6 w-6 place-items-center rounded-full bg-volt text-[11px] font-bold text-white ring-2 ring-surface">
                {i + 1}
              </span>
            </motion.div>

            <h3 className="font-display text-lg font-semibold text-fg">{s.title}</h3>
            <p className="max-w-xs text-[15px] leading-relaxed text-muted">{s.body}</p>
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-12 flex justify-center">
        <Button href={WA.freeTrial} variant="volt" size="lg" icon="whatsapp">
          Start step 1 — it’s free
        </Button>
      </div>
    </Section>
  )
}
