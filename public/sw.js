/* HellIPTV service worker — PUSH ONLY (no caching).

   We deliberately do NOT cache HTML/JS/CSS here. Caching in the SW kept serving
   stale bundles after deploys (the blog showing blank / old content until a hard
   reload). The browser + Netlify CDN already cache correctly via HTTP headers
   (hashed assets are immutable; index.html is revalidated), so a network-only SW
   means every deploy shows up immediately.

   This SW exists only to power web-push notifications. On activate it purges any
   caches left behind by older SW versions, so visitors who still have the old
   caching SW self-heal automatically on their next visit. */

self.addEventListener('install', () => {
  // Take over as soon as possible — don't wait for old tabs to close.
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((k) => caches.delete(k)))) // nuke every old cache
      .then(() => self.clients.claim()),
  )
})

// NOTE: there is intentionally NO 'fetch' handler. Without it the SW never
// intercepts requests, so HTML and JS always come fresh from the network/CDN.

/* ── Web push: show a notification for new blog posts ── */
self.addEventListener('push', (event) => {
  let data = {}
  try { data = event.data ? event.data.json() : {} } catch (_e) { data = {} }
  const title = data.title || 'New on HellIPTV'
  const options = {
    body: data.body || 'A new article just dropped.',
    icon: data.icon || '/favicon-32.png',
    badge: '/favicon-32.png',
    image: data.image || undefined,
    data: { url: data.url || '/blog' },
    tag: data.tag || 'helliptv-post',
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = (event.notification.data && event.notification.data.url) || '/blog'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) { if ('focus' in c && c.url.includes(url)) return c.focus() }
      return self.clients.openWindow(url)
    }),
  )
})
