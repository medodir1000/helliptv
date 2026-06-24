import type { Variants, Transition } from 'framer-motion'

/* ════════════════════════════════════════════════════════════════
   Shared motion language (animate-skill / Emil-Kowalski principles)
   · ease-out for entrances, faster exits
   · transform + opacity only (GPU-friendly)
   · springs for natural, interruptible motion
   ════════════════════════════════════════════════════════════════ */

export const EASE_OUT = [0.16, 1, 0.3, 1] as const
export const EASE_OUT_BACK = [0.34, 1.56, 0.64, 1] as const

export const springSoft: Transition = { type: 'spring', stiffness: 220, damping: 28, mass: 0.9 }
export const springSnappy: Transition = { type: 'spring', stiffness: 420, damping: 32 }

/** Fade + rise — the workhorse scroll-reveal. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.7, ease: EASE_OUT } },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.55, ease: EASE_OUT } },
}

/** Stagger container — children reveal in sequence (30–50ms feel). */
export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
}

/** Hover micro-interaction for tappable cards/buttons. */
export const hoverLift = {
  whileHover: { y: -4, transition: springSnappy },
  whileTap: { scale: 0.98 },
}

/** Standard viewport trigger config for whileInView. */
export const inViewOnce = { once: true, amount: 0.3 } as const
