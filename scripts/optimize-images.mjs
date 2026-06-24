/* Optimize the source PNGs in src/image into web-ready WebP assets.
   Run with:  node scripts/optimize-images.mjs
   (or: npm run optimize:images) */
import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'

const SRC = 'src/image'
const OUT = 'src/assets'
await mkdir(OUT, { recursive: true })

const jobs = [
  // Logo: trim the transparent padding, size by height (it's a horizontal lockup).
  { in: `${SRC}/logo.png`, out: `${OUT}/logo.webp`, height: 140, quality: 92, trim: true },
  { in: `${SRC}/ChatGPT Image 16 juin 2026, 21_57_00.png`, out: `${OUT}/hero-tv.webp`, width: 1400, quality: 80 },
  { in: `${SRC}/ChatGPT Image 16 juin 2026, 22_29_52.png`, out: `${OUT}/servers.webp`, width: 1500, quality: 80 },
  { in: `${SRC}/ChatGPT Image 16 juin 2026, 22_32_53.png`, out: `${OUT}/devices.webp`, width: 1500, quality: 82 },
]

for (const j of jobs) {
  try {
    let pipe = sharp(j.in)
    if (j.trim) pipe = pipe.trim({ threshold: 40 })
    pipe = pipe.resize(j.height ? { height: j.height } : { width: j.width, withoutEnlargement: true })
    const info = await pipe.webp({ quality: j.quality, alphaQuality: 100 }).toFile(j.out)
    console.log(`✓ ${j.out}  ${(info.size / 1024).toFixed(0)}KB  ${info.width}x${info.height}`)
  } catch (err) {
    console.error(`✗ ${j.in}: ${err.message}`)
  }
}
