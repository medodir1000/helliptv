/* ════════════════════════════════════════════════════════════════
   HellIPTV — site content & data model
   Edit copy, pricing, and fixtures here; components stay presentational.
   ════════════════════════════════════════════════════════════════ */

export const BRAND = {
  name: 'HellIPTV',
  domain: 'helliptv.com',
  tagline: 'The underground standard for 4K streaming.',
} as const

/* ── Headline stats (animated counters) ── */
export interface Stat {
  value: number
  suffix: string
  label: string
  decimals?: number
}
export const STATS: Stat[] = [
  { value: 22000, suffix: '+', label: 'Live channels' },
  { value: 90000, suffix: '+', label: 'Movies & series' },
  { value: 99.9, suffix: '%', label: 'Server uptime', decimals: 1 },
  { value: 60000, suffix: '+', label: 'Active members' },
]

/* ── Trust marquee (rendered as styled name-pills, not 3rd-party logos) ── */
export const NETWORKS: string[] = [
  'Sky Sports', 'beIN SPORTS', 'ESPN', 'DAZN', 'TNT Sports', 'Canal+',
  'HBO Max', 'Prime Video', 'Disney+', 'Premier League', 'NBA League Pass',
  'UFC Fight Pass', 'Formula 1', 'Champions League',
]

/* ── Feature bento ── */
export interface Feature {
  icon: string // key into <Icon />
  title: string
  body: string
  accent: 'neon' | 'volt'
  span?: 'wide' | 'tall'
}
export const FEATURES: Feature[] = [
  {
    icon: 'bolt',
    title: 'Anti-Buffer Engine™',
    body: 'Adaptive multi-CDN load balancing locks onto the fastest node in real time. No spinning wheel — not even at kickoff.',
    accent: 'volt',
    span: 'wide',
  },
  {
    icon: 'uhd',
    title: 'True 4K UHD & FHD',
    body: 'Native 4K, FHD and HD feeds with crystal audio. Every pixel, every blade of grass.',
    accent: 'neon',
  },
  {
    icon: 'shield',
    title: 'Anti-Freeze Servers',
    body: 'Redundant edge servers across 3 continents reroute around outages before you notice.',
    accent: 'neon',
  },
  {
    icon: 'devices',
    title: 'Every Device',
    body: 'Smart TV, Firestick, Android, iOS, Mac, Windows, MAG & Apple TV. One subscription, all screens.',
    accent: 'volt',
  },
  {
    icon: 'globe',
    title: 'Worldwide Channels',
    body: 'US, UK, Europe, Gulf, Asia & LATAM. 22,000+ channels in 50+ languages.',
    accent: 'neon',
    span: 'tall',
  },
  {
    icon: 'clock',
    title: 'Instant Activation',
    body: 'Pay on WhatsApp, get your line in minutes. 24/7 human support, never a bot maze.',
    accent: 'volt',
  },
]

/* ── 3-step funnel (distinct icon per step) ── */
export const STEPS = [
  {
    n: '01',
    icon: 'whatsapp',
    title: 'Get your subscription',
    body: 'Pick a plan and activate on WhatsApp — we send your unique login (Xtream Codes) within minutes.',
  },
  {
    n: '02',
    icon: 'download',
    title: 'Install the app',
    body: 'Launch any IPTV player — IPTV Smarters Pro, TiviMate, OTT Navigator or Stream IPTV — and enter your credentials.',
  },
  {
    n: '03',
    icon: 'play',
    title: 'Start streaming',
    body: 'Explore 22,000+ live channels, 90,000+ movies & VOD — all ready to stream instantly in crisp 4K.',
  },
] as const

/* ── Pricing plans (USD; WhatsApp converts on contact) ──
   Every Premium plan unlocks the same full feature set; only the length changes. */
export interface PlanFeature {
  icon: string
  label: string
}
export const PREMIUM_FEATURES: PlanFeature[] = [
  { icon: 'uhd', label: '20K Channels FHD & HD' },
  { icon: 'trophy', label: 'All Sports Channels & PPV' },
  { icon: 'play', label: 'Premium VODs' },
  { icon: 'signal', label: '99.9% Server Uptime' },
  { icon: 'clock', label: '24/7 Free Active Support' },
  { icon: 'devices', label: 'Compatible with all Devices' },
  { icon: 'shield', label: 'Anti-Freeze Technology' },
  { icon: 'lock', label: 'Built-in VPN' },
  { icon: 'star', label: '4K Support' },
]

