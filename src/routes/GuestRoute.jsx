import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../features/auth/store/authStore';
import { ROLE_HOME } from '../constants/routes';
import { PageLoader } from '../components/common/Feedback';

export default function GuestRoute() {
  const initialized = useAuthStore(state => state.initialized);
  const role = useAuthStore(state => state.role);
  if (!initialized) return <PageLoader />;
  return role ? <Navigate to={ROLE_HOME[role] || '/'} replace /> : <Outlet />;
}
