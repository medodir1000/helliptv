import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Icon } from './ui/Icon'
import { Logo } from './ui/Logo'
import { usePWAInstall } from '../hooks/usePWAInstall'
import { EASE_OUT } from './anim/motion'
import { PROMO_CLOSED_EVENT } from './PromoModal'

const DISMISS_KEY = 'helliptv:pwa-dismissed'

export function PWAInstallPrompt() {
  const { canInstall, installed, promptInstall } = usePWAInstall()
  const [visible, setVisible] = useState(false)
  const [showIosHint, setShowIosHint] = useState(false)

  useEffect(() => {
    if (installed) return
    if (localStorage.getItem(DISMISS_KEY)) return

    let id: ReturnType<typeof setTimeout>
    let armed = false
    const arm = () => {
      if (armed) return
      armed = true
      id = setTimeout(() => setVisible(true), 6000)
    }

    // The promo modal pops on every load — wait until it's dismissed so we
    // never stack two popups. Fallback-arm in case the promo isn't present.
    const onPromoClosed = () => arm()
    window.addEventListener(PROMO_CLOSED_EVENT, onPromoClosed, { once: true })
    const fallback = setTimeout(arm, 15000)
    return () => {
      window.removeEventListener(PROMO_CLOSED_EVENT, onPromoClosed)
      clearTimeout(id)
      clearTimeout(fallback)
    }
  }, [installed])

  const dismiss = () => {
    setVisible(false)
    try {
      localStorage.setItem(DISMISS_KEY, '1')
    } catch {
      /* ignore */
    }
  }

  const onInstall = async () => {
    if (canInstall) {
      await promptInstall()
      dismiss()
    } else {
      setShowIosHint((v) => !v)
    }
  }

  if (installed) return null

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.4, ease: EASE_OUT }}
          className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-md sm:left-5 sm:right-auto sm:bottom-24"
        >
          <div className="relative overflow-hidden rounded-2xl glass-strong p-4 shadow-2xl">
            <button
              onClick={dismiss}
              aria-label="Dismiss"
              className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full text-faint hover:bg-surface-2 hover:text-fg"
            >
              <Icon name="close" size={16} />
            </button>

            <div className="flex items-start gap-3.5 pr-6">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-neon/10 ring-1 ring-neon/30">
                <Logo withWordmark={false} />
              </span>
              <div>
                <p className="font-display text-sm font-bold text-fg">Install the HellIPTV Web Player</p>
                <p className="mt-0.5 text-[13px] leading-relaxed text-muted">
                  Add it to your home screen for ad-free, full-screen streaming — launches like a native app.
                </p>
              </div>
            </div>

            <AnimatePresence>
              {showIosHint && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 rounded-lg bg-canvas/60 px-3 py-2 text-xs text-muted"
                >
                  On iPhone: tap the <span className="font-semibold text-fg">Share</span> icon, then{' '}
                  <span className="font-semibold text-fg">“Add to Home Screen.”</span>
                </motion.p>
              )}
            </AnimatePresence>

            <div className="mt-3.5 flex gap-2.5">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onInstall}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[linear-gradient(100deg,#720eec,#8b1fe0,#c000ff)] px-4 py-2.5 text-sm font-semibold text-white glow-purple"
              >
                <Icon name="download" size={16} /> Install app
              </motion.button>
              <button onClick={dismiss} className="rounded-full px-4 py-2.5 text-sm font-medium text-muted hover:text-fg">
                Later
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
