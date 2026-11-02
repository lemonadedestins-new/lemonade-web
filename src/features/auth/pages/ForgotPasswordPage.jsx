import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import { ArrowLeft, ArrowRight, MailCheck } from 'lucide-react';
import FormField from '../../../components/forms/FormField';
import Button from '../../../components/common/Button';
import { LoadingSpinner } from '../../../components/common/Feedback';
import { emailRules } from '../validation';
import { authApi } from '../../../api/authApi';
import { apiConfig } from '../../../api/config';
import { getErrorMessage } from '../../../api/errors';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ defaultValues: { email: '' } });
  async function submit({ email }) {
    setError(null);
    try { await authApi.forgotPassword(email); setSent(true); }
    catch (requestError) { setError(getErrorMessage(requestError)); }
  }
  return <div className="auth-form-wrap fade-in">{sent ? <div className="reset-success" role="status"><span className="success-icon"><MailCheck size={32} /></span><p className="eyebrow">ONE STEP CLOSER</p><h1>{apiConfig.useMock ? 'You’re all set to try it.' : 'Check your inbox.'}</h1><p className="auth-intro">{apiConfig.useMock ? 'The password recovery flow is ready. This preview doesn’t send emails; use a demo account on the login page to keep exploring.' : 'If an account matches that email, you’ll receive a password reset link shortly. Check your spam folder, too.'}</p><Button to="/login" className="button-full">Back to log in <ArrowRight size={18} /></Button></div> : <><p className="eyebrow">A FRESH START</p><h1>Forgot your password?</h1><p className="auth-intro">It happens. Enter your email and we’ll help you find your way back.</p><form className="auth-form" onSubmit={handleSubmit(submit)} noValidate aria-busy={isSubmitting}>{error && <Alert severity="error">{error}</Alert>}<FormField label="Email address" type="email" autoComplete="email" registration={register('email', emailRules)} error={errors.email} /><Button type="submit" className="button-full auth-submit" disabled={isSubmitting}>{isSubmitting ? <><LoadingSpinner size={18} /> Sending request…</> : <>Send reset link <ArrowRight size={18} /></>}</Button></form><Link className="back-to-login" to="/login"><ArrowLeft size={16} /> Back to log in</Link></>}</div>;
}
