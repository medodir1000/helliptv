/**
 * Production live-fixtures endpoint (Vercel / Netlify Node function).
 *
 * Pulls REAL upcoming matches (major competitions first, exact kickoff times)
 * from Football-Data.org / TheSportsDB via the shared source module. Keys are
 * read from the server environment and NEVER reach the browser.
 *
 * Local dev uses the equivalent middleware in vite.config.ts.
 */
import { getFixtures } from '../server/sportsFixtures'

interface Req {
  method?: string
}
interface Res {
  status: (code: number) => Res
  json: (body: unknown) => void
  setHeader: (k: string, v: string) => void
}

export default async function handler(_req: Req, res: Res) {
  try {
    const { fixtures, source } = await getFixtures(process.env, 6)
    return res.status(200).json({ fixtures, source })
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Unexpected server error', fixtures: [] })
  }
}
