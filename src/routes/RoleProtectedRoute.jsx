import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../features/auth/store/authStore';
import { ROLE_HOME } from '../constants/routes';

export default function RoleProtectedRoute({ allowedRoles }) {
  const role = useAuthStore(state => state.role);
  return allowedRoles.includes(role) ? <Outlet /> : <Navigate to={ROLE_HOME[role] || '/login'} replace />;
}
