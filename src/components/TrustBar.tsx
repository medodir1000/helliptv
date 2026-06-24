import { motion } from 'framer-motion'

/* Real streaming-brand logos from the asset folder. They ship in mixed colours
   (Netflix red, HBO white…), so we render them as a uniform monochrome wall and
   let them darken on hover — the standard premium "trusted platforms" strip. */
const logoMods = import.meta.glob('../assets/brands/*.webp', { eager: true, import: 'default' })
const PRETTY: Record<string, string> = {
  netflix: 'Netflix',
  hulu: 'Hulu',
  hbo: 'HBO Max',
  discovery: 'Discovery',
  prime: 'Prime Video',
}
const LOGOS = Object.entries(logoMods)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([path, url]) => {
    const key = path.split('/').pop()!.replace(/\.webp$/, '').replace(/^\d+-/, '')
    return { url: url as string, name: PRETTY[key] ?? key }
  })

export function TrustBar() {
  const row = [...LOGOS, ...LOGOS, ...LOGOS]
  return (
    <div className="relative py-12">
      <p className="mb-8 text-center text-xs font-semibold uppercase tracking-[0.25em] text-faint">
        Every premium platform · one subscription
      </p>
      <div className="mask-x overflow-hidden">
        <motion.div
          className="flex w-max items-center gap-12 sm:gap-16"
          animate={{ x: ['0%', '-33.333%'] }}
          transition={{ duration: 26, repeat: Infinity, ease: 'linear' }}
        >
          {row.map((l, i) => (
            <img
              key={i}
              src={l.url}
              alt={`${l.name} — included with HellIPTV`}
              loading="lazy"
              draggable={false}
              className="h-6 w-auto shrink-0 select-none object-contain opacity-40 transition-opacity duration-300 [filter:brightness(0)] hover:opacity-70 sm:h-7"
            />
          ))}
        </motion.div>
      </div>
    </div>
  )
}
