# HellIPTV — Premium Worldwide IPTV Landing Page

A high-converting, "underground premium" landing page for **helliptv.com**.
Built with **Vite + React + TypeScript + Tailwind v4 + Framer Motion**.

Deep indigo-black canvas · neon-purple & electric-green accents · glassmorphism ·
scroll-triggered animations · live match countdown · interactive speed test ·
secure on-the-fly OpenAI dashboard previews · WhatsApp conversion funnel · PWA.

---

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173  (or :5199 via the preview config)
npm run build    # production build → dist/
npm run preview  # preview the production build
```

> The reference site you provided (`inline-tv/`) was analysed for structure only —
> this is an all-new design and codebase.

---

## 🔐 Security — read this first

- **Never commit your OpenAI key.** It lives only in `.env.local` (gitignored) and is
  read **server-side**. It is never bundled into the browser.
- **The key pasted into chat must be rotated.** Any key shared in plain text should be
  treated as leaked — revoke it at <https://platform.openai.com/api-keys> and issue a new one.

```bash
cp .env.example .env.local
# then edit .env.local:
#   OPENAI_API_KEY=sk-...your-NEW-key...     # AI dashboard previews
#   OPENAI_IMAGE_MODEL=gpt-image-1           # or dall-e-3
#   THESPORTSDB_KEY=3                        # live fixtures (free, no signup)
#   FOOTBALL_DATA_KEY=                       # optional: more accurate fixtures
```

> **Secrets go in `.env.local`, not `.env.example`.** Vite only reads `.env` / `.env.local`
> (both gitignored); `.env.example` is a committed *template* and must stay blank.

The landing page is **fully premium without any keys** — the AI preview panel falls back to a
hand-built dashboard mock, and the match countdown falls back to built-in fixtures.

### Live match fixtures (`/api/fixtures`)
The countdown pulls **real** upcoming matches with **exact kickoff times**, major competitions first
(World Cup → Champions League → Premier League → …). Source chain (`server/sportsFixtures.ts`):
1. **Football-Data.org** — if `FOOTBALL_DATA_KEY` is set (most accurate/structured)
2. **TheSportsDB** free `eventsday` endpoint (`THESPORTSDB_KEY=3`) — works with no signup and includes the World Cup
3. → built-in static fixtures (client-side fallback, so the countdown never empties)

Cached 30 min server-side. Get a free Football-Data key at
<https://www.football-data.org/client/register> for the most reliable times.

> **Local TLS note:** this machine's antivirus (Avast) intercepts Node's outbound HTTPS, so
> server-side calls to OpenAI/OpenRouter fail locally with "fetch failed". Set `DEV_INSECURE_TLS=1`
> in `.env.local` to bypass verification **for the dev server only** (production is unaffected and
> never reads this flag).

---

## Conversion funnel

Every CTA routes through `src/lib/whatsapp.ts` to a single number
(`+44 7411 202861`) with a pre-written, intent-specific message
(free trial, World Cup, per-plan, speed-test result, support).

Change the number or messages in that one file.

---

## Architecture

```
api/generate-image.ts      Vercel/Netlify serverless OpenAI endpoint (prod)
vite.config.ts             React + Tailwind v4 + dev-only /api middleware
src/
  index.css                Tailwind v4 @theme design tokens + keyframes + utilities
  lib/site.ts              All copy, pricing, fixtures, FAQ, testimonials
  lib/whatsapp.ts          Central WhatsApp deep-link helper
  hooks/                   useCountdown · useGeneratedImage · usePWAInstall
  components/anim/         Framer-Motion presets (Reveal, Stagger, TextReveal, Counter)
  components/ui/           Button, Icon, Logo, Section, Aurora
  components/visuals/      PlayerMock (hero 4K player)
  components/*             Section components (Hero, Features, SpeedTest, Pricing, …)
public/
  manifest.webmanifest · sw.js · favicon.svg · robots.txt   (PWA)
```

### Animation system
Follows the **animate-skill / Emil-Kowalski** principles: ease-out entrances,
transform/opacity only, spring micro-interactions, staggered reveals, and full
`prefers-reduced-motion` support.

---

## Deploy (Vercel)

1. Push to a Git repo and import into Vercel.
2. Set the **`OPENAI_API_KEY`** (and optional `OPENAI_IMAGE_MODEL`) env var in the
   Vercel dashboard — *not* in the repo.
3. Deploy. `api/generate-image.ts` runs as a serverless function automatically.

For Netlify/other hosts, the same handler works as a Node function; point your
platform's function route at `/api/generate-image`.
```
