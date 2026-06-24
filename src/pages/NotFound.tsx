import { Aurora } from '../components/ui/Aurora'
import { Button } from '../components/ui/Button'
import { useSeo } from '../hooks/useSeo'

export function NotFound() {
  useSeo({
    title: 'Page not found',
    description: 'The page you’re looking for doesn’t exist — but 22,000+ channels that do are one tap away.',
    path: '/404',
    noindex: true,
  })
  return (
    <section className="relative grid min-h-[70vh] place-items-center overflow-hidden px-5 pt-28 text-center">
      <Aurora />
      <div className="relative flex flex-col items-center gap-5">
        <span className="font-display text-7xl font-bold text-gradient sm:text-8xl">404</span>
        <h1 className="text-2xl font-bold sm:text-3xl">This channel went off-air.</h1>
        <p className="max-w-md text-muted">The page you’re looking for doesn’t exist — but 22,000+ that do are one tap away.</p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Button to="/" variant="volt" size="lg" icon="play">Back to home</Button>
          <Button to="/pricing" variant="outline" size="lg" iconRight="arrow">See plans</Button>
        </div>
      </div>
    </section>
  )
}
