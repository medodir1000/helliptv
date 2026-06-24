import { motion } from 'framer-motion'
import { Section, SectionHeading } from './ui/Section'
import { Icon, type IconName } from './ui/Icon'
import { EASE_OUT } from './anim/motion'

/* Posters are curated into coherent groups so unlike tiles never share a row:
   apps/        → streaming brands you get bundled in
   categories/  → live sports & entertainment categories
   _features/   → product stat-cards (intentionally NOT shown here; they live
                  in the Features / Speed-test / Stats sections instead).        */
const appMods = import.meta.glob('../assets/posters/apps/*.webp', { eager: true, import: 'default' })
const catMods = import.meta.glob('../assets/posters/categories/*.webp', { eager: true, import: 'default' })

const PRETTY: Record<string, string> = {
  netflix: 'Netflix',
  prime: 'Prime Video',
  disney: 'Disney+',
  appletv: 'Apple TV+',
  hulu: 'Hulu',
  football: 'Live football',
  racing: 'Motorsport & racing',
  fights: 'Boxing & MMA',
  international: 'Worldwide channels',
}

interface Poster {
  url: string
  label: string
}
function toPosters(mods: Record<string, unknown>): Poster[] {
  return Object.entries(mods)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([path, url]) => {
      const key = path.split('/').pop()!.replace(/\.webp$/, '').replace(/^\d+-/, '')
      return { url: url as string, label: PRETTY[key] ?? key }
    })
}

const APPS = toPosters(appMods)
const CATEGORIES = toPosters(catMods)

function GroupLabel({ icon, title, hint }: { icon: IconName; title: string; hint: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.5, ease: EASE_OUT }}
      className="mb-7 flex flex-col gap-2 border-b border-line pb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
    >
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-neon/10 text-neon ring-1 ring-neon/20">
          <Icon name={icon} size={18} />
        </span>
        <p className="font-display text-base font-bold leading-tight text-fg sm:text-lg">{title}</p>
      </div>
      <p className="pl-[3.25rem] text-xs text-faint sm:max-w-[48%] sm:pl-0 sm:text-right sm:text-[13px]">{hint}</p>
    </motion.div>
  )
}

function PosterTile({ poster, index }: { poster: Poster; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.5, ease: EASE_OUT, delay: (index % 5) * 0.06 }}
      whileHover={{ y: -6 }}
      className="group/card relative aspect-[2/3] overflow-hidden rounded-2xl bg-surface-3 ring-1 ring-line transition-[box-shadow,border-color] duration-300 hover:shadow-[0_24px_50px_-26px_rgba(17,19,28,0.55)] hover:ring-neon/35"
    >
      <img
        src={poster.url}
        alt={`${poster.label} — stream in 4K on HellIPTV`}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover/card:scale-[1.05]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/45 to-transparent opacity-0 transition-opacity duration-300 group-hover/card:opacity-100"
      />
    </motion.div>
  )
}

export function ContentPosters() {
  return (
    <Section id="library">
      <SectionHeading
        eyebrow="Endless library"
        title={<>Everything worth watching, <span className="text-gradient">in 4K</span></>}
        subtitle="All your favourite streaming platforms plus live sports from every corner of the world — one subscription, one app, every device."
      />

      <div className="mt-14 flex flex-col gap-16">
        {/* streaming brands */}
        <div>
          <GroupLabel
            icon="play"
            title="Every premium platform — one subscription"
            hint="Netflix · Prime Video · Disney+ · Apple TV+ · Hulu and more"
          />
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
            {APPS.map((p, i) => (
              <PosterTile key={p.url} poster={p} index={i} />
            ))}
          </div>
        </div>

        {/* live categories */}
        <div>
          <GroupLabel
            icon="trophy"
            title="Live sports & top categories"
            hint="Football · Motorsport · Boxing & MMA · 22,000+ worldwide channels"
          />
          <div className="grid grid-cols-2 gap-3.5 sm:gap-4 lg:grid-cols-4">
            {CATEGORIES.map((p, i) => (
              <PosterTile key={p.url} poster={p} index={i} />
            ))}
          </div>
        </div>
      </div>
    </Section>
  )
}