export interface Plan {
  id: string
  name: string
  months: number
  price: string
  trial: string
  badge?: string
  highlight?: boolean
}
export const PLANS: Plan[] = [
  { id: 'm1', name: '1 Month', months: 1, price: '$14.99', trial: '12 Hours Free Trial' },
  { id: 'm3', name: '3 Months', months: 3, price: '$39.99', trial: '12 Hours Free Trial', badge: 'Popular' },
  { id: 'm6', name: '6 Months', months: 6, price: '$49.99', trial: '12 Hours Free Trial' },
  {
    id: 'm12',
    name: '1 Year',
    months: 12,
    price: '$89.99',
    trial: '12 Hours Free Trial',
    badge: 'Best Value',
    highlight: true,
  },
]

/* ── Upcoming fixtures for the countdown + ticker.
   Times are computed at runtime from "now" so the countdown is ALWAYS live. ── */
export interface Fixture {
  home: string
  away: string
  league: string
  daysFromNow: number
  hour: number // local hour, 24h
}
export const FIXTURES: Fixture[] = [
  { home: 'England', away: 'Brazil', league: 'World Cup 2026 · Quarter-Final', daysFromNow: 0, hour: 21 },
  { home: 'France', away: 'Argentina', league: 'World Cup 2026 · Group F', daysFromNow: 1, hour: 20 },
  { home: 'USA', away: 'Spain', league: 'World Cup 2026 · Round of 16', daysFromNow: 2, hour: 22 },
  { home: 'Real Madrid', away: 'Man City', league: 'Champions League', daysFromNow: 4, hour: 20 },
  { home: 'Lakers', away: 'Celtics', league: 'NBA Finals', daysFromNow: 5, hour: 19 },
]

/* ── Testimonials ── */
export interface Testimonial {
  name: string
  location: string
  flag: string
  rating: number
  quote: string
}
export const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Georgie K.',
    location: 'Manchester, UK',
    flag: '🇬🇧',
    rating: 5,
    quote:
      'Watched the entire derby in 4K with zero lag while my mate on cable kept freezing. The anti-buffer thing is real.',
  },
  {
    name: 'Marcus T.',
    location: 'Dallas, USA',
    flag: '🇺🇸',
    rating: 5,
    quote:
      'Every NFL game, every NBA night, plus my wife’s telenovelas. One line, every device. Cancelled three apps.',
  },
  {
    name: 'Khalid A.',
    location: 'Dubai, UAE',
    flag: '🇦🇪',
    rating: 5,
    quote:
      'beIN, Sky and the Arabic bouquets all in crisp 4K. Setup took five minutes on WhatsApp. Unreal value.',
  },
  {
    name: 'Maria G.',
    location: 'Madrid, ES',
    flag: '🇪🇸',
    rating: 5,
    quote:
      'LaLiga and Champions nights are flawless. The picture is sharper than my old satellite box ever was.',
  },
  {
    name: 'Leon B.',
    location: 'Berlin, DE',
    flag: '🇩🇪',
    rating: 5,
    quote:
      'Bundesliga + Premier League + Formula 1 with a proper EPG. Support replied at 1am. Genuinely premium.',
  },
]

