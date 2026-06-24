import { PageHeader } from '../components/ui/PageHeader'
import { Channels } from '../components/Channels'
import { TrustBar } from '../components/TrustBar'
import { FinalCTA } from '../components/FinalCTA'
import { useSeo } from '../hooks/useSeo'

export function ChannelsPage() {
  useSeo({
    title: 'Channels & VOD',
    description:
      '22,000+ live channels and 90,000+ movies & series — sports, PPV, movies, kids and news from across the globe, all in 4K.',
    path: '/channels',
  })
  return (
    <>
      <PageHeader crumbs={[{ label: 'Channels' }]} />
      <Channels />
      <TrustBar />
      <FinalCTA />
    </>
  )
}
