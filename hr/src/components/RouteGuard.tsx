import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { ReactNode } from 'react'

interface Props {
  children: ReactNode
  allowedRoles: string[]
}

const RouteGuard = ({ children, allowedRoles }: Props) => {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default RouteGuard
