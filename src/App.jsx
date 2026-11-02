import { useEffect } from 'react';
import AppRoutes from './routes/AppRoutes';
import RouteEffects from './components/layout/RouteEffects';
import { AppErrorBoundary, ToastNotification } from './components/common/Feedback';
import { useAuthStore } from './features/auth/store/authStore';

export default function App() {
  const initializeAuth = useAuthStore(state => state.initializeAuth);
  useEffect(() => { void initializeAuth(); }, [initializeAuth]);
  return <AppErrorBoundary><RouteEffects /><AppRoutes /><ToastNotification /></AppErrorBoundary>;
}
