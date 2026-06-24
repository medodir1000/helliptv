import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Icon } from './ui/Icon'
import { WA } from '../lib/whatsapp'
import { springSnappy } from './anim/motion'

/** Persistent floating WhatsApp CTA — appears once the user scrolls past the hero. */
export function StickyWhatsApp() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 640)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <AnimatePresence>
      {show && (
        <motion.a
          href={WA.freeTrial}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Start free trial on WhatsApp"
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          whileHover={{ scale: 1.06, transition: springSnappy }}
          whileTap={{ scale: 0.94 }}
          className="group fixed bottom-5 right-5 z-50 flex items-center gap-0 overflow-hidden rounded-full bg-[linear-gradient(100deg,#16a34a,#15803d)] py-3.5 pl-4 pr-4 text-white glow-volt sm:bottom-7 sm:right-7"
        >
          <span className="relative flex h-7 w-7 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/40" />
            <Icon name="whatsapp" size={26} className="relative" />
          </span>
          <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-bold transition-all duration-300 group-hover:ml-2.5 group-hover:max-w-[10rem]">
            Free 12h trial
          </span>
        </motion.a>
      )}
    </AnimatePresence>
  )
}
