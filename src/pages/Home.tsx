import { useSeo } from '../hooks/useSeo'
import { Hero } from '../components/Hero'
import { MatchCountdown } from '../components/MatchCountdown'
import { TrustBar } from '../components/TrustBar'
import { Features } from '../components/Features'
import { SpeedTest } from '../components/SpeedTest'
import { DashboardShowcase } from '../components/DashboardShowcase'
import { Channels } from '../components/Channels'
import { ContentPosters } from '../components/ContentPosters'
import { Stats } from '../components/Stats'
import { Steps } from '../components/Steps'
import { CompatibleApps } from '../components/CompatibleApps'
import { Pricing } from '../components/Pricing'
import { Testimonials } from '../components/Testimonials'
import { FAQ } from '../components/FAQ'
import { FinalCTA } from '../components/FinalCTA'

export function Home() {
  useSeo({
    title: 'HellIPTV — Premium 4K IPTV · 22,000+ Channels, Zero Buffer',
    description:
      'Stream 22,000+ live channels and 90,000+ movies in true 4K UHD. Anti-buffer technology, anti-freeze servers, every device. Free 12-hour trial.',
    path: '/',
  })
  return (
    <>
      <Hero />
      <MatchCountdown />
      <TrustBar />
      <Features />
      <SpeedTest />
      <DashboardShowcase />
      <Channels />
      <ContentPosters />
      <Stats />
      <Steps />
      <CompatibleApps />
      <Pricing />
      <Testimonials />
      <FAQ />
      <FinalCTA />
    </>
  )
}
