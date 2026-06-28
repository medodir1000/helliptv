/* Deterministic article tidier + structurer for the admin editor.
   Turns AI-generated walls of text into organised Markdown (section headings,
   "Term: description" bullet lists, question headings), fixes punctuation and
   typography, and bolds the focus keyword once. Code, inline code and links
   are protected from every transform. No API, instant, offline. */

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const mark = (k: string, i: number) => `HTVPROTECT${k}${i}ENDHTV`

// Common section titles AI writers use — promoted to H2 even when glued to the
// next word ("Key TakeawaysOn-Demand…").
const KNOWN_HEADINGS = [
  'Key Takeaways', 'Introduction', 'Overview', 'Conclusion', 'Final Thoughts',
  'Final Verdict', 'Frequently Asked Questions', 'Benefits', 'Getting Started',
  'Pro Tips', 'Pro Tip', 'Troubleshooting', 'Bottom Line', 'Why It Matters',
  'Quick Start', 'Step by Step', 'What You Need', 'Requirements', 'How It Works',
]

/* Rebuild structure from an unstructured blob. */
function structure(t: string): string {
  // a) Known section headings → their own H2 (works when glued to next word).
  for (const h of KNOWN_HEADINGS) {
    t = t.replace(new RegExp(`\\s*\\b${escapeRe(h)}(?=[A-Z]|\\s|[.,:!?)]|$)`, 'g'), `\n\n## ${h}\n\n`)
  }
  // b) Question headings: "…sentence.Question phrase?NextCapital" → H2
  //    (\s* so it also catches glued cases like "HDR.What…Work?Video").
  t = t.replace(/([.!?])\s*([A-Z][^.!?\n]{8,90}\?)\s*(?=[A-Z])/g, (_m, p, q) => `${p}\n\n## ${q.trim()}\n\n`)
  // c) Definition-list items: "Title Phrase: Capital…" → "- **Phrase:** …"
  t = t.replace(
    /(^|\n+|[.!?]\s+)((?:[A-Z][A-Za-z0-9'’&/+-]*)(?: [A-Z][A-Za-z0-9'’&/+-]*){0,5}):\s+(?=[A-Z“"'])/g,
    (_m, pre, term) => {
      const tail = /[.!?]/.test(pre) ? pre.replace(/\s+$/, '') : ''
      return `${tail}\n- **${term}:** `
    },
  )
  return t
}

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

  // 2) Punctuation & typography (prose only).
  t = t
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/ +([,.;:!?])/g, '$1')
    .replace(/([,;:!?])([A-Za-z])/g, '$1 $2')
    .replace(/([a-z])\.([A-Z])/g, '$1. $2') // space after a sentence period
    .replace(/(?<!-)--(?!-)/g, '—')
    .replace(/\.\.\./g, '…')
    .replace(/"([^"\n]+)"/g, '“$1”')
    .replace(/(\w)'(\w)/g, '$1’$2')
    .replace(/'([^'\n]+)'/g, '‘$1’')

  // 3) Rebuild structure only when the text looks like an unstructured blob.
  if ((t.match(/\n\s*\n/g) || []).length < 3) t = structure(t)

  // 4) Per-line hygiene: list/heading markers, capitalize headings.
  t = t
    .split('\n')
    .map((line) =>
      line
        .replace(/[ \t]+$/g, '')
        .replace(/^(\s*)([-*])(?=\S)/, '$1$2 ')
        .replace(/^(\s*)(\d+)\.(?=\S)/, '$1$2. ')
        .replace(/^(#{1,6})(?=[^#\s])/, '$1 ') // "##Title" → "## Title" (not "# #")
        .replace(/^(#{1,6} )([a-z])/, (_m, h, c) => h + c.toUpperCase()),
    )
    .join('\n')

  // 5) Block structure: blank line around headings, collapse extra blanks.
  t = t
    .replace(/([^\n])\n(#{1,6} )/g, '$1\n\n$2')
    .replace(/(\n#{1,6} [^\n]+)\n(?!\n)/g, '$1\n\n')
    .replace(/\n{3,}/g, '\n\n')

  // 6) Bold the focus keyword on its first plain occurrence (SEO emphasis).
  const kw = (focusKeyword || '').trim()
  if (kw) {
    const re = new RegExp(`(^|[^*\\w\\u2019])(${escapeRe(kw)})(?![*\\w])`, 'i')
    t = t.replace(re, (_m, pre, hit) => `${pre}**${hit}**`)
  }

  // 7) Restore protected segments.
  t = t.replace(/HTVPROTECTL(\d+)ENDHTV/g, (_m, i) => links[+i])
  t = t.replace(/HTVPROTECTC(\d+)ENDHTV/g, (_m, i) => codes[+i])
  t = t.replace(/HTVPROTECTF(\d+)ENDHTV/g, (_m, i) => fences[+i])

  return t.trim() + '\n'
}
