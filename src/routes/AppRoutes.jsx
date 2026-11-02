import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import HomePage from '../features/home/pages/HomePage';
import ProtectedRoute from './ProtectedRoute';
import RoleProtectedRoute from './RoleProtectedRoute';
import GuestRoute from './GuestRoute';
import { PageLoader } from '../components/common/Feedback';
import { ROLES, ROUTES } from '../constants/routes';

const AuthLayout = lazy(() => import('../layouts/AuthLayout'));
const LoginPage = lazy(() => import('../features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('../features/auth/pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('../features/auth/pages/ForgotPasswordPage'));
const AccountReadyPage = lazy(() => import('../features/auth/pages/AccountReadyPage'));
const ExplorePage = lazy(() => import('../features/home/pages/ExplorePage'));
const InformationPage = lazy(() => import('../features/home/pages/InformationPage'));
const NotFoundPage = lazy(() => import('../features/home/pages/InformationPage').then(module => ({ default: module.NotFoundPage })));

export default function AppRoutes() {
  return <Suspense fallback={<PageLoader />}><Routes><Route element={<PublicLayout />}><Route path={ROUTES.HOME} element={<HomePage />} /><Route path={ROUTES.EXPLORE} element={<ExplorePage />} />{['about', 'contact', 'privacy', 'terms'].map(page => <Route key={page} path={`/${page}`} element={<InformationPage page={page} />} />)}<Route element={<ProtectedRoute />}><Route element={<RoleProtectedRoute allowedRoles={[ROLES.CUSTOMER]} />}><Route path={ROUTES.CUSTOMER} element={<AccountReadyPage />} /></Route><Route element={<RoleProtectedRoute allowedRoles={[ROLES.BUSINESS_OWNER]} />}><Route path={ROUTES.PARTNER} element={<AccountReadyPage />} /></Route></Route><Route path="*" element={<NotFoundPage />} /></Route><Route element={<GuestRoute />}><Route element={<AuthLayout />}><Route path={ROUTES.LOGIN} element={<LoginPage />} /><Route path={ROUTES.REGISTER} element={<RegisterPage />} /><Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} /></Route></Route></Routes></Suspense>;
}
