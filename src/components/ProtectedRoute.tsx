import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'
import type { RootState } from '../redux/store'

interface ProtectedRouteProps {
  allowedRoles?: string[]
}

const normalizeRole = (role: string | undefined) =>
  (role ?? '').trim().toLowerCase().replace(/[_\s-]+/g, '')

function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { status, token, user } = useSelector((state: RootState) => state.auth)
  const isAuthenticated = status === 'authenticated' && Boolean(token)

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const currentRole = normalizeRole(user?.role)
    const canAccess = allowedRoles.some((role) => normalizeRole(role) === currentRole)

    if (!canAccess) {
      return <Navigate to="/dashboard" replace />
    }
  }

  return <Outlet />
}

export default ProtectedRoute