import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** True when Supabase env vars are present (blog/admin features are live). */
export const hasSupabase = Boolean(url && key)

/* A single shared client. When unconfigured we still create a harmless stub so
   imports don't crash — callers guard on `hasSupabase`. */
export const supabase = createClient(url ?? 'http://localhost', key ?? 'public-anon-key', {
  auth: { persistSession: true, autoRefreshToken: true },
})
