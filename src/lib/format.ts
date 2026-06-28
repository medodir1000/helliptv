/* Deterministic article tidier for the admin editor. Cleans structure,
   punctuation and typography, enforces heading hygiene (good for SEO &
   readability), and bolds the focus keyword once. Code blocks, inline code
   and links/images are protected from the prose transforms. */

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Unique sentinels — collision-proof (no article contains them) and immune to
// the prose transforms below (no spaces/punctuation/quotes inside).
const mark = (k: string, i: number) => `HTVPROTECT${k}${i}ENDHTV`

export function formatArticle(md: string, focusKeyword?: string): string {
  if (!md) return md

  // 1) Protect fenced code, inline code and links/images.
  const fences: string[] = []
  let t = md.replace(/```[\s\S]*?```/g, (m) => mark('F', fences.push(m) - 1))
  const codes: string[] = []
  t = t.replace(/`[^`\n]*`/g, (m) => mark('C', codes.push(m) - 1))
  const links: string[] = []
  t = t.replace(/!?\[[^\]]*\]\([^)]*\)/g, (m) => mark('L', links.push(m) - 1))

  t = t.replace(/\r\n?/g, '\n')

  // 2) Per-line structure: trim trailing space, fix list/heading markers.
  t = t
    .split('\n')
    .map((line) =>
      line
        .replace(/[ \t]+$/g, '')
        .replace(/^(\s*)([-*])(?=\S)/, '$1$2 ') // "-item" → "- item"
        .replace(/^(\s*)(\d+)\.(?=\S)/, '$1$2. ') // "1.item" → "1. item"
        .replace(/^(#{1,6})(?=\S)/, '$1 ') // "##Title" → "## Title"
        .replace(/^(#{1,6} )([a-z])/, (_m, h, c) => h + c.toUpperCase()), // capitalize heading
    )
    .join('\n')

  // 3) Punctuation & typography (prose only — code/links already protected).
  t = t
    .replace(/[ \t]{2,}/g, ' ') // collapse runs of spaces
    .replace(/ +([,.;:!?])/g, '$1') // no space before punctuation
    .replace(/([,;:!?])([A-Za-z])/g, '$1 $2') // one space after , ; : ! ?
    .replace(/([a-z])\.([A-Z])/g, '$1. $2') // space after sentence period (safe: skips U.S.A, 3.5, Node.js)
    .replace(/(?<!-)--(?!-)/g, '—') // -- → em dash (leave --- alone)
    .replace(/\.\.\./g, '…') // ... → ellipsis
    .replace(/"([^"\n]+)"/g, '“$1”') // straight → curly double quotes
    .replace(/(\w)'(\w)/g, '$1’$2') // apostrophes in contractions
    .replace(/'([^'\n]+)'/g, '‘$1’') // straight → curly single quotes

  // 4) Block structure: blank line around headings, collapse extra blanks.
  t = t
    .replace(/([^\n])\n(#{1,6} )/g, '$1\n\n$2') // blank line before a heading
    .replace(/(\n#{1,6} [^\n]+)\n(?!\n)/g, '$1\n\n') // blank line after a heading
    .replace(/\n{3,}/g, '\n\n')

  // 5) Bold the focus keyword on its first plain occurrence (SEO emphasis).
  const kw = (focusKeyword || '').trim()
  if (kw) {
    const re = new RegExp(`(^|[^*\\w\\u2019])(${escapeRe(kw)})(?![*\\w])`, 'i')
    t = t.replace(re, (_m, pre, hit) => `${pre}**${hit}**`)
  }

  // 6) Restore protected segments.
  t = t.replace(/HTVPROTECTL(\d+)ENDHTV/g, (_m, i) => links[+i])
  t = t.replace(/HTVPROTECTC(\d+)ENDHTV/g, (_m, i) => codes[+i])
  t = t.replace(/HTVPROTECTF(\d+)ENDHTV/g, (_m, i) => fences[+i])

  return t.trim() + '\n'
}
