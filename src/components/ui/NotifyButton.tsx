import { useEffect, useState } from 'react'
import { pushSupported, getPushState, subscribeToPush } from '../../lib/blog'
import { Icon } from './Icon'

/** Reader opt-in for web push — appears on the blog so visitors get pinged on new posts. */
export function NotifyButton({ lang = 'en', className = '' }: { lang?: string; className?: string }) {
  const [state, setState] = useState<'subscribed' | 'default' | 'denied' | 'unsupported' | 'loading'>('loading')

  useEffect(() => {
    getPushState().then(setState).catch(() => setState('unsupported'))
  }, [])

  if (state === 'unsupported' || state === 'denied') return null

  if (state === 'subscribed') {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full border border-volt/40 bg-volt/10 px-3.5 py-1.5 text-xs font-semibold text-volt ${className}`}>
        <Icon name="check" size={13} /> Subscribed to new posts
      </span>
    )
  }

  const onClick = async () => {
    setState('loading')
    const r = await subscribeToPush(lang)
    setState(r === 'subscribed' ? 'subscribed' : r === 'denied' ? 'denied' : 'default')
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={state === 'loading'}
      className={`inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 py-1.5 text-xs font-semibold text-fg transition-colors hover:border-neon/40 disabled:opacity-50 ${className}`}
    >
      🔔 {state === 'loading' ? 'Enabling…' : 'Notify me of new posts'}
    </button>
  )
}
