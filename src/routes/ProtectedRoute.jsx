import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../features/auth/store/authStore';
import { PageLoader, ErrorState } from '../components/common/Feedback';

export default function ProtectedRoute() {
  const initialized = useAuthStore(state => state.initialized);
  const authenticated = useAuthStore(state => state.isAuthenticated);
  const initializationError = useAuthStore(state => state.initializationError);
  const initialize = useAuthStore(state => state.initializeAuth);
  const location = useLocation();
  if (!initialized) return <PageLoader />;
  if (initializationError) return <ErrorState title="We couldn’t restore your session." message={initializationError} onRetry={initialize} />;
  return authenticated ? <Outlet /> : <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
}
