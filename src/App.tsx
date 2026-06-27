import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { FeaturesPage } from './pages/FeaturesPage'
import { SpeedTestPage } from './pages/SpeedTestPage'
import { ChannelsPage } from './pages/ChannelsPage'
import { PricingPage } from './pages/PricingPage'
import { FaqPage } from './pages/FaqPage'
import { SetupGuides } from './pages/SetupGuides'
import { DevicePage } from './pages/DevicePage'
import { BlogIndex } from './pages/BlogIndex'
import { NotFound } from './pages/NotFound'

/* Heavy, rarely-first routes are split out so react-markdown + the admin editor
   never load on the marketing pages. */
const BlogPost = lazy(() => import('./pages/BlogPost').then((m) => ({ default: m.BlogPost })))
const Admin = lazy(() => import('./pages/Admin').then((m) => ({ default: m.Admin })))

const RouteFallback = () => <div className="grid min-h-dvh place-items-center text-sm text-faint">Loading…</div>

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          {/* Admin stands alone — no marketing navbar/footer */}
          <Route path="/admin" element={<Admin />} />

          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/speed-test" element={<SpeedTestPage />} />
            <Route path="/channels" element={<ChannelsPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/setup-guides" element={<SetupGuides />} />
            <Route path="/devices/:slug" element={<DevicePage />} />
            <Route path="/blog" element={<BlogIndex />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
