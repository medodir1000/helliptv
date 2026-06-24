import { motion } from 'framer-motion'
import { Section, SectionHeading } from './ui/Section'

/* Auto-load every app logo from the assets folder (sorted). */
const appMods = import.meta.glob('../assets/apps/*.webp', { eager: true, import: 'default' })
const APPS = Object.entries(appMods)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, url]) => url as string)

export function CompatibleApps() {
  const center = Math.floor(APPS.length / 2)

  return (
    <Section id="apps">
      <SectionHeading
        eyebrow="Works everywhere"
        title={<>Use it with your <span className="text-gradient">favourite player</span></>}
        subtitle="HellIPTV plugs straight into the apps you already know — IPTV Smarters, TiviMate, Duplex, BOB Player and more, on every device."
      />

      <div className="relative mt-16 flex items-center justify-center">
        {/* concentric orbit rings + orbiting dot (desktop) */}
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 lg:block">
          <div className="relative h-[340px] w-[340px] rounded-full border border-line">
            <motion.div
              className="absolute inset-0"
              animate={{ rotate: 360 }}
              transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
            >
              <span className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-volt shadow-[0_0_0_4px_rgba(22,163,74,0.15)]" />
            </motion.div>
          </div>
          <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-line/60" />
        </div>

        {/* row of app badges */}
        <div className="relative flex flex-wrap items-center justify-center gap-5 sm:gap-7 lg:flex-nowrap lg:gap-9">
          {APPS.map((src, i) => {
            const isCenter = i === center
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.6 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ type: 'spring', stiffness: 240, damping: 18, delay: i * 0.06 }}
                whileHover={{ y: -6 }}
                className={`grid shrink-0 place-items-center rounded-full transition-shadow ${
                  isCenter
                    ? 'h-32 w-32 bg-surface-2 ring-1 ring-neon/25 shadow-[0_24px_50px_-24px_rgba(114,14,236,0.4)] sm:h-36 sm:w-36'
                    : 'h-24 w-24 bg-surface ring-1 ring-line shadow-[0_10px_28px_-20px_rgba(17,19,28,0.4)] hover:ring-neon/40'
                }`}
              >
                <img
                  src={src}
                  alt=""
                  loading="lazy"
                  className={`object-contain ${isCenter ? 'h-16 w-16 sm:h-[4.5rem] sm:w-[4.5rem]' : 'h-12 w-12'}`}
                />
              </motion.div>
            )
          })}
        </div>
      </div>
    </Section>
  )
}
