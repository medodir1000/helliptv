import { motion } from 'framer-motion'
import { Icon } from '../ui/Icon'
import heroTv from '../../assets/hero-tv.webp'

/** Hero lifestyle visual: premium living-room 4K stream, framed with glow + chips. */
export function HeroVisual() {
  return (
    <div className="ring-conic relative w-full overflow-hidden rounded-[1.75rem]">
      <div className="group relative overflow-hidden rounded-[1.75rem] bg-surface/80 p-2 backdrop-blur-xl">
        <img
          src={heroTv}
          alt="HellIPTV streaming a live Champions League match in 4K on a wall-mounted TV"
          className="block w-full rounded-[1.35rem] object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
          width={1400}
          height={788}
          loading="eager"
        />
        {/* subtle top sheen */}
        <div className="pointer-events-none absolute inset-x-2 top-2 h-24 rounded-t-[1.35rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.06),transparent)]" />
      </div>

      {/* floating "buffer-free" chip */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-4 -left-3 hidden rounded-2xl glass-strong p-3.5 shadow-xl sm:block"
      >
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-volt/15 text-volt ring-1 ring-volt/30">
            <Icon name="bolt" size={20} />
          </span>
          <div>
            <p className="font-mono-nums text-lg font-bold leading-none text-fg">62.4 Mbps</p>
            <p className="mt-1 text-[11px] font-medium text-faint">Buffer-free · 4K UHD</p>
          </div>
        </div>
      </motion.div>

      {/* floating rating chip */}
      <motion.div
        animate={{ y: [0, 9, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
        className="absolute -right-3 top-8 hidden rounded-2xl glass-strong px-3.5 py-2.5 shadow-xl md:block"
      >
        <div className="flex items-center gap-1 text-volt">
          {Array.from({ length: 5 }).map((_, i) => (
            <Icon key={i} name="star" size={13} />
          ))}
        </div>
        <p className="mt-1 text-[11px] font-medium text-faint">4.8 · 60k+ members</p>
      </motion.div>
    </div>
  )
}
