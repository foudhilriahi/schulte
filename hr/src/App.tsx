import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import SocketListener from '@/components/SocketListener'

// Pages
import LoginPage from './pages/LoginPage'
import NotFound from './pages/NotFound'

// HR pages
import DashboardPage from './pages/hr/DashboardPage'
import OffersPage from './pages/hr/OffersPage'
import ApplicationsPage from './pages/hr/ApplicationsPage'
import CandidatesPage from './pages/hr/CandidatesPage'
import InterviewsPage from './pages/hr/InterviewsPage'
import SettingsPage from './pages/hr/SettingsPage'

// Admin pages
import AdminOverviewPage from './pages/admin/OverviewPage'
import HRAccountsPage from './pages/admin/HRAccountsPage'
import TemplatesPage from './pages/admin/TemplatesPage'
import AdminSettingsPage from './pages/admin/SettingsPage'
import NewOfferPage from './pages/hr/NewOfferPage'

// Guards
import RouteGuard from './components/RouteGuard'

const queryClient = new QueryClient()

const AppInner = () => {
  const { loadFromStorage } = useAuthStore()

  useEffect(() => {
    loadFromStorage()
  }, [loadFromStorage])

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />

      {/* HR Routes */}
      <Route path="/" element={<RouteGuard allowedRoles={['HR']}><ApplicationsPage /></RouteGuard>} />
      <Route path="/overview" element={<RouteGuard allowedRoles={['HR']}><DashboardPage /></RouteGuard>} />
      <Route path="/offers" element={<RouteGuard allowedRoles={['HR']}><OffersPage /></RouteGuard>} />
      <Route path="/offers/new" element={<RouteGuard allowedRoles={['HR']}><NewOfferPage /></RouteGuard>} />
      <Route path="/applications" element={<RouteGuard allowedRoles={['HR']}><ApplicationsPage /></RouteGuard>} />
      <Route path="/candidates" element={<RouteGuard allowedRoles={['HR']}><CandidatesPage /></RouteGuard>} />
      <Route path="/interviews" element={<RouteGuard allowedRoles={['HR']}><InterviewsPage /></RouteGuard>} />
      <Route path="/settings" element={<RouteGuard allowedRoles={['HR']}><SettingsPage /></RouteGuard>} />

      {/* Admin Routes */}
      <Route path="/admin" element={<RouteGuard allowedRoles={['ADMIN']}><AdminOverviewPage /></RouteGuard>} />
      <Route path="/admin/hr-accounts" element={<RouteGuard allowedRoles={['ADMIN']}><HRAccountsPage /></RouteGuard>} />
      <Route path="/admin/templates" element={<RouteGuard allowedRoles={['ADMIN']}><TemplatesPage /></RouteGuard>} />
      <Route path="/admin/settings" element={<RouteGuard allowedRoles={['ADMIN']}><AdminSettingsPage /></RouteGuard>} />

      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner position="top-center" />
      <SocketListener />
      <BrowserRouter>
        <AppInner />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
)

export default App
