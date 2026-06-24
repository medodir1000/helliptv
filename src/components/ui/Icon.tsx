import {
  Zap,
  MonitorPlay,
  ShieldCheck,
  MonitorSmartphone,
  Globe,
  Clock,
  Check,
  Play,
  Star,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  Signal,
  Server,
  Wifi,
  Download,
  ArrowRight,
  Flame,
  Lock,
  Trophy,
  type LucideIcon,
} from 'lucide-react'
import type { SVGProps } from 'react'

export type IconName =
  | 'bolt' | 'uhd' | 'shield' | 'devices' | 'globe' | 'clock'
  | 'whatsapp' | 'check' | 'play' | 'star' | 'chevron' | 'menu'
  | 'close' | 'sparkles' | 'signal' | 'server' | 'wifi' | 'download'
  | 'arrow' | 'fire' | 'lock' | 'trophy'

/** Our semantic names → Lucide icons (consistent, professional set). */
const MAP: Record<Exclude<IconName, 'whatsapp'>, LucideIcon> = {
  bolt: Zap,
  uhd: MonitorPlay,
  shield: ShieldCheck,
  devices: MonitorSmartphone,
  globe: Globe,
  clock: Clock,
  check: Check,
  play: Play,
  star: Star,
  chevron: ChevronDown,
  menu: Menu,
  close: X,
  sparkles: Sparkles,
  signal: Signal,
  server: Server,
  wifi: Wifi,
  download: Download,
  arrow: ArrowRight,
  fire: Flame,
  lock: Lock,
  trophy: Trophy,
}

/** Glyphs that read better filled (ratings, play, flame). */
const FILLED: IconName[] = ['star', 'play', 'fire']

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'ref'> {
  name: IconName
  size?: number
}

export function Icon({ name, size = 24, ...props }: IconProps) {
  if (name === 'whatsapp') {
    // Lucide has no brand icons — keep the official WhatsApp glyph.
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
        <path d="M12 2.5A9.5 9.5 0 0 0 3.7 16.7L2.5 21.5l4.9-1.2A9.5 9.5 0 1 0 12 2.5Zm5.3 13.4c-.2.6-1.2 1.2-1.7 1.2-.4.1-1 .1-1.6-.1-.4-.1-.9-.3-1.5-.6-2.7-1.2-4.4-3.9-4.6-4.1-.1-.2-1-1.4-1-2.6 0-1.2.6-1.8.9-2.1.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .5l-.4.6c-.2.2-.3.4-.1.7.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.2.1.4.1.6-.1l.7-.9c.2-.2.4-.2.6-.1l1.8.9c.3.1.4.2.5.3.1.2.1.6-.1 1.2Z" />
      </svg>
    )
  }

  const Glyph = MAP[name]
  const filled = FILLED.includes(name)
  return (
    <Glyph
      size={size}
      strokeWidth={1.9}
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'none' : 'currentColor'}
      aria-hidden="true"
      {...props}
    />
  )
}
