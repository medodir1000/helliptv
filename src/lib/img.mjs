/* Supabase Storage image CDN transform. Turns a 2 MB original PNG into an
   on-the-fly resized WebP (~40× smaller) — browsers get WebP automatically via
   their Accept header. Used everywhere blog images are shown (live + prerender).
   Non-Supabase or non-storage URLs (e.g. data: URLs) are returned untouched. */
export function cdnImg(url, width = 1280, quality = 80) {
  if (!url || typeof url !== 'string') return url
  if (!url.includes('/storage/v1/object/public/')) return url
  const t = url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/')
  return `${t}${t.includes('?') ? '&' : '?'}width=${width}&quality=${quality}`
}

/** Rewrite every Supabase storage image URL inside a Markdown body to the CDN transform. */
export function cdnImgInBody(body, width = 1280, quality = 80) {
  if (!body) return body
  return String(body).replace(
    /https:\/\/[^\s"')]+\/storage\/v1\/object\/public\/[^\s"')]+/g,
    (m) => cdnImg(m, width, quality),
  )
}
