import { motion } from 'framer-motion'
import { Section, SectionHeading } from './ui/Section'
import { Icon, type IconName } from './ui/Icon'
import { FEATURES, type Feature } from '../lib/site'
import { staggerContainer, fadeUp, inViewOnce } from './anim/motion'

function Card({ f }: { f: Feature }) {
  const accent = f.accent === 'volt' ? 'volt' : 'neon'
  const span =
    f.span === 'wide' ? 'sm:col-span-2' : f.span === 'tall' ? 'sm:row-span-2' : ''
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      className={`group card card-hover relative flex flex-col overflow-hidden rounded-3xl p-6 sm:p-7 ${span}`}
    >
      {/* hover glow */}
      <div
        className={`pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${
          accent === 'volt' ? 'bg-volt/20' : 'bg-neon/25'
        }`}
      />
      <div
        className={`grid h-12 w-12 place-items-center rounded-2xl ring-1 ${
          accent === 'volt'
            ? 'bg-volt/10 text-volt ring-volt/30'
            : 'bg-neon/10 text-neon ring-neon/30'
        }`}
      >
        <Icon name={f.icon as IconName} size={24} />
      </div>
      <h3 className="mt-5 font-display text-xl font-bold text-fg">{f.title}</h3>
      <p className="mt-2.5 text-pretty text-[15px] leading-relaxed text-muted">{f.body}</p>

      {f.span === 'tall' && (
        <div className="mt-auto pt-6">
          <div className="flex flex-wrap gap-2">
            {['English', 'العربية', 'Español', 'Français', 'Deutsch', 'Italiano'].map((l) => (
              <span key={l} className="rounded-lg border border-line bg-canvas/60 px-2.5 py-1 text-xs text-muted">
                {l}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}

export function Features() {
  return (
    <Section id="features">
      <SectionHeading
        eyebrow="Why HellIPTV"
        title={<>Built for the moments that <span className="text-gradient">can’t buffer</span></>}
        subtitle="Premium infrastructure obsessed over one thing: a flawless picture when it matters most — live, in 4K, on every screen you own."
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={inViewOnce}
        className="mt-14 grid auto-rows-[1fr] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {FEATURES.map((f) => (
          <Card key={f.title} f={f} />
        ))}
      </motion.div>
    </Section>
  )
}
