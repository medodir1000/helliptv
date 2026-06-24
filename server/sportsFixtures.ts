/* ════════════════════════════════════════════════════════════════
   Real sports-fixtures source (shared by the dev middleware in
   vite.config.ts and the prod serverless function in api/fixtures.ts).

   Strategy — major competitions first, exact kickoff times:
     1. Football-Data.org   (if FOOTBALL_DATA_KEY set) — most structured
     2. TheSportsDB free    (eventsday.php, key "3") — works with NO key,
                             includes the FIFA World Cup with exact UTC times
     3. → empty ⇒ client falls back to the built-in static fixtures.

   Keys are read here (server side) and never reach the browser.
   ════════════════════════════════════════════════════════════════ */

export interface RawFixture {
  home: string
  away: string
  league: string
  sport: string
  startUtc: string
}
interface Scored extends RawFixture {
  priority: number
}

/** Competition priority — World Cup → Champions League → Premier League → … */
const PRIORITY: [RegExp, number][] = [
  [/world cup/i, 0],
  [/champions league/i, 1],
  [/premier league/i, 2],
  [/la ?liga/i, 3],
  [/serie a/i, 4],
  [/bundesliga/i, 5],
  [/ligue 1/i, 6],
  [/europa league/i, 7],
]
function priorityOf(league: string): number {
  for (const [re, rank] of PRIORITY) if (re.test(league)) return rank
  return -1
}
function isoDay(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10)
}

/* ── 1) Football-Data.org — exact, structured (needs a free key) ── */
const FD_COMPS = ['WC', 'CL', 'PL', 'PD', 'SA', 'BL1', 'FL1'] // WC/CL/PL first
async function fromFootballData(key: string): Promise<Scored[]> {
  const now = Date.now()
  const dateFrom = isoDay(now)
  const dateTo = isoDay(now + 21 * 86_400_000)
  const out: Scored[] = []
  for (let i = 0; i < FD_COMPS.length; i++) {
    const code = FD_COMPS[i]
    try {
      const r = await fetch(
        `https://api.football-data.org/v4/competitions/${code}/matches?status=SCHEDULED&dateFrom=${dateFrom}&dateTo=${dateTo}`,
        { headers: { 'X-Auth-Token': key } },
      )
      if (!r.ok) continue
      const data: any = await r.json()
      for (const m of data?.matches ?? []) {
        if (!m?.utcDate) continue
        out.push({
          home: m?.homeTeam?.shortName || m?.homeTeam?.name || 'TBD',
          away: m?.awayTeam?.shortName || m?.awayTeam?.name || 'TBD',
          league: m?.competition?.name || code,
          sport: 'football',
          startUtc: m.utcDate,
          priority: i,
        })
      }
    } catch {
      /* skip this competition */
    }
  }
  return out
}

/* ── 2) TheSportsDB free — eventsday.php (no key required) ── */
function tsdbTimestamp(e: any): string | null {
  if (e?.strTimestamp) {
    const raw = String(e.strTimestamp)
    const s = raw.endsWith('Z') || raw.includes('+') ? raw : raw + 'Z'
    const t = Date.parse(s)
    return Number.isNaN(t) ? null : new Date(t).toISOString()
  }
  if (e?.dateEvent && e?.strTime) {
    const t = Date.parse(`${e.dateEvent}T${e.strTime}Z`)
    return Number.isNaN(t) ? null : new Date(t).toISOString()
  }
  return null
}
async function fromTheSportsDb(key: string, count: number): Promise<Scored[]> {
  const out: Scored[] = []
  for (let i = 0; i < 8; i++) {
    const day = isoDay(Date.now() + i * 86_400_000)
    try {
      const r = await fetch(`https://www.thesportsdb.com/api/v1/json/${key}/eventsday.php?d=${day}&s=Soccer`)
      if (!r.ok) continue
      const data: any = await r.json()
      for (const e of data?.events ?? []) {
        const pr = priorityOf(e?.strLeague ?? '')
        if (pr < 0) continue
        const startUtc = tsdbTimestamp(e)
        if (!startUtc || !e?.strHomeTeam || !e?.strAwayTeam) continue
        out.push({
          home: e.strHomeTeam,
          away: e.strAwayTeam,
          league: e.strLeague,
          sport: 'football',
          startUtc,
          priority: pr,
        })
      }
    } catch {
      /* skip this day */
    }
    if (out.length >= count + 5) break
  }
  return out
}

/* ── shared: validate, de-dupe, sort soonest-first, cap ── */
function finalize(items: Scored[], count: number): RawFixture[] {
  const now = Date.now()
  const seen = new Set<string>()
  return items
    .filter((f) => f.home && f.away && f.startUtc && !Number.isNaN(Date.parse(f.startUtc)))
    .filter((f) => {
      const t = Date.parse(f.startUtc)
      return t > now - 2 * 3_600_000 && t < now + 30 * 86_400_000
    })
    .filter((f) => {
      const k = `${f.home}|${f.away}|${f.startUtc}`
      if (seen.has(k)) return false
      seen.add(k)
      return true
    })
    .sort((a, b) => Date.parse(a.startUtc) - Date.parse(b.startUtc))
    .slice(0, count)
    .map(({ priority, ...f }) => f)
}

let cache: { at: number; fixtures: RawFixture[]; source: string } | null = null
const TTL = 30 * 60 * 1000

export async function getFixtures(
  env: Record<string, string | undefined>,
  count = 6,
): Promise<{ fixtures: RawFixture[]; source: string }> {
  if (cache && Date.now() - cache.at < TTL) {
    return { fixtures: cache.fixtures, source: cache.source }
  }

  let items: Scored[] = []
  let source = 'none'

  const fdKey = env.FOOTBALL_DATA_KEY
  if (fdKey) {
    items = await fromFootballData(fdKey)
    if (items.length) source = 'football-data'
  }
  if (!items.length) {
    items = await fromTheSportsDb(env.THESPORTSDB_KEY || '3', count)
    if (items.length) source = 'thesportsdb'
  }

  const fixtures = finalize(items, count)
  if (fixtures.length) cache = { at: Date.now(), fixtures, source }
  return { fixtures, source }
}
