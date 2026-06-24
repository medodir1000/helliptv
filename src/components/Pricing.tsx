import { motion } from 'framer-motion'
import { Section, SectionHeading } from './ui/Section'
import { Icon, type IconName } from './ui/Icon'
import { Button } from './ui/Button'
import { PLANS, PREMIUM_FEATURES, type Plan } from '../lib/site'
import { WA } from '../lib/whatsapp'
import { fadeUp, inViewOnce, staggerContainer } from './anim/motion'

const payMods = import.meta.glob('../assets/pay/*.svg', { eager: true, import: 'default' })
const PAY = Object.values(payMods) as string[]

function PlanCard({ p }: { p: Plan }) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      className={`relative flex flex-col rounded-3xl p-6 sm:p-7 ${
        p.highlight ? 'ring-conic bg-surface-2/80' : 'card card-hover'
      }`}
    >
      {p.badge && (
        <span
          className={`absolute -top-3 right-5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${
            p.highlight ? 'bg-volt text-white' : 'bg-neon/90 text-white'
          }`}
        >
          {p.badge}
        </span>
      )}

      {/* tier pill */}
      <span className="inline-flex w-fit items-center rounded-full border border-line bg-canvas/50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-faint">
        {p.name} — Premium
      </span>

      {/* price + trial */}
      <div className="mt-4 flex items-end gap-1.5">
        <span className="font-display text-4xl font-bold text-fg sm:text-[2.75rem]">{p.price}</span>
      </div>
      <p className="mt-1.5 text-sm text-muted">{p.trial}</p>

      <div className="my-5 h-px w-full bg-line" />

      {/* shared premium features */}
      <ul className="flex flex-1 flex-col gap-2.5">
        {PREMIUM_FEATURES.map((f) => (
          <li key={f.label} className="flex items-center gap-3 text-sm text-muted">
            <span className={`shrink-0 ${p.highlight ? 'text-volt' : 'text-neon'}`}>
              <Icon name={f.icon as IconName} size={17} />
            </span>
            {f.label}
          </li>
        ))}
      </ul>

      <Button
        href={WA.plan(`${p.name} Premium`, p.price)}
        variant={p.highlight ? 'volt' : 'outline'}
        size="lg"
        iconRight="arrow"
        fullWidth
        className="mt-6"
      >
        Get Your Subscription
      </Button>
    </motion.div>
  )
}

export function Pricing() {
  const ordered = [...PLANS].sort((a, b) => a.months - b.months)
  return (
    <Section id="pricing">
      <SectionHeading
        eyebrow="Simple pricing"
        title={<>One premium tier. <span className="text-gradient">Pick your length.</span></>}
        subtitle="Every plan unlocks the full 20K-channel 4K experience — all sports, PPV, VODs, built-in VPN and anti-freeze. Just choose how long you want to roll."
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={inViewOnce}
        className="mt-16 grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {ordered.map((p) => (
          <PlanCard key={p.id} p={p} />
        ))}
      </motion.div>

      <div className="mt-8 flex flex-col items-center gap-2 text-center">
        <p className="inline-flex items-center gap-2 text-sm text-muted">
          <Icon name="shield" size={16} className="text-volt" />
          12-hour free trial on every plan · Secure WhatsApp checkout
        </p>
        <a href={WA.pricingGeneral} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-neon hover:underline">
          Not sure which plan? Ask us →
        </a>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
          {PAY.map((src) => (
            <span key={src} className="grid h-8 w-12 place-items-center rounded-md border border-line bg-surface px-1.5">
              <img src={src} alt="" className="max-h-4 w-auto" />
            </span>
          ))}
        </div>
      </div>
    </Section>
  )
}
