import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, ShieldCheck, MapPin } from 'lucide-react';
import Alert from '@mui/material/Alert';
import FormField from '../../../components/forms/FormField';
import Button from '../../../components/common/Button';
import { LoadingSpinner } from '../../../components/common/Feedback';
import RoleSelector from '../components/RoleSelector';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../../../store/notificationStore';
import { emailRules, passwordRules, nameRules } from '../validation';
import { ROLE_HOME, ROLES, ROUTES } from '../../../constants/routes';
import { apiConfig } from '../../../api/config';
import { destinations } from '../../home/data/destinations';

export default function RegisterPage() {
  const [params] = useSearchParams();
  const registerAccount = useAuthStore(state => state.register);
  const error = useAuthStore(state => state.error);
  const clearError = useAuthStore(state => state.clearError);
  const notify = useNotificationStore(state => state.notify);
  const navigate = useNavigate();
  const destination = destinations.find(item => item.name === params.get('destination'))?.name;
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({ defaultValues: { name: '', email: '', password: '', role: params.get('role') === ROLES.BUSINESS_OWNER ? ROLES.BUSINESS_OWNER : ROLES.CUSTOMER } });
  const role = watch('role');
  useEffect(() => { clearError(); }, [clearError]);
  async function submit(values) {
    try {
      const user = await registerAccount(values);
      if (!user) return;
      notify('Your account is ready. Welcome to Lemonade.');
      navigate(user.role === ROLES.CUSTOMER && destination ? `${ROUTES.NEW_TRIP}?destination=${encodeURIComponent(destination)}` : ROLE_HOME[user.role], { replace: true });
    } catch { /* The auth store exposes validation and request failures. */ }
  }
  return <div className="auth-form-wrap register-wrap fade-in"><p className="eyebrow">LET’S GO SOMEWHERE GOOD</p><h1>{role === ROLES.BUSINESS_OWNER ? 'Great journeys need you.' : 'A world of possibilities.'}</h1><p className="auth-intro">{role === ROLES.BUSINESS_OWNER ? 'Connect your expertise with someone’s next adventure.' : 'Make room for a trip that feels a little more like you.'}</p>{destination && <p className="destination-intent"><MapPin size={15} /> Dreaming of {destination}? You’re in the right place.</p>}<form className="auth-form" onSubmit={handleSubmit(submit)} noValidate aria-busy={isSubmitting}><RoleSelector registration={register('role')} selected={role} />{error && <Alert severity="error">{error}</Alert>}<FormField label="Full name" autoComplete="name" registration={register('name', nameRules)} error={errors.name} /><FormField label="Email address" type="email" autoComplete="email" registration={register('email', emailRules)} error={errors.email} /><FormField label="Create password" type="password" autoComplete="new-password" registration={register('password', passwordRules)} error={errors.password} helperText="At least 8 characters. Make it something only you know." /><p className="form-terms">Read our <Link to="/terms">Terms of use</Link> and <Link to="/privacy">Privacy policy</Link> before creating your account.</p><Button type="submit" className="button-full auth-submit" disabled={isSubmitting}>{isSubmitting ? <><LoadingSpinner size={18} /> Creating your account…</> : <>Create {role === ROLES.BUSINESS_OWNER ? 'partner ' : ''}account <ArrowRight size={18} /></>}</Button></form><p className="auth-switch">Already part of the journey? <Link to="/login">Log in</Link></p><p className="auth-security"><ShieldCheck size={15} /> {apiConfig.useMock ? 'Preview only. Use sample details; accounts reset on reload.' : 'Your details are handled with care.'}</p></div>;
}
