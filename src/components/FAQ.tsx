import { useState } from 'react'
import { motion } from 'framer-motion'
import useMeasure from 'react-use-measure'
import { Section, SectionHeading } from './ui/Section'
import { Icon, type IconName } from './ui/Icon'
import { Button } from './ui/Button'
import { FAQ_CATEGORIES, type Faq } from '../lib/site'
import { WA } from '../lib/whatsapp'
import { EASE_OUT } from './anim/motion'

function Item({ q, a, isOpen, onToggle }: { q: string; a: string; isOpen: boolean; onToggle: () => void }) {
  const [ref, { height }] = useMeasure()
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface/40">
      <button onClick={onToggle} aria-expanded={isOpen} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6">
        <span className="font-display text-base font-semibold text-fg sm:text-lg">{q}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25, ease: EASE_OUT }}
          className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${isOpen ? 'bg-neon/20 text-neon' : 'bg-surface-2 text-muted'}`}
        >
          <Icon name="chevron" size={18} />
        </motion.span>
      </button>
      <motion.div animate={{ height: isOpen ? height : 0 }} initial={false} transition={{ duration: 0.32, ease: EASE_OUT }}>
        <div ref={ref} className="px-5 pb-5 sm:px-6">
          <p className="text-[15px] leading-relaxed text-muted">{a}</p>
        </div>
      </motion.div>
    </div>
  )
}

export function FAQ() {
  const [cat, setCat] = useState(0)
  const [open, setOpen] = useState<number | null>(0)
  const category = FAQ_CATEGORIES[cat]

  return (
    <Section id="faq">
      <SectionHeading
        eyebrow="Get every answer"
        title={<>Questions? <span className="text-gradient">We’ve got you.</span></>}
        subtitle="Everything you need to know, organised by topic. Still curious? Our team replies on WhatsApp 24/7."
      />

      {/* category tabs */}
      <div className="mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-2">
        {FAQ_CATEGORIES.map((c, i) => {
          const active = i === cat
          return (
            <button
              key={c.name}
              onClick={() => {
                setCat(i)
                setOpen(0)
              }}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                active ? 'border-neon bg-neon/10 text-neon' : 'border-line bg-surface/40 text-muted hover:text-fg'
              }`}
            >
              {c.name}
            </button>
          )
        })}
      </div>

      {/* questions for the active category (re-mounts + animates in on tab change) */}
      <motion.div
        key={cat}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: EASE_OUT }}
        className="mx-auto mt-8 grid max-w-3xl gap-3"
      >
        {category.items.map((f: Faq, i) => (
          <Item key={f.q} q={f.q} a={f.a} isOpen={open === i} onToggle={() => setOpen(open === i ? null : i)} />
        ))}
      </motion.div>

      <div className="mt-10 flex flex-col items-center gap-3">
        <p className="text-sm text-muted">Still have a question?</p>
        <Button href={WA.support} variant="ghost" size="md" icon="whatsapp">
          Chat with us now
        </Button>
      </div>
    </Section>
  )
}
