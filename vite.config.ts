import { defineConfig, loadEnv, type Plugin } from 'vite'
import type { ServerResponse } from 'node:http'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { getFixtures } from './server/sportsFixtures'

/* ────────────────────────────────────────────────────────────────
   Shared helpers (server-side only — never bundled to the client)
   ──────────────────────────────────────────────────────────────── */

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

/* ────────────────────────────────────────────────────────────────
   Dev-only API middleware. Mirrors the production serverless
   functions in /api. The API keys are read here (Node side) and
   never reach the browser bundle.
   ──────────────────────────────────────────────────────────────── */
function apiDevServer(env: Record<string, string>): Plugin {
  const merged: Record<string, string | undefined> = { ...process.env, ...env }

  return {
    name: 'helliptv-api-dev',
    apply: 'serve',
    configureServer(server) {
      // Local-only escape hatch for TLS-intercepting antivirus (e.g. Avast),
      // which makes Node reject otherwise-valid certs. Opt-in via
      // DEV_INSECURE_TLS=1 in .env.local. NEVER used in production —
      // this plugin only runs on the dev server (apply: 'serve').
      if (env.DEV_INSECURE_TLS === '1' || env.DEV_INSECURE_TLS === 'true') {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
        server.config.logger.warn(
          '[helliptv] DEV_INSECURE_TLS enabled — TLS verification disabled for local dev API calls only.',
        )
      }

      // ── GET /api/fixtures (real sports data) ──
      server.middlewares.use('/api/fixtures', async (_req, res) => {
        try {
          const { fixtures, source } = await getFixtures(merged, 6)
          sendJson(res, 200, { fixtures, source })
        } catch (err: any) {
          sendJson(res, 500, { error: err?.message || 'Unexpected error', fixtures: [] })
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  // Load *all* env vars (no VITE_ prefix filter) for server-side use only.
  // Read from THIS config's directory so it works regardless of cwd.
  const env = loadEnv(mode, import.meta.dirname, '')

  return {
    plugins: [react(), tailwindcss(), apiDevServer(env)],
    // Always resolve a single copy of React — the canonical fix for
    // "Invalid hook call / more than one copy of React".
    resolve: {
      dedupe: ['react', 'react-dom'],
    },
    server: {
      port: 5173,
      host: true,
      hmr: { host: 'localhost' },
    },
    // Pre-bundle the COMPLETE dep set in one pass and disable mid-session
    // re-optimization (noDiscovery). In this preview the HMR socket can't always
    // reach the browser to trigger the post-re-optimize reload, which otherwise
    // left two React bundles loaded and crashed the app.
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-dom/client',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        'framer-motion',
        'react-use-measure',
        'react-router-dom',
        'lucide-react',
        '@supabase/supabase-js',
        'react-markdown',
        'remark-gfm',
      ],
      noDiscovery: true,
    },
  }
})
