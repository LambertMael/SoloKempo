import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'


type Role = 'admin' | 'competiteur' | 'gestionnaire';
interface PrivateRouteProps {
  role?: Role | Role[];
}


const PrivateRoute = ({ role }: PrivateRouteProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role) {
    if (Array.isArray(role)) {
      if (!role.includes(user.role)) {
        return <Navigate to="/dashboard" replace />;
      }
    } else {
      if (user.role !== role) {
        return <Navigate to="/dashboard" replace />;
      }
    }
  }

  return <Outlet />;
};

export default PrivateRoute