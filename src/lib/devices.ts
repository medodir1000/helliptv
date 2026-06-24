/* Per-device setup guides — drives the /devices/:slug pages and /setup-guides. */

export interface DeviceGuide {
  slug: string
  name: string
  short: string
  icon: string
  tagline: string
  apps: { name: string; store: string }[]
  steps: { title: string; body: string }[]
  tip: string
}

export const DEVICES: DeviceGuide[] = [
  {
    slug: 'smart-tv-firestick',
    name: 'Smart TV & Firestick',
    short: 'Samsung · LG · Amazon Firestick',
    icon: 'uhd',
    tagline: 'Turn any Samsung, LG or Amazon Firestick into a 4K IPTV powerhouse in minutes.',
    apps: [
      { name: 'IPTV Smarters Pro', store: 'Firestick / Smart TV store' },
      { name: 'ibo Player Pro', store: 'Firestick · Samsung · LG' },
      { name: 'Smart IPTV (SIPTV)', store: 'Samsung & LG store' },
      { name: 'TiviMate', store: 'Firestick (Downloader)' },
    ],
    steps: [
      { title: 'Get your line', body: 'After you subscribe on WhatsApp we send your Xtream Codes login (username, password, server URL) plus your free 12-hour trial.' },
      { title: 'Install a player', body: 'On Firestick search “IPTV Smarters Pro” or “ibo Player Pro”. On Samsung/LG install “Smart IPTV”, “IPTV Smarters” or “ibo Player Pro” from the TV app store.' },
      { title: 'Enter your details', body: 'Open the app, choose “Login with Xtream Codes API”, and paste the username, password and server URL we sent you.' },
      { title: 'Start streaming', body: 'Your channels, movies and full EPG guide load automatically. Pick a channel and enjoy in crisp 4K.' },
    ],
    tip: 'On Firestick, enable “Apps from Unknown Sources” in Settings if you install via the Downloader app.',
  },
  {
    slug: 'android-ios',
    name: 'Android & iOS',
    short: 'Android phones · Android TV · iPhone · iPad',
    icon: 'devices',
    tagline: 'Watch every match in your pocket — Android and iPhone, on Wi-Fi or mobile data.',
    apps: [
      { name: 'IPTV Smarters Pro', store: 'Google Play & App Store' },
      { name: 'TiviMate', store: 'Android & Android TV' },
      { name: 'GSE Smart IPTV', store: 'iPhone & iPad' },
    ],
    steps: [
      { title: 'Get your line', body: 'Message us on WhatsApp to activate your trial; we reply with your Xtream Codes login or an M3U link.' },
      { title: 'Install the app', body: 'Android: “IPTV Smarters Pro” or “TiviMate” from Google Play. iPhone/iPad: “IPTV Smarters Pro” or “GSE Smart IPTV” from the App Store.' },
      { title: 'Add your playlist', body: 'Choose Xtream Codes login and paste your credentials, or add the M3U URL we provide.' },
      { title: 'Watch anywhere', body: 'Stream at home or on the go — your full library follows you on every device.' },
    ],
    tip: 'Turn on “Auto-start last channel” for instant playback every time you open the app.',
  },
  {
    slug: 'apple-tv-mac',
    name: 'Apple TV & Mac',
    short: 'Apple TV 4K · macOS',
    icon: 'devices',
    tagline: 'Native 4K with AirPlay across your Apple TV, Mac and the rest of your Apple devices.',
    apps: [
      { name: 'iPlayTV', store: 'Apple TV App Store' },
      { name: 'IPTV Smarters', store: 'Apple TV & Mac' },
      { name: 'VLC / IINA', store: 'macOS' },
    ],
    steps: [
      { title: 'Get your line', body: 'Subscribe on WhatsApp and we send your Xtream Codes details or an M3U link within minutes.' },
      { title: 'Install a player', body: 'Apple TV (4th gen+): “iPlayTV” or “IPTV Smarters” from the App Store. Mac: “IPTV Smarters”, VLC or IINA.' },
      { title: 'Add your line', body: 'Enter the Xtream Codes API details, or open the M3U URL directly in VLC via File → Open Network.' },
      { title: 'Enjoy in 4K', body: 'Full UHD with AirPlay support, so you can throw any match to the big screen instantly.' },
    ],
    tip: 'On Mac, VLC plays M3U links instantly — just paste the URL into File → Open Network Stream.',
  },
  {
    slug: 'mag-formuler',
    name: 'MAG & Formuler',
    short: 'MAG boxes · Formuler Z series',
    icon: 'server',
    tagline: 'Plug-and-play set-top boxes — we lock your portal to your device for rock-solid playback.',
    apps: [
      { name: 'Built-in Portal', store: 'MAG boxes' },
      { name: 'MyTVOnline 2 / 3', store: 'Formuler Z series' },
    ],
    steps: [
      { title: 'Send your MAC address', body: 'On WhatsApp, send us the MAC address shown in your box’s System Info so we can authorise your device.' },
      { title: 'Open the portal settings', body: 'MAG: System Settings → Servers → Portals. Formuler: open MyTVOnline and add a new portal.' },
      { title: 'Enter the portal URL', body: 'Paste the Stalker/portal URL we sent, save it, then reboot the box.' },
      { title: 'Start watching', body: 'The full channel list and EPG load automatically every time the box powers on.' },
    ],
    tip: 'Find your MAC address under Settings → System Info — it’s required to authorise MAG and Formuler boxes.',
  },
]

export function getDevice(slug: string): DeviceGuide | undefined {
  return DEVICES.find((d) => d.slug === slug)
}
