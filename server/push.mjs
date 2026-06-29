/* Web push sender (server-side). Uses the VAPID private key — never shipped to the
   browser. Given a list of subscriptions + a payload, pushes to each and reports
   which endpoints are gone (404/410) so the caller can prune them. */
import webpush from 'web-push'

export async function sendPush(env, subscriptions, payload) {
  const pub = env.VITE_VAPID_PUBLIC_KEY || env.VAPID_PUBLIC_KEY
  const priv = env.VAPID_PRIVATE_KEY
  if (!pub || !priv) {
    const e = new Error('VAPID keys not configured (set VITE_VAPID_PUBLIC_KEY + VAPID_PRIVATE_KEY).')
    e.unconfigured = true
    throw e
  }
  webpush.setVapidDetails(env.VAPID_SUBJECT || 'mailto:admin@helliptv.com', pub, priv)
  const body = JSON.stringify(payload || {})
  let sent = 0
  let failed = 0
  const gone = []
  for (const s of subscriptions || []) {
    if (!s?.endpoint || !s?.p256dh || !s?.auth) { failed++; continue }
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, body, { TTL: 86400 })
      sent++
    } catch (err) {
      failed++
      const code = err?.statusCode
      if (code === 404 || code === 410) gone.push(s.endpoint) // expired/unsubscribed
    }
  }
  return { ok: true, sent, failed, gone }
}
