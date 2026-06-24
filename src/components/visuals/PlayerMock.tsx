import { motion } from 'framer-motion'
import { Icon } from '../ui/Icon'

/**
 * Hand-built "live 4K player" UI mock used in the hero. Always crisp, no
 * external assets. Conveys the product: live sport, 4K, fully-buffered.
 */
export function PlayerMock() {
  return (
    <div className="ring-conic relative w-full overflow-hidden rounded-[1.75rem]">
      <div className="relative rounded-[1.75rem] bg-surface/80 p-2 backdrop-blur-xl">
        {/* screen */}
        <div className="relative aspect-video overflow-hidden rounded-[1.35rem] bg-[radial-gradient(120%_120%_at_50%_0%,#1b1b36_0%,#0a0a16_70%)]">
          {/* pitch glow */}
          <div className="absolute inset-0 opacity-70 [background:repeating-linear-gradient(90deg,transparent_0_38px,rgba(45,255,140,0.05)_38px_76px)]" />
          <div className="absolute -bottom-16 left-1/2 h-56 w-[140%] -translate-x-1/2 rounded-[100%] bg-volt/10 blur-2xl" />

          {/* scan line */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-[linear-gradient(180deg,rgba(168,85,247,0.25),transparent)] animate-scan" />

          {/* top HUD */}
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-danger opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-danger" />
              </span>
              Live
            </span>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-volt/15 px-2 py-1 text-[11px] font-bold text-volt ring-1 ring-volt/40">
                4K UHD
              </span>
              <Icon name="signal" size={16} className="text-volt" />
            </div>
          </div>

          {/* center play */}
          <div className="absolute inset-0 grid place-items-center">
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className="grid h-16 w-16 place-items-center rounded-full bg-white/10 text-white backdrop-blur-md ring-1 ring-white/25"
              aria-label="Play"
            >
              <Icon name="play" size={26} className="translate-x-0.5" />
            </motion.button>
          </div>

          {/* scoreline */}
          <div className="absolute inset-x-0 bottom-0 p-4">
            <div className="mb-3 flex items-end justify-between">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-volt">World Cup 2026 · QF</p>
                <p className="font-display text-lg font-bold text-white">
                  ENG <span className="text-volt">2</span> — <span className="text-volt">1</span> BRA
                </p>
              </div>
              <span className="font-mono-nums rounded-md bg-black/40 px-2 py-1 text-xs font-bold text-white backdrop-blur">
                67′
              </span>
            </div>
            {/* buffer bar — fully buffered = no lag */}
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/15">
              <div className="h-full w-[97%] rounded-full bg-[linear-gradient(90deg,#a855f7,#2dff8c)]" />
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-white/70">
              <span className="inline-flex items-center gap-1.5">
                <Icon name="bolt" size={12} className="text-volt" /> Buffer-free
              </span>
              <span className="font-mono-nums">62.4 Mbps</span>
            </div>
          </div>
        </div>
      </div>

      {/* floating channel chip */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -right-3 top-10 hidden rounded-2xl glass-strong p-3 shadow-xl sm:block"
      >
        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-faint">Now on</p>
        <div className="flex flex-col gap-1.5">
          {['Sky Sports', 'beIN 1', 'ESPN+'].map((c, i) => (
            <span
              key={c}
              className={`flex items-center gap-2 rounded-lg px-2 py-1 text-xs font-medium ${
                i === 0 ? 'bg-neon/15 text-white ring-1 ring-neon/40' : 'text-muted'
              }`}
            >
              <Icon name="play" size={9} /> {c}
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
