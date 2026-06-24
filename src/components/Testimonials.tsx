import { Section, SectionHeading } from './ui/Section'
import { Icon } from './ui/Icon'
import { TESTIMONIALS, type Testimonial } from '../lib/site'

function initials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function Card({ t }: { t: Testimonial }) {
  return (
    <figure className="card card-hover flex w-[300px] shrink-0 flex-col gap-4 rounded-3xl p-6 sm:w-[360px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-0.5 text-volt">
          {Array.from({ length: t.rating }).map((_, s) => (
            <Icon key={s} name="star" size={14} />
          ))}
        </div>
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-faint">
          <Icon name="check" size={11} className="text-volt" /> Verified
        </span>
      </div>
      <blockquote className="text-pretty text-[15px] leading-relaxed text-fg/90">“{t.quote}”</blockquote>
      <figcaption className="mt-auto flex items-center gap-3 pt-1">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-[linear-gradient(135deg,rgba(168,85,247,0.28),rgba(192,38,211,0.16))] text-xs font-bold tracking-wide text-fg ring-1 ring-white/10">
          {initials(t.name)}
        </span>
        <div>
          <p className="text-sm font-semibold text-fg">{t.name}</p>
          <p className="text-xs text-faint">{t.location}</p>
        </div>
      </figcaption>
    </figure>
  )
}

/** One infinite-scrolling row; pauses on hover. */
function Row({ items, reverse = false }: { items: Testimonial[]; reverse?: boolean }) {
  return (
    <div className="group mask-x overflow-hidden">
      <div
        className={`flex w-max gap-4 ${reverse ? 'animate-marquee-rev' : 'animate-marquee'} group-hover:[animation-play-state:paused]`}
      >
        {[...items, ...items].map((t, i) => (
          <Card key={`${t.name}-${i}`} t={t} />
        ))}
      </div>
    </div>
  )
}

export function Testimonials() {
  const mid = Math.ceil(TESTIMONIALS.length / 2)
  const rowA = TESTIMONIALS
  const rowB = [...TESTIMONIALS.slice(mid), ...TESTIMONIALS.slice(0, mid)]

  return (
    <Section id="reviews">
      <SectionHeading
        eyebrow="4.8 / 5 · 60,000+ members"
        title={<>Loved from <span className="text-gradient">London to Dubai</span></>}
        subtitle="Real members across the US, UK, Europe and the Gulf — switching from cable and never looking back."
      />

      <div className="mt-14 flex flex-col gap-4">
        <Row items={rowA} />
        <Row items={rowB} reverse />
      </div>
    </Section>
  )
}
