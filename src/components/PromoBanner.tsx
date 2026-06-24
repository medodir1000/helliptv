import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Icon } from './ui/Icon'
import { WA } from '../lib/whatsapp'

/** Slim dismissible promo bar pinned to the very top of the page. */
export function PromoBanner() {
  const [open, setOpen] = useState(true)

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: 'auto' }}
          exit={{ height: 0, opacity: 0 }}
          className="relative z-[60] overflow-hidden bg-[linear-gradient(100deg,#720eec,#8b1fe0,#c000ff)]"
        >
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-10 py-2 text-center text-sm font-medium text-white">
            <Icon name="trophy" size={15} className="hidden sm:block" />
            <span>
              <span className="font-bold">World Cup 2026 is live.</span> Get a free 12-hour 4K trial —
            </span>
            <a href={WA.worldCup} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-0.5 font-bold underline-offset-2 hover:bg-white/30">
              claim now <Icon name="arrow" size={13} />
            </a>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Dismiss banner"
            className="absolute right-3 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-white/80 hover:bg-white/20 hover:text-white"
          >
            <Icon name="close" size={15} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
