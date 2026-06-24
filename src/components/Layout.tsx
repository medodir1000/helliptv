import { Outlet } from 'react-router-dom'
import { ScrollManager } from './ScrollManager'
import { PromoBanner } from './PromoBanner'
import { PromoModal } from './PromoModal'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { StickyWhatsApp } from './StickyWhatsApp'
import { PWAInstallPrompt } from './PWAInstallPrompt'

/** Shared chrome (banner, nav, footer, floating CTAs) wrapping every route. */
export function Layout() {
  return (
    <div className="relative min-h-dvh bg-canvas text-fg">
      <ScrollManager />
      <PromoModal />
      <PromoBanner />
      <Navbar />

      <main>
        <Outlet />
      </main>

      <Footer />
      <StickyWhatsApp />
      <PWAInstallPrompt />
    </div>
  )
}
