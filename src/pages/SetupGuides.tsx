import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PageHeader } from '../components/ui/PageHeader'
import { Section } from '../components/ui/Section'
import { Icon, type IconName } from '../components/ui/Icon'
import { FinalCTA } from '../components/FinalCTA'
import { fadeUp, inViewOnce, staggerContainer } from '../components/anim/motion'
import { DEVICES } from '../lib/devices'
import { useSeo } from '../hooks/useSeo'

export function SetupGuides() {
  useSeo({
    title: 'Setup Guides',
    description:
      'Set up HellIPTV on any device in under 10 minutes — Smart TV, Firestick, Android, iOS, Apple TV, Mac, MAG and Formuler.',
    path: '/setup-guides',
  })
  return (
    <>
      <PageHeader
        eyebrow="Setup guides"
        crumbs={[{ label: 'Setup guides' }]}
        title={<>Up and running in <span className="text-gradient">under 10 minutes</span></>}
        subtitle="Pick your device for step-by-step instructions. Whatever you own, HellIPTV streams in 4K — one subscription, every screen."
      />

      <Section className="!pt-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={inViewOnce}
          className="grid gap-4 sm:grid-cols-2"
        >
          {DEVICES.map((d) => (
            <motion.div key={d.slug} variants={fadeUp} whileHover={{ y: -4 }}>
              <Link
                to={`/devices/${d.slug}`}
                className="group flex h-full items-center gap-4 rounded-3xl border border-line bg-surface/50 p-6 transition-colors hover:border-neon/40"
              >
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-neon/10 text-neon ring-1 ring-neon/30">
                  <Icon name={d.icon as IconName} size={26} />
                </span>
                <div className="min-w-0">
                  <p className="font-display text-lg font-bold text-fg">{d.name}</p>
                  <p className="mt-0.5 truncate text-sm text-muted">{d.short}</p>
                </div>
                <Icon
                  name="arrow"
                  size={20}
                  className="ml-auto shrink-0 text-faint transition-transform group-hover:translate-x-1 group-hover:text-neon"
                />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      <FinalCTA />
    </>
  )
}
