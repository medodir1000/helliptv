import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import promoImg from '../assets/promo-free-trial.webp'
import { WA } from '../lib/whatsapp'

/* Shown once per visitor on first load. The whole offer is a single designed
   image (popcorn + “Free Trial · 12 Hours”); we overlay transparent buttons
   exactly on its baked-in X / Start-trial / Maybe-later so they’re interactive
   and stay aligned at any size. */
export const PROMO_CLOSED_EVENT = 'helliptv:promo-closed'

export function PromoModal() {
  const [open, setOpen] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)

  // Show on every page load / refresh (it stays mounted across SPA navigation,
  // so it only re-pops on an actual reload, not on in-app route changes).
  useEffect(() => {
    const t = setTimeout(() => setOpen(true), 700)
    return () => clearTimeout(t)
  }, [])

  const dismiss = useCallback(() => {
    setOpen(false)
    window.dispatchEvent(new Event(PROMO_CLOSED_EVENT))
  }, [])

  const startTrial = useCallback(() => {
    window.open(WA.freeTrial, '_blank', 'noopener,noreferrer')
    dismiss()
  }, [dismiss])

  // scroll-lock, escape-to-close and initial focus while open
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusT = setTimeout(() => closeRef.current?.focus(), 80)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      clearTimeout(focusT)
    }
  }, [open, dismiss])

  const hotspot =
    'absolute cursor-pointer rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-0'

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] grid place-items-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={dismiss}
        >
          {/* scrim */}
          <div className="absolute inset-0 bg-[#06060c]/80 backdrop-blur-sm" />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Claim your free 12-hour HellIPTV trial"
            className="relative w-[min(92vw,430px)]"
            initial={{ opacity: 0, scale: 0.85, y: 26 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 16 }}
            transition={{ type: 'spring', stiffness: 250, damping: 22 }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={promoImg}
              alt="HellIPTV free 12-hour 4K trial — unlimited movies and series, all devices, no commitment, cancel anytime."
              draggable={false}
              className="w-full select-none rounded-[1.6rem] shadow-[0_30px_90px_-20px_rgba(124,18,236,0.55)]"
            />

            {/* Start Free Trial → WhatsApp (over the gradient bar) */}
            <button
              type="button"
              onClick={startTrial}
              aria-label="Start your free 12-hour trial on WhatsApp"
              className={`${hotspot} left-[15%] top-[79%] h-[11%] w-[70%]`}
            />
            {/* Close (over the X) */}
            <button
              ref={closeRef}
              type="button"
              onClick={dismiss}
              aria-label="Close"
              className={`${hotspot} right-[3%] top-[3.5%] h-[11%] w-[12%]`}
            />
            {/* Maybe later */}
            <button
              type="button"
              onClick={dismiss}
              aria-label="Maybe later"
              className={`${hotspot} bottom-[1.5%] left-[34%] h-[7%] w-[32%] !rounded-lg`}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
