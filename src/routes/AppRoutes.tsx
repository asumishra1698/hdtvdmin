import { useSelector } from 'react-redux'
import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute'
import AdminLayout from '../layouts/AdminLayout'
import ActivityLogsPage from '../pages/ActivityLogsPage'
import AllUsersPage from '../pages/AllUsersPage'
import AllVideosPage from '../pages/AllVideosPage'
import DashboardPage from '../pages/DashboardPage'
import ForgotPasswordPage from '../pages/ForgotPasswordPage'
import OtpVerificationPage from '../pages/OtpVerificationPage'
import ResetPasswordPage from '../pages/ResetPasswordPage'
import SignInPage from '../pages/SignInPage'
import SignUpPage from '../pages/SignUpPage'
import SettingsPage from '../pages/SettingsPage'
import UploadVideoPage from '../pages/UploadVideoPage'
import type { RootState } from '../redux/store'

function AppRoutes() {
  const isAuthenticated = useSelector(
    (state: RootState) =>
      state.auth.status === 'authenticated' && Boolean(state.auth.token),
  )

  return (
    <Routes>
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/otp-verification" element={<OtpVerificationPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route element={<ProtectedRoute allowedRoles={['superadmin']} />}>
            <Route path="/dashboard/users" element={<AllUsersPage />} />
          </Route>
          <Route path="/dashboard/videos" element={<AllVideosPage />} />
          <Route path="/dashboard/videos/upload" element={<UploadVideoPage />} />
          <Route path="/dashboard/activity-logs" element={<ActivityLogsPage />} />
          <Route path="/dashboard/settings" element={<SettingsPage />} />
        </Route>
      </Route>
      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? '/dashboard' : '/signin'} replace />}
      />
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? '/dashboard' : '/signin'} replace />}
      />
    </Routes>
  )
}

export default AppRoutes