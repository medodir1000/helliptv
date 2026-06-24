import { FIXTURES } from './site'
import { fixtureTimestamp } from '../hooks/useCountdown'

/** Normalized fixture shape used by the countdown + ticker (real ms timestamp). */
export interface MatchFixture {
  home: string
  away: string
  league: string
  start: number
}

/** Static placeholder fixtures (always future) — instant fallback before live data loads. */
export function staticFixtures(): MatchFixture[] {
  return FIXTURES.map((f) => ({
    home: f.home,
    away: f.away,
    league: f.league,
    start: fixtureTimestamp(f.daysFromNow, f.hour),
  })).sort((a, b) => a.start - b.start)
}

/** Convert raw `{startUtc}` items from /api/fixtures into normalized, future-only fixtures. */
export function normalizeApiFixtures(raw: any[]): MatchFixture[] {
  const now = Date.now()
  return (raw || [])
    .map((f) => ({
      home: String(f?.home ?? '').trim(),
      away: String(f?.away ?? '').trim(),
      league: String(f?.league ?? '').trim(),
      start: Date.parse(f?.startUtc ?? f?.start ?? ''),
    }))
    .filter((f) => f.home && f.away && f.league && !Number.isNaN(f.start) && f.start > now - 2 * 3600_000)
    .sort((a, b) => a.start - b.start)
}
