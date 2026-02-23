import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthGuard } from './components/AuthGuard'
import { OnboardingGuard } from './components/OnboardingGuard'
import { PlanLimitGuard } from './components/PlanLimitGuard'
import { ScrollToTop } from './components/ScrollToTop'
import { AdminAnnotationMode } from './components/admin/AdminAnnotationMode'
import { MarketingLayout } from './components/layout/MarketingLayout'
import { DashboardShell } from './components/layout/DashboardShell'
import { HomePage } from './pages/HomePage'
import { SignInPage } from './pages/SignInPage'
import { SignUpPage } from './pages/SignUpPage'
import { VerifyEmailPage } from './pages/VerifyEmailPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'

const FeaturesPage = lazy(() => import('./pages/FeaturesPage').then((m) => ({ default: m.FeaturesPage })))
const PricingPage = lazy(() => import('./pages/PricingPage').then((m) => ({ default: m.PricingPage })))
const PublicCharacterPage = lazy(() => import('./pages/PublicCharacterPage').then((m) => ({ default: m.PublicCharacterPage })))
const WelcomePage = lazy(() => import('./pages/WelcomePage').then((m) => ({ default: m.WelcomePage })))
const InstallGuidePage = lazy(() => import('./pages/docs/InstallGuidePage').then((m) => ({ default: m.InstallGuidePage })))
const TermsPage = lazy(() => import('./pages/TermsPage').then((m) => ({ default: m.TermsPage })))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then((m) => ({ default: m.PrivacyPage })))
const AcceptableUsePolicyPage = lazy(() => import('./pages/AcceptableUsePolicyPage').then((m) => ({ default: m.AcceptableUsePolicyPage })))
const SecurityPolicyPage = lazy(() => import('./pages/SecurityPolicyPage').then((m) => ({ default: m.SecurityPolicyPage })))
const RefundPolicyPage = lazy(() => import('./pages/RefundPolicyPage').then((m) => ({ default: m.RefundPolicyPage })))
const MerchantDashboard = lazy(() => import('./pages/dashboard/MerchantDashboard').then((m) => ({ default: m.MerchantDashboard })))
const CharacterStudio = lazy(() => import('./pages/dashboard/CharacterStudio').then((m) => ({ default: m.CharacterStudio })))
const MyCharacters = lazy(() => import('./pages/dashboard/MyCharacters').then((m) => ({ default: m.MyCharacters })))
const EditCharacterPage = lazy(() => import('./pages/dashboard/EditCharacterPage').then((m) => ({ default: m.EditCharacterPage })))
const WidgetSettings = lazy(() => import('./pages/dashboard/WidgetSettings').then((m) => ({ default: m.WidgetSettings })))
const WidgetDemo = lazy(() => import('./pages/dashboard/WidgetDemo').then((m) => ({ default: m.WidgetDemo })))
const BillingPage = lazy(() => import('./pages/dashboard/BillingPage').then((m) => ({ default: m.BillingPage })))
const SettingsPage = lazy(() => import('./pages/dashboard/SettingsPage').then((m) => ({ default: m.SettingsPage })))
const AnalyticsPage = lazy(() => import('./pages/dashboard/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage })))
const ToolstizerOverview = lazy(() => import('./pages/admin/ToolstizerOverview').then((m) => ({ default: m.ToolstizerOverview })))
const BedrockPlayground = lazy(() => import('./pages/admin/BedrockPlaygroundSimple').then((m) => ({ default: m.BedrockPlaygroundSimple })))
const PromptTemplateManager = lazy(() => import('./pages/admin/PromptTemplateManager').then((m) => ({ default: m.PromptTemplateManager })))

function PageFallback() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center bg-[#F5F5F5]">
      <div className="animate-pulse w-full max-w-md h-64 bg-[#E5E7EB] rounded-lg" />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AdminAnnotationMode />
      <Routes>
        {/* Marketing routes */}
        <Route element={<MarketingLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/features" element={<Suspense fallback={<PageFallback />}><FeaturesPage /></Suspense>} />
          <Route path="/pricing" element={<Suspense fallback={<PageFallback />}><PricingPage /></Suspense>} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/verify" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/c/:slug" element={<Suspense fallback={<PageFallback />}><PublicCharacterPage /></Suspense>} />
          <Route path="/docs/install" element={<Suspense fallback={<PageFallback />}><InstallGuidePage /></Suspense>} />
          <Route path="/docs/install/:platform" element={<Suspense fallback={<PageFallback />}><InstallGuidePage /></Suspense>} />
          <Route path="/terms" element={<Suspense fallback={<PageFallback />}><TermsPage /></Suspense>} />
          <Route path="/privacy" element={<Suspense fallback={<PageFallback />}><PrivacyPage /></Suspense>} />
          <Route path="/acceptable-use" element={<Suspense fallback={<PageFallback />}><AcceptableUsePolicyPage /></Suspense>} />
          <Route path="/security" element={<Suspense fallback={<PageFallback />}><SecurityPolicyPage /></Suspense>} />
          <Route path="/refunds" element={<Suspense fallback={<PageFallback />}><RefundPolicyPage /></Suspense>} />
        </Route>

        {/* Welcome flow — first login */}
        <Route path="/welcome" element={<AuthGuard><Suspense fallback={<PageFallback />}><WelcomePage /></Suspense></AuthGuard>} />

        {/* Dashboard routes — auth protected */}
        <Route path="/dashboard" element={<AuthGuard><OnboardingGuard><DashboardShell /></OnboardingGuard></AuthGuard>}>
          <Route index element={<Suspense fallback={<PageFallback />}><MerchantDashboard /></Suspense>} />
          <Route path="studio" element={<Suspense fallback={<PageFallback />}><PlanLimitGuard action="create_character"><CharacterStudio /></PlanLimitGuard></Suspense>} />
          <Route path="characters" element={<Suspense fallback={<PageFallback />}><MyCharacters /></Suspense>} />
          <Route path="characters/:id/edit" element={<Suspense fallback={<PageFallback />}><EditCharacterPage /></Suspense>} />
          <Route path="widget" element={<Suspense fallback={<PageFallback />}><WidgetSettings /></Suspense>} />
          <Route path="widget/demo" element={<Suspense fallback={<PageFallback />}><WidgetDemo /></Suspense>} />
          <Route path="billing" element={<Suspense fallback={<PageFallback />}><BillingPage /></Suspense>} />
          <Route path="settings" element={<Suspense fallback={<PageFallback />}><SettingsPage /></Suspense>} />
          <Route path="analytics" element={<Suspense fallback={<PageFallback />}><AnalyticsPage /></Suspense>} />
        </Route>

        {/* Admin routes — auth protected */}
        <Route path="/admin" element={<AuthGuard requireAdmin><DashboardShell /></AuthGuard>}>
          <Route index element={<Suspense fallback={<PageFallback />}><ToolstizerOverview /></Suspense>} />
          <Route path="playground" element={<Suspense fallback={<PageFallback />}><BedrockPlayground /></Suspense>} />
          <Route path="templates" element={<Suspense fallback={<PageFallback />}><PromptTemplateManager /></Suspense>} />
          <Route path="quality" element={<Suspense fallback={<PageFallback />}><ToolstizerOverview /></Suspense>} />
          <Route path="pipeline" element={<Suspense fallback={<PageFallback />}><ToolstizerOverview /></Suspense>} />
          <Route path="merchants" element={<Suspense fallback={<PageFallback />}><ToolstizerOverview /></Suspense>} />
          <Route path="alerts" element={<Suspense fallback={<PageFallback />}><ToolstizerOverview /></Suspense>} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
