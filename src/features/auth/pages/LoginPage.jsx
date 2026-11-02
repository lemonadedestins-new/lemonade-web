import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Compass, BriefcaseBusiness } from 'lucide-react';
import Alert from '@mui/material/Alert';
import FormField from '../../../components/forms/FormField';
import Button from '../../../components/common/Button';
import { LoadingSpinner } from '../../../components/common/Feedback';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../../../store/notificationStore';
import { emailRules } from '../validation';
import { ROLE_HOME, ROLES } from '../../../constants/routes';
import { apiConfig } from '../../../api/config';
import { safeReturnPath } from '../../../utils/navigation';

export default function LoginPage() {
  const login = useAuthStore(state => state.login);
  const error = useAuthStore(state => state.error);
  const clearError = useAuthStore(state => state.clearError);
  const notify = useNotificationStore(state => state.notify);
  const navigate = useNavigate();
  const location = useLocation();
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({ defaultValues: { email: '', password: '' } });
  useEffect(() => { clearError(); }, [clearError]);
  async function submit(values) {
    try {
      const user = await login(values);
      if (!user) return;
      notify(`Welcome back, ${user.name.split(' ')[0]}.`);
      navigate(safeReturnPath(location.state?.from, user.role) || ROLE_HOME[user.role], { replace: true });
    } catch { /* The auth store exposes a safe error message above the form. */ }
  }
  function fillDemo(role) {
    clearError();
    setValue('email', role === ROLES.CUSTOMER ? 'customer@lemonade.demo' : 'partner@lemonade.demo', { shouldValidate: true });
    setValue('password', 'TravelDemo1!', { shouldValidate: true });
  }
  return <div className="auth-form-wrap fade-in"><p className="eyebrow">GOOD TO SEE YOU AGAIN</p><h1>Welcome back.</h1><p className="auth-intro">Your next great journey is a little closer.</p><form className="auth-form" onSubmit={handleSubmit(submit)} noValidate aria-busy={isSubmitting}>{error && <Alert severity="error">{error}</Alert>}<FormField label="Email address" type="email" autoComplete="email" registration={register('email', emailRules)} error={errors.email} /><div><FormField label="Password" type="password" autoComplete="current-password" registration={register('password', { required: 'Please enter your password.' })} error={errors.password} /><div className="forgot-link"><Link to="/forgot-password">Forgot password?</Link></div></div><Button type="submit" className="button-full auth-submit" disabled={isSubmitting}>{isSubmitting ? <><LoadingSpinner size={18} /> Logging in…</> : <>Log in <ArrowRight size={18} /></>}</Button></form><p className="auth-switch">New around here? <Link to="/register">Create an account</Link></p>{apiConfig.useMock && <div className="demo-panel"><p>Take a look around</p><div><button onClick={() => fillDemo(ROLES.CUSTOMER)} disabled={isSubmitting}><Compass size={16} /> Try traveler login</button><button onClick={() => fillDemo(ROLES.BUSINESS_OWNER)} disabled={isSubmitting}><BriefcaseBusiness size={16} /> Try planner login</button></div><small>Demo accounts only. Sessions reset when you reload.</small></div>}</div>;
}
