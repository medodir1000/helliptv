/* Convert the new poster PNGs + channel-wall JPG into lightweight WebP.
   Run: node scripts/optimize-posters.mjs */
import sharp from 'sharp'
import { mkdir, readdir } from 'node:fs/promises'

const SRC = 'src/image'
const POSTERS_OUT = 'src/assets/posters'
await mkdir(POSTERS_OUT, { recursive: true })

// Portrait genre/content posters (the new "22 juin" set)
const posters = (await readdir(SRC)).filter((f) => /^ChatGPT Image 22 juin.*\.png$/i.test(f)).sort()
let i = 1
let total = 0
for (const f of posters) {
  const out = `${POSTERS_OUT}/poster-${String(i).padStart(2, '0')}.webp`
  const info = await sharp(`${SRC}/${f}`)
    .resize({ width: 480, withoutEnlargement: true })
    .webp({ quality: 76 })
    .toFile(out)
  total += info.size
  console.log(`✓ ${out}  ${(info.size / 1024).toFixed(0)}KB  ${info.width}x${info.height}`)
  i++
}

// Channel-logo wall (landscape)
try {
  const info = await sharp(`${SRC}/zdzdxzs.jpg`)
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile('src/assets/channel-wall.webp')
  total += info.size
  console.log(`✓ src/assets/channel-wall.webp  ${(info.size / 1024).toFixed(0)}KB  ${info.width}x${info.height}`)
} catch (e) {
  console.log('channel-wall skipped:', e.message)
}

console.log(`\n${posters.length} posters + wall → ${(total / 1024).toFixed(0)}KB total WebP`)
