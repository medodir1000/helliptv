import { PageHeader } from '../components/ui/PageHeader'
import { Pricing } from '../components/Pricing'
import { FAQ } from '../components/FAQ'
import { FinalCTA } from '../components/FinalCTA'
import { useSeo } from '../hooks/useSeo'

export function PricingPage() {
  useSeo({
    title: 'Pricing',
    description:
      'Simple premium IPTV pricing from $14.99. Every plan unlocks 20,000+ channels in 4K with a free 12-hour trial. No contract.',
    path: '/pricing',
  })
  return (
    <>
      <PageHeader crumbs={[{ label: 'Pricing' }]} />
      <Pricing />
      <FAQ />
      <FinalCTA />
    </>
  )
}
