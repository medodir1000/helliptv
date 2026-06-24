import { Link } from 'react-router-dom'
import { Logo } from './ui/Logo'
import { Icon } from './ui/Icon'
import { BRAND } from '../lib/site'
import { WA, WHATSAPP_DISPLAY } from '../lib/whatsapp'

interface FooterLink {
  label: string
  to?: string // internal route
  href?: string // external (WhatsApp)
}
const COLS: { title: string; links: FooterLink[] }[] = [
  {
    title: 'Product',
    links: [
      { label: 'Features', to: '/features' },
      { label: 'Speed test', to: '/speed-test' },
      { label: 'Channels', to: '/channels' },
      { label: 'Pricing', to: '/pricing' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'FAQ', to: '/faq' },
      { label: 'WhatsApp support', href: WA.support },
      { label: 'Setup guides', to: '/setup-guides' },
      { label: 'Free trial', href: WA.freeTrial },
    ],
  },
  {
    title: 'Devices',
    links: [
      { label: 'Smart TV & Firestick', to: '/devices/smart-tv-firestick' },
      { label: 'Android & iOS', to: '/devices/android-ios' },
      { label: 'Apple TV & Mac', to: '/devices/apple-tv-mac' },
      { label: 'MAG & Formuler', to: '/devices/mag-formuler' },
    ],
  },
]

const linkCls = 'text-sm text-muted transition-colors hover:text-fg'

export function Footer() {
  return (
    <footer className="relative border-t border-line bg-canvas-2">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="flex flex-col gap-4">
          <Link to="/" aria-label="HellIPTV home">
            <Logo className="h-12" />
          </Link>
          <p className="max-w-xs text-sm leading-relaxed text-muted">{BRAND.tagline} 22,000+ channels & 90,000+ VOD in 4K, worldwide.</p>
          <a href={WA.support} target="_blank" rel="noopener noreferrer" className="inline-flex w-fit items-center gap-2 rounded-full border border-volt/30 bg-volt/10 px-4 py-2 text-sm font-semibold text-volt transition-colors hover:bg-volt/20">
            <Icon name="whatsapp" size={16} /> {WHATSAPP_DISPLAY}
          </a>
        </div>

        {COLS.map((c) => (
          <div key={c.title} className="flex flex-col gap-3">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-faint">{c.title}</p>
            {c.links.map((l) =>
              l.to ? (
                <Link key={l.label} to={l.to} className={linkCls}>
                  {l.label}
                </Link>
              ) : (
                <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className={linkCls}>
                  {l.label}
                </a>
              ),
            )}
          </div>
        ))}
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-6 text-center sm:flex-row sm:px-8 sm:text-left">
          <p className="text-xs text-faint">© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</p>
          <p className="max-w-2xl text-[11px] leading-relaxed text-faint">
            {BRAND.name} is an independent service and is not affiliated with or endorsed by any TV network or
            streaming brand named above. Members are responsible for compliance with their local laws.
          </p>
        </div>
      </div>
    </footer>
  )
}
