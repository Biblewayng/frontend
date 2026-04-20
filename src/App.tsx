import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { ProtectedRoute } from './components/ProtectedRoute'
import { ErrorBoundary } from './components/ErrorBoundary'
import { AuthProvider } from './context/AuthContext'
import { PermissionProvider } from './context/PermissionContext'
import { AuthStatusProvider, useAuthStatus } from './context/AuthStatusContext'
import NetworkBanner from './components/NetworkBanner'
import LandingPage from './pages/landing/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import VerifyEmailPage from './pages/auth/VerifyEmailPage'

const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'))
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'))
const MemberDashboard = lazy(() => import('./pages/member-dashboard/MemberDashboard'))
const MembershipPage = lazy(() => import('./pages/membership/MembershipPage'))
const SermonsPage = lazy(() => import('./pages/sermons/SermonsPage'))
const EventsPage = lazy(() => import('./pages/events/EventsPage'))
const LiveStreamPage = lazy(() => import('./pages/live/LiveStreamPage'))
const AnnouncementsPage = lazy(() => import('./pages/announcements/AnnouncementsPage'))
const FormsPage = lazy(() => import('./pages/forms/FormsPage'))
const PrayersPage = lazy(() => import('./pages/prayers/PrayersPage'))
const UserManagementPage = lazy(() => import('./pages/users/UserManagementPage'))
const ContentManagementPage = lazy(() => import('./pages/content/ContentManagementPage'))
const EmailTemplatesPage = lazy(() => import('./pages/email-templates/EmailTemplatesPage'))
const SettingsPage = lazy(() => import('./pages/settings/SettingsPage'))
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage'))
const PublicFormPage = lazy(() => import('./pages/forms/PublicFormPage'))
const NotFound = lazy(() => import('./pages/NotFound'))
const AboutPage = lazy(() => import('./pages/public/AboutPage'))
const ServicesPage = lazy(() => import('./pages/public/ServicesPage'))
const ContactPage = lazy(() => import('./pages/public/ContactPage'))
const ContactMessagesPage = lazy(() => import('./pages/contact/ContactMessagesPage'))
const GivingPage = lazy(() => import('./pages/giving/GivingPage'))

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
)

const AuthRouteWrapper = ({ path, element }: { path: string, element: React.ReactNode }) => {
  const { authStatus, loading } = useAuthStatus();
  if (loading) return <LoadingFallback />;
  const isEnabled = path === '/login' ? authStatus?.login_enabled : authStatus?.signup_enabled;
  if (isEnabled === false) return <Navigate to="/" />;
  return <>{element}</>;
};

function App() {
  return (
    <ErrorBoundary>
      <AuthStatusProvider>
        <AuthProvider>
          <PermissionProvider>
            <BrowserRouter>
              <NetworkBanner />
              <Toaster richColors position="top-right" />
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                <Route path="/landing" element={<Navigate to="/" replace />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/forms/:id" element={<PublicFormPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/member-dashboard" element={<ProtectedRoute><MemberDashboard /></ProtectedRoute>} />
                <Route path="/membership" element={<ProtectedRoute requiredPermission="members.view"><MembershipPage /></ProtectedRoute>} />
                <Route path="/sermons" element={<ProtectedRoute requiredPermission="sermons.view"><SermonsPage /></ProtectedRoute>} />
                <Route path="/events" element={<ProtectedRoute requiredPermission="events.view"><EventsPage /></ProtectedRoute>} />
                <Route path="/live" element={<ProtectedRoute requiredPermission="livestream.view"><LiveStreamPage /></ProtectedRoute>} />
                <Route path="/announcements" element={<ProtectedRoute requiredPermission="announcements.view"><AnnouncementsPage /></ProtectedRoute>} />
                <Route path="/forms" element={<ProtectedRoute requiredPermission="forms.view"><FormsPage /></ProtectedRoute>} />
                <Route path="/prayers" element={<ProtectedRoute requiredPermission="prayers.view"><PrayersPage /></ProtectedRoute>} />
                <Route path="/users" element={<ProtectedRoute requiredPermission="users.view"><UserManagementPage /></ProtectedRoute>} />
                <Route path="/content" element={<ProtectedRoute requiredPermission="content.view"><ContentManagementPage /></ProtectedRoute>} />
                <Route path="/email-templates" element={<ProtectedRoute requiredPermission="email_templates.view"><EmailTemplatesPage /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute requiredPermission="settings.view"><SettingsPage /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="/contact-messages" element={<ProtectedRoute requiredPermission="contact.view"><ContactMessagesPage /></ProtectedRoute>} />
                <Route path="/giving" element={<ProtectedRoute requiredPermission="giving.read"><GivingPage /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
                <Route path="/login" element={<AuthRouteWrapper path="/login" element={<LoginPage />} />} />
                <Route path="/signup" element={<AuthRouteWrapper path="/signup" element={<SignupPage />} />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </PermissionProvider>
        </AuthProvider>
      </AuthStatusProvider>
    </ErrorBoundary>
  )
}

export default App