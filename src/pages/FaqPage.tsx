import { PageHeader } from '../components/ui/PageHeader'
import { FAQ } from '../components/FAQ'
import { FinalCTA } from '../components/FinalCTA'
import { useSeo } from '../hooks/useSeo'

export function FaqPage() {
  useSeo({
    title: 'FAQ',
    description:
      'Everything about HellIPTV — speeds, devices, activation, payments and the free trial. Clear answers in seconds.',
    path: '/faq',
  })
  return (
    <>
      <PageHeader crumbs={[{ label: 'FAQ' }]} />
      <FAQ />
      <FinalCTA />
    </>
  )
}
