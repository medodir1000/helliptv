import { PageHeader } from '../components/ui/PageHeader'
import { Features } from '../components/Features'
import { Stats } from '../components/Stats'
import { FinalCTA } from '../components/FinalCTA'
import { useSeo } from '../hooks/useSeo'

export function FeaturesPage() {
  useSeo({
    title: 'Features',
    description:
      'Anti-Buffer Engine™, true 4K UHD, anti-freeze servers and 22,000+ worldwide channels — why HellIPTV streams flawlessly when it matters most.',
    path: '/features',
  })
  return (
    <>
      <PageHeader crumbs={[{ label: 'Features' }]} />
      <Features />
      <Stats />
      <FinalCTA />
    </>
  )
}
