import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Icon } from './Icon'
import { LANGS, currentLang, blogPath } from '../../lib/i18n'

/** Globe dropdown that switches the blog language (keeps the current article). */
export function LanguageSwitcher() {
  const loc = useLocation()
  const nav = useNavigate()
  const [open, setOpen] = useState(false)

  const cur = currentLang(loc.pathname)
  const curLabel = LANGS.find((l) => l.code === cur)?.label ?? 'English'
  const slug = loc.pathname.match(/\/blog\/([^/]+)/)?.[1]

  const pick = (code: string) => {
    setOpen(false)
    nav(blogPath(code, slug))
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Change language"
        className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-fg"
      >
        <Icon name="globe" size={16} />
        <span className="hidden sm:inline">{curLabel}</span>
        <Icon name="chevron" size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 max-h-[22rem] w-52 overflow-y-auto rounded-2xl glass-strong p-1.5 shadow-2xl">
            {LANGS.map((l) => (
              <button
                key={l.code}
                onClick={() => pick(l.code)}
                dir={l.dir}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors ${
                  l.code === cur ? 'bg-neon/10 font-semibold text-neon' : 'text-fg hover:bg-surface-2'
                }`}
              >
                {l.label}
                {l.code === cur && <Icon name="check" size={14} />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
