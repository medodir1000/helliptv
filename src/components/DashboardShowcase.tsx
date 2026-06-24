import { motion } from 'framer-motion'
import { Section, SectionHeading } from './ui/Section'
import { Icon, type IconName } from './ui/Icon'
import { Button } from './ui/Button'
import { WA } from '../lib/whatsapp'
import { EASE_OUT } from './anim/motion'
import devicesImg from '../assets/devices.webp'

const HIGHLIGHTS: { icon: IconName; label: string; note: string }[] = [
  { icon: 'trophy', label: 'Live sports hub', note: 'Every match, every league, with full EPG' },
  { icon: 'play', label: 'Movie & VOD library', note: '90,000+ films and box-sets on demand' },
  { icon: 'uhd', label: '4K multi-screen', note: 'Native UHD across TV, phone and tablet' },
]

export function DashboardShowcase() {
  return (
    <Section id="showcase">
      <div className="grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr]">
        {/* ── Copy ── */}
        <div>
          <SectionHeading
            align="left"
            eyebrow="The interface"
            title={<>The real <span className="text-gradient">HellIPTV</span> experience</>}
            subtitle="The actual app across your TV, phone and tablet — live sports, movies and series in one slick, lightning-fast interface."
          />

          <div className="mt-7 flex flex-col gap-3">
            {HIGHLIGHTS.map((h) => (
              <div key={h.label} className="flex items-center gap-3.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-neon/10 text-neon ring-1 ring-neon/20">
                  <Icon name={h.icon} size={17} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-fg">{h.label}</p>
                  <p className="text-xs text-faint">{h.note}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <Button href={WA.freeTrial} variant="primary" size="lg" icon="whatsapp">
              See it live — free 12h trial
            </Button>
          </div>
        </div>

        {/* ── Preview frame (static) ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: EASE_OUT }}
          className="ring-conic relative overflow-hidden rounded-[1.75rem]"
        >
          <div className="group relative aspect-[16/10] w-full overflow-hidden rounded-[1.75rem] bg-surface">
            <img
              src={devicesImg}
              alt="HellIPTV interface on a TV, phone and tablet showing live sports and movies"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.05]"
              width={1500}
              height={844}
              loading="lazy"
            />
            <span className="absolute left-4 top-4 z-10 rounded-full bg-black/50 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur">
              Live interface
            </span>
          </div>
        </motion.div>
      </div>
    </Section>
  )
}
