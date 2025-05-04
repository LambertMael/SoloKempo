import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface PrivateRouteProps {
  role?: 'admin' | 'competiteur' | 'gestionnaire'
}

const PrivateRoute = ({ role }: PrivateRouteProps) => {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <div>Chargement...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (role && user.role !== role) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}

export default PrivateRoute