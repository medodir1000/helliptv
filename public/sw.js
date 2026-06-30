/* HellIPTV service worker — lightweight offline shell.
   Network-first for navigations (always fresh), cache fallback when offline. */
const CACHE = 'helliptv-v3'
const SHELL = ['/', '/index.html', '/favicon-32.png', '/manifest.webmanifest']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ).then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  // Only handle http(s) — chrome-extension://, data:, blob: etc. can't be cached.
  if (!request.url.startsWith('http')) return

  // Never cache the API endpoints.
  if (new URL(request.url).pathname.startsWith('/api/')) return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone()
          caches.open(CACHE).then((c) => c.put(request, copy))
          return res
        })
        .catch(() => caches.match(request).then((r) => r || caches.match('/index.html'))),
    )
    return
  }

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((res) => {
      if (res.ok && res.type === 'basic') {
        const copy = res.clone()
        caches.open(CACHE).then((c) => c.put(request, copy))
      }
      return res
    })),
  )
})

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
