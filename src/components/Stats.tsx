import { motion } from 'framer-motion'
import { STATS } from '../lib/site'
import { Counter } from './anim/Counter'
import { Icon } from './ui/Icon'
import { Pill } from './ui/Section'
import { Reveal } from './anim/Reveal'
import { fadeUp, inViewOnce, staggerContainer } from './anim/motion'
import serversImg from '../assets/servers.webp'

export function Stats() {
  return (
    <div className="relative mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        {/* copy + counters */}
        <div>
          <Reveal className="flex flex-col gap-4">
            <Pill icon={<Icon name="server" size={13} />}>Anti-freeze infrastructure</Pill>
            <h2 className="text-3xl font-bold sm:text-4xl">
              Built on servers that <span className="text-gradient-volt">don’t blink</span>
            </h2>
            <p className="max-w-md text-pretty text-muted">
              Redundant edge servers across three continents push 24.8 Tb/s with 99.9% uptime and real-time
              multi-CDN balancing — so kickoff stays smooth, worldwide.
            </p>
          </Reveal>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={inViewOnce}
            className="mt-8 grid grid-cols-2 gap-4"
          >
            {STATS.map((s) => (
              <motion.div key={s.label} variants={fadeUp} className="rounded-2xl border border-line bg-surface/50 p-5">
                <span className="font-display text-3xl font-bold text-gradient sm:text-4xl">
                  <Counter to={s.value} decimals={s.decimals} suffix={s.suffix} />
                </span>
                <p className="mt-1 text-sm text-muted">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* servers visual */}
        <Reveal direction="left" className="ring-conic group relative overflow-hidden rounded-3xl">
          <img
            src={serversImg}
            alt="HellIPTV anti-freeze streaming servers and global CDN network"
            className="w-full rounded-3xl object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.05]"
            width={1500}
            height={844}
            loading="lazy"
          />
          <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/5" />
        </Reveal>
      </div>
    </div>
  )
}
