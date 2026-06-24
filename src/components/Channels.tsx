import { motion } from 'framer-motion'
import { Section, SectionHeading } from './ui/Section'
import { Icon, type IconName } from './ui/Icon'
import { fadeUp, inViewOnce, staggerContainer } from './anim/motion'
import { ChannelWall } from './ChannelWall'

interface Cat {
  icon: IconName
  title: string
  count: string
  accent: 'neon' | 'volt'
}
const CATS: Cat[] = [
  { icon: 'trophy', title: 'Live Sports', count: '6,500+ channels', accent: 'volt' },
  { icon: 'play', title: 'Movies', count: '50,000+ titles', accent: 'neon' },
  { icon: 'devices', title: 'TV Series', count: '40,000+ episodes', accent: 'neon' },
  { icon: 'globe', title: 'Worldwide', count: '50+ countries', accent: 'volt' },
  { icon: 'fire', title: 'PPV Events', count: 'UFC · Boxing', accent: 'neon' },
  { icon: 'star', title: 'Kids & Family', count: '1,200+ channels', accent: 'volt' },
  { icon: 'signal', title: '24/7 Channels', count: 'Always-on', accent: 'neon' },
  { icon: 'uhd', title: '4K Zone', count: 'Native UHD', accent: 'volt' },
]

const GENRES = [
  'Premier League', 'NBA', 'NFL', 'UFC 320', 'Champions League', 'Formula 1',
  'LaLiga', 'Cricket', 'Tennis', 'Marvel', 'Netflix Originals', 'Documentaries',
]

export function Channels() {
  return (
    <Section id="channels">
      <SectionHeading
        eyebrow="Endless entertainment"
        title={<>Everything worth watching, <span className="text-gradient-volt">in one place</span></>}
        subtitle="From the Champions League to box-office blockbusters and every regional bouquet — sports, movies, series, kids and news across the globe."
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={inViewOnce}
        className="mt-14 grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4"
      >
        {CATS.map((c) => (
          <motion.div
            key={c.title}
            variants={fadeUp}
            whileHover={{ y: -4 }}
            className="group card card-hover flex items-center gap-3.5 rounded-2xl p-4"
          >
            <span
              className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ring-1 ${
                c.accent === 'volt' ? 'bg-volt/10 text-volt ring-volt/30' : 'bg-neon/10 text-neon ring-neon/30'
              }`}
            >
              <Icon name={c.icon} size={21} />
            </span>
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-bold text-fg">{c.title}</p>
              <p className="truncate text-xs text-muted">{c.count}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* channel-logo wall — unlit; lights up under the cursor torch */}
      <ChannelWall />

      {/* genre marquee */}
      <div className="mask-x mt-8 overflow-hidden">
        <motion.div className="flex w-max gap-3" animate={{ x: ['-50%', '0%'] }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}>
          {[...GENRES, ...GENRES].map((g, i) => (
            <span key={i} className="inline-flex shrink-0 items-center rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium text-muted">
              {g}
            </span>
          ))}
        </motion.div>
      </div>
    </Section>
  )
}
