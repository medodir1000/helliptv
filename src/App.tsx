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
import { NotFound } from './pages/NotFound'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/speed-test" element={<SpeedTestPage />} />
          <Route path="/channels" element={<ChannelsPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/setup-guides" element={<SetupGuides />} />
          <Route path="/devices/:slug" element={<DevicePage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
