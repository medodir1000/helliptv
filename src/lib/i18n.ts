/* Multilingual config — top high-traffic languages for the blog. English is
   the default (no URL prefix); the rest live under /<code>/blog/... */

export interface Lang {
  code: string // URL + locale code
  label: string // native name (for the switcher)
  hreflang: string // hreflang attribute value
  name: string // English name used in the translation prompt
  dir?: 'rtl'
}

export const DEFAULT_LANG = 'en'

export const LANGS: Lang[] = [
  { code: 'en', label: 'English', hreflang: 'en', name: 'English' },
  { code: 'es', label: 'Español', hreflang: 'es', name: 'Spanish' },
  { code: 'fr', label: 'Français', hreflang: 'fr', name: 'French' },
  { code: 'de', label: 'Deutsch', hreflang: 'de', name: 'German' },
  { code: 'pt', label: 'Português', hreflang: 'pt', name: 'Portuguese' },
  { code: 'ar', label: 'العربية', hreflang: 'ar', name: 'Arabic', dir: 'rtl' },
  { code: 'it', label: 'Italiano', hreflang: 'it', name: 'Italian' },
  { code: 'nl', label: 'Nederlands', hreflang: 'nl', name: 'Dutch' },
  { code: 'tr', label: 'Türkçe', hreflang: 'tr', name: 'Turkish' },
  { code: 'pl', label: 'Polski', hreflang: 'pl', name: 'Polish' },
  { code: 'ru', label: 'Русский', hreflang: 'ru', name: 'Russian' },
  { code: 'hi', label: 'हिन्दी', hreflang: 'hi', name: 'Hindi' },
  { code: 'vi', label: 'Tiếng Việt', hreflang: 'vi', name: 'Vietnamese' },
]

/** The 12 non-default languages we translate INTO. */
export const TRANSLATE_LANGS = LANGS.filter((l) => l.code !== DEFAULT_LANG)
export const LANG_CODES = LANGS.map((l) => l.code)

export function getLang(code?: string | null): Lang {
  return LANGS.find((l) => l.code === code) ?? LANGS[0]
}
