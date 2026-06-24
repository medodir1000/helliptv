import { useParams, Navigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PageHeader } from '../components/ui/PageHeader'
import { Section } from '../components/ui/Section'
import { Icon, type IconName } from '../components/ui/Icon'
import { Button } from '../components/ui/Button'
import { FinalCTA } from '../components/FinalCTA'
import { Reveal } from '../components/anim/Reveal'
import { fadeUp, inViewOnce, staggerContainer } from '../components/anim/motion'
import { getDevice, DEVICES } from '../lib/devices'
import { WA } from '../lib/whatsapp'
import { useSeo } from '../hooks/useSeo'

export function DevicePage() {
  const { slug } = useParams()
  const device = slug ? getDevice(slug) : undefined
  useSeo({
    title: device ? `${device.name} Setup` : 'Setup Guides',
    description: device
      ? `Set up HellIPTV on ${device.name} in ${device.steps.length} easy steps — recommended apps, login details and pro tips for flawless 4K streaming.`
      : 'Set up HellIPTV on any device in minutes.',
    path: device ? `/devices/${device.slug}` : '/setup-guides',
  })

  if (!device) return <Navigate to="/setup-guides" replace />

  const others = DEVICES.filter((d) => d.slug !== device.slug)

  return (
    <>
      <PageHeader
        eyebrow="Setup guide"
        crumbs={[{ label: 'Setup guides', to: '/setup-guides' }, { label: device.name }]}
        title={
          <>
            Set up <span className="text-gradient">{device.name}</span>
          </>
        }
        subtitle={device.tagline}
      />

      <Section className="!pt-6">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_0.6fr]">
          {/* main column */}
          <div className="flex flex-col gap-12">
            {/* recommended apps */}
            <div>
              <h2 className="font-display text-xl font-bold text-fg sm:text-2xl">Recommended players</h2>
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="show"
                viewport={inViewOnce}
                className="mt-5 grid gap-3 sm:grid-cols-3"
              >
                {device.apps.map((a) => (
                  <motion.div
                    key={a.name}
                    variants={fadeUp}
                    className="rounded-2xl border border-line bg-surface/50 p-4"
                  >
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-neon/10 text-neon ring-1 ring-neon/30">
                      <Icon name="play" size={18} />
                    </span>
                    <p className="mt-3 font-display text-sm font-bold text-fg">{a.name}</p>
                    <p className="mt-0.5 text-xs text-faint">{a.store}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* steps */}
            <div>
              <h2 className="font-display text-xl font-bold text-fg sm:text-2xl">
                Set up in {device.steps.length} steps
              </h2>
              <motion.ol
                variants={staggerContainer}
                initial="hidden"
                whileInView="show"
                viewport={inViewOnce}
                className="mt-6 flex flex-col gap-4"
              >
                {device.steps.map((s, i) => (
                  <motion.li
                    key={s.title}
                    variants={fadeUp}
                    className="flex gap-4 rounded-2xl border border-line bg-surface/40 p-5"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[linear-gradient(120deg,#720eec,#9a2bf0)] font-display text-sm font-bold text-white">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-display text-base font-bold text-fg">{s.title}</p>
                      <p className="mt-1 text-[15px] leading-relaxed text-muted">{s.body}</p>
                    </div>
                  </motion.li>
                ))}
              </motion.ol>
            </div>

            {/* tip */}
            <div className="flex items-start gap-3 rounded-2xl border border-volt/30 bg-volt/10 p-5">
              <Icon name="sparkles" size={20} className="mt-0.5 shrink-0 text-volt" />
              <p className="text-sm text-fg">
                <span className="font-bold">Pro tip · </span>
                {device.tip}
              </p>
            </div>

            <Button href={WA.freeTrial} variant="volt" size="lg" icon="whatsapp" className="w-fit">
              Get your line on WhatsApp
            </Button>
          </div>

          {/* sidebar: other devices */}
          <aside className="lg:pt-9">
            <Reveal>
              <div className="rounded-3xl border border-line bg-surface/50 p-6">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-faint">Other devices</p>
                <div className="mt-4 flex flex-col gap-2">
                  {others.map((d) => (
                    <Link
                      key={d.slug}
                      to={`/devices/${d.slug}`}
                      className="group flex items-center gap-3 rounded-xl border border-line bg-canvas/40 p-3 transition-colors hover:border-neon/40"
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-neon/10 text-neon ring-1 ring-neon/30">
                        <Icon name={d.icon as IconName} size={17} />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-fg">{d.name}</span>
                        <span className="block truncate text-xs text-faint">{d.short}</span>
                      </span>
                      <Icon name="arrow" size={15} className="ml-auto text-faint transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  ))}
                </div>
              </div>
            </Reveal>
          </aside>
        </div>
      </Section>

      <FinalCTA />
    </>
  )
}
