import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Logo } from './ui/Logo'
import { Button } from './ui/Button'
import { LanguageSwitcher } from './ui/LanguageSwitcher'
import { Icon, type IconName } from './ui/Icon'
import { WA } from '../lib/whatsapp'
import { DEVICES } from '../lib/devices'
import { EASE_OUT } from './anim/motion'

interface NavItem {
  label: string
  to?: string
  dropdown?: boolean
}
const NAV: NavItem[] = [
  { label: 'Features', to: '/features' },
  { label: 'Speed Test', to: '/speed-test' },
  { label: 'Channels', to: '/channels' },
  { label: 'Devices', dropdown: true },
  { label: 'Pricing', to: '/pricing' },
  { label: 'FAQ', to: '/faq' },
  { label: 'Blog', to: '/blog' },
]

const itemCls = 'rounded-full px-4 py-2 text-sm font-medium text-muted transition-colors hover:text-fg'

function DevicesDropdown() {
  return (
    <div className="group relative">
      <Link to="/setup-guides" className={`flex items-center gap-1 ${itemCls}`}>
        Devices
        <Icon name="chevron" size={14} className="transition-transform duration-200 group-hover:rotate-180" />
      </Link>
      <div className="invisible absolute left-1/2 top-full z-50 w-72 -translate-x-1/2 pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
        <div className="rounded-2xl glass-strong p-2 shadow-2xl">
          {DEVICES.map((d) => (
            <Link key={d.slug} to={`/devices/${d.slug}`} className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-surface-2">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-neon/10 text-neon ring-1 ring-neon/30">
                <Icon name={d.icon as IconName} size={17} />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-fg">{d.name}</span>
                <span className="block truncate text-xs text-faint">{d.short}</span>
              </span>
            </Link>
          ))}
          <Link to="/setup-guides" className="mt-1 flex items-center justify-center gap-1.5 rounded-xl border border-line p-2.5 text-xs font-bold uppercase tracking-wider text-neon transition-colors hover:bg-surface-2">
            All setup guides <Icon name="arrow" size={13} />
          </Link>
        </div>
      </div>
    </div>
  )
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: EASE_OUT }}
        className={`mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 transition-all duration-300 sm:px-8 ${
          scrolled ? 'my-2.5 rounded-2xl glass-strong py-2.5' : 'py-4'
        }`}
        style={scrolled ? { marginInline: 'max(1rem, calc((100vw - 80rem) / 2 + 1rem))' } : undefined}
      >
        <Link to="/" aria-label="HellIPTV home">
          <Logo className="h-9 sm:h-11" />
        </Link>

        <div className="hidden items-center gap-0.5 lg:flex">
          {NAV.map((l) =>
            l.dropdown ? (
              <DevicesDropdown key={l.label} />
            ) : (
              <Link key={l.label} to={l.to!} className={itemCls}>
                {l.label}
              </Link>
            ),
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* always visible — mobile + desktop */}
          <LanguageSwitcher />
          <div className="hidden lg:block">
            <Button href={WA.freeTrial} variant="volt" size="md" icon="whatsapp">
              Free 12h Trial
            </Button>
          </div>
          <button
            className="grid h-10 w-10 place-items-center rounded-xl glass text-fg lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            <Icon name={open ? 'close' : 'menu'} size={22} />
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
            className="mx-4 mt-2 max-h-[80vh] overflow-y-auto rounded-2xl glass-strong p-4 lg:hidden"
          >
            <div className="flex flex-col">
              {NAV.filter((l) => !l.dropdown).map((l) => (
                <Link
                  key={l.label}
                  to={l.to!}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-3 text-base font-medium text-muted transition-colors hover:bg-surface-2 hover:text-fg"
                >
                  {l.label}
                </Link>
              ))}

              <p className="mt-3 px-4 pb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-faint">Devices</p>
              {DEVICES.map((d) => (
                <Link
                  key={d.slug}
                  to={`/devices/${d.slug}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-fg"
                >
                  <Icon name={d.icon as IconName} size={16} className="text-neon" />
                  {d.name}
                </Link>
              ))}

              <div className="mt-3">
                <Button href={WA.freeTrial} variant="volt" size="lg" icon="whatsapp" fullWidth>
                  Claim Free 12h Trial
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
