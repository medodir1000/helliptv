import { createClient } from '@supabase/supabase-js'

/* These are PUBLIC by design: the project URL is public and the anon/publishable
   key ships in the client bundle (Row Level Security protects the data). We keep
   known-good fallbacks so a mis-set Netlify env var can't blank the live blog —
   the env value is trusted only when it actually looks like a Supabase URL/key. */
const FALLBACK_URL = 'https://httyqjpcafgdhrgoymwh.supabase.co'
const FALLBACK_ANON = 'sb_publishable_QA693jlUYTfjFzxek4-QgQ_UPUj4HN4'

const envUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

const url = envUrl && /^https:\/\/.+\.supabase\.co/.test(envUrl) ? envUrl : FALLBACK_URL
// A real Supabase key starts with `sb_` (publishable) or `eyJ` (JWT). Anything else
// — empty, or the corrupted `yeyJ…` value — falls back to the known publishable key.
const key = envKey && /^(sb_|eyJ)/.test(envKey) ? envKey : FALLBACK_ANON

/** True when Supabase is configured — always true now thanks to the safe fallbacks. */
export const hasSupabase = Boolean(url && key)

/* A single shared client used across the blog + admin. */
export const supabase = createClient(url, key, {
  auth: { persistSession: true, autoRefreshToken: true },
})
