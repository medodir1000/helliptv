import { useEffect, useState } from 'react'
import { type MatchFixture, staticFixtures, normalizeApiFixtures } from '../lib/fixtures'

const CACHE_KEY = 'helliptv:fixtures:v1'
const CACHE_TTL = 30 * 60 * 1000

export type FixtureSource = 'fallback' | 'live'

/**
 * Returns upcoming fixtures for the countdown.
 * Starts with static fallbacks instantly, then swaps in REAL fixtures from
 * /api/fixtures (OpenRouter + web search) once they arrive. Cached for 30 min.
 */
export function useFixtures() {
  const [fixtures, setFixtures] = useState<MatchFixture[]>(() => staticFixtures())
  const [source, setSource] = useState<FixtureSource>('fallback')

  useEffect(() => {
    let cancelled = false

    // 1) warm from session cache
    try {
      const cached = sessionStorage.getItem(CACHE_KEY)
      if (cached) {
        const { at, data } = JSON.parse(cached)
        if (Date.now() - at < CACHE_TTL) {
          const norm = normalizeApiFixtures(data)
          if (norm.length) {
            setFixtures(norm)
            setSource('live')
            return
          }
        }
      }
    } catch {
      /* ignore */
    }

    // 2) fetch live
    fetch('/api/fixtures')
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => {
        if (cancelled) return
        const norm = normalizeApiFixtures(d?.fixtures || [])
        if (norm.length) {
          setFixtures(norm)
          setSource('live')
          try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data: d.fixtures }))
          } catch {
            /* quota */
          }
        }
      })
      .catch(() => {
        /* keep static fallback silently */
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { fixtures, source }
}
