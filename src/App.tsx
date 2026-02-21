import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ScrollToTop } from './components/ScrollToTop'
import { MarketingLayout } from './components/layout/MarketingLayout'
import { DashboardShell } from './components/layout/DashboardShell'
import { HomePage } from './pages/HomePage'
import { FeaturesPage } from './pages/FeaturesPage'
import { PricingPage } from './pages/PricingPage'
import { SignInPage } from './pages/SignInPage'
import { SignUpPage } from './pages/SignUpPage'
import { MerchantDashboard } from './pages/dashboard/MerchantDashboard'
import { CharacterStudio } from './pages/dashboard/CharacterStudio'
import { MyCharacters } from './pages/dashboard/MyCharacters'
import { WidgetSettings } from './pages/dashboard/WidgetSettings'
import { EdmundOverview } from './pages/admin/EdmundOverview'

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Marketing routes */}
        <Route element={<MarketingLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
        </Route>

        {/* Dashboard routes */}
        <Route path="/dashboard" element={<DashboardShell />}>
          <Route index element={<MerchantDashboard />} />
          <Route path="studio" element={<CharacterStudio />} />
          <Route path="characters" element={<MyCharacters />} />
          <Route path="widget" element={<WidgetSettings />} />
        </Route>

        {/* Admin routes */}
        <Route path="/admin" element={<DashboardShell />}>
          <Route index element={<EdmundOverview />} />
          <Route path="quality" element={<EdmundOverview />} />
          <Route path="pipeline" element={<EdmundOverview />} />
          <Route path="merchants" element={<EdmundOverview />} />
          <Route path="alerts" element={<EdmundOverview />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