/* ── FAQ (categorised, inspired by the reference's 6-section structure) ── */
export interface Faq {
  q: string
  a: string
}
export interface FaqCategory {
  name: string
  icon: string
  items: Faq[]
}
export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    name: 'General',
    icon: 'globe',
    items: [
      {
        q: 'What is HellIPTV?',
        a: 'HellIPTV is a premium IPTV service streaming 22,000+ live channels and 90,000+ movies & series in true 4K UHD — worldwide, on any device — powered by our Anti-Buffer Engine™ and anti-freeze servers.',
      },
      {
        q: 'Do you offer a free trial?',
        a: 'Yes — a full 12-hour 4K trial with no credit card. Tap any “Free Trial” button, message us on WhatsApp, and we activate it within minutes so you can test the quality risk-free.',
      },
      {
        q: 'Is HellIPTV safe to use?',
        a: 'Yes. Connections are encrypted and a built-in VPN is included on every plan, keeping your streaming private. We never store payment details on your line.',
      },
    ],
  },
  {
    name: 'Devices & Streaming',
    icon: 'devices',
    items: [
      {
        q: 'Which devices are compatible?',
        a: 'Everything: Smart TVs (Samsung/LG), Amazon Firestick, Android & Android TV, iPhone/iPad, Apple TV, Mac, Windows, MAG and Formuler. One subscription works across all of them — see our Setup Guides for each.',
      },
      {
        q: 'How do I install HellIPTV?',
        a: 'Install a player such as IPTV Smarters Pro or TiviMate, log in with the Xtream Codes details we send, and you’re live. Step-by-step guides for every device are on our Setup Guides page.',
      },
      {
        q: 'What video quality is supported?',
        a: 'Native 4K UHD, FHD and HD with crystal-clear audio. The stream auto-adapts to your connection so you always get the best quality your line can carry.',
      },
      {
        q: 'Can I stream on multiple devices at once?',
        a: 'Yes — multi-device connections are available on the 3, 6 and 12-month plans, so the household can watch different channels at the same time.',
      },
      {
        q: 'Can I use HellIPTV while traveling?',
        a: 'Absolutely. Your line works anywhere with internet — at home, abroad or on mobile data — and the built-in VPN helps you watch from any region.',
      },
    ],
  },
  {
    name: 'Subscriptions & Payments',
    icon: 'lock',
    items: [
      {
        q: 'How many channels do I get?',
        a: 'Every plan unlocks the full library: 22,000+ live channels and 90,000+ movies & series. No tiers, no add-ons — everything is included.',
      },
      {
        q: 'What payment methods are accepted?',
        a: 'Cards, PayPal and crypto, all arranged securely over WhatsApp. You receive your line details immediately after payment.',
      },
      {
        q: 'Are there extra fees for PPV or VODs?',
        a: 'No. PPV events, the full VOD library and the EPG guide are all included in your plan — no hidden charges.',
      },
      {
        q: 'How do I renew or change my plan?',
        a: 'Just message us on WhatsApp when it’s time to renew or upgrade. We handle it in minutes and your line keeps running without interruption.',
      },
    ],
  },
  {
    name: 'Activation & Setup',
    icon: 'bolt',
    items: [
      {
        q: 'How long does activation take?',
        a: 'Most lines are live within 5–10 minutes of payment. We send your credentials plus a quick setup guide tailored to your device.',
      },
      {
        q: 'Can I use a VPN with HellIPTV?',
        a: 'Yes — and you don’t even need your own: a VPN is built into every plan. You’re free to use your own too; both work perfectly.',
      },
      {
        q: 'What internet speed do I need for 4K?',
        a: 'A stable 25 Mbps connection comfortably handles 4K UHD; 10–15 Mbps is fine for FHD/HD. Run our free speed test to confirm your line is match-ready in seconds.',
      },
    ],
  },
  {
    name: 'Account',
    icon: 'shield',
    items: [
      {
        q: 'Can I cancel at any time?',
        a: 'Yes — there’s no contract. Your subscription simply ends when its term does, and you renew (or not) whenever you like. That’s what the free trial is for: test first, commit later.',
      },
      {
        q: 'How do I upgrade or extend my line?',
        a: 'Message us on WhatsApp and we’ll extend or upgrade your existing line instantly — no need to reconfigure anything on your device.',
      },
    ],
  },
  {
    name: 'Support',
    icon: 'whatsapp',
    items: [
      {
        q: 'Do you have customer support?',
        a: 'Yes — real humans on WhatsApp, 24/7. No bots, no ticket mazes. Most messages get a reply within minutes.',
      },
      {
        q: 'What if I get buffering or lag?',
        a: 'It’s rare thanks to our Anti-Buffer Engine™ and anti-freeze servers — but if it happens, message us and we’ll switch you to the fastest server for your region instantly.',
      },
    ],
  },
]
