/* Web push fan-out. Receives { subscriptions, payload } and pushes to each.
   VAPID private key stays server-side. */
import { sendPush } from '../../server/push.mjs'

export default async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })
  let body
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const env = {
    VITE_VAPID_PUBLIC_KEY: process.env.VITE_VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY,
    VAPID_SUBJECT: process.env.VAPID_SUBJECT,
  }
  try {
    return Response.json(await sendPush(env, body.subscriptions, body.payload))
  } catch (e) {
    return Response.json({ error: e?.message || 'Push send failed' }, { status: e?.unconfigured ? 503 : 502 })
  }
}
