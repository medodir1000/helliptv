import { PageHeader } from '../components/ui/PageHeader'
import { SpeedTest } from '../components/SpeedTest'
import { FinalCTA } from '../components/FinalCTA'
import { useSeo } from '../hooks/useSeo'

export function SpeedTestPage() {
  useSeo({
    title: 'Speed & Compatibility Test',
    description:
      'Run our free IPTV speed & server compatibility test to confirm your connection is 4K-ready in seconds — no download, no signup.',
    path: '/speed-test',
  })
  return (
    <>
      <PageHeader crumbs={[{ label: 'Speed Test' }]} />
      <SpeedTest />
      <FinalCTA />
    </>
  )
}
