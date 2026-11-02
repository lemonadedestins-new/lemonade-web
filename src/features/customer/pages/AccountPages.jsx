import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Check, ShieldCheck } from 'lucide-react';
import Alert from '@mui/material/Alert';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Button from '../../../components/common/Button';
import { LoadingSpinner } from '../../../components/common/Feedback';
import { useAuthStore } from '../../auth/store/authStore';
import { useNotificationStore } from '../../../store/notificationStore';
import { customerApi } from '../../../api/customerApi';
import { getErrorMessage } from '../../../api/errors';
import { apiConfig } from '../../../api/config';
import { ACCOMMODATIONS, TRANSPORT } from '../../../constants/trips';
import { ROUTES } from '../../../constants/routes';
import FormField from '../../../components/forms/FormField';
import { nameRules } from '../../auth/validation';

function useAccountSave(action) {
  const [error, setError] = useState(null);
  const save = async values => {
    setError(null);
    const id = useAuthStore.getState().user?.id;
    try {
      const user = await action(values);
      if (useAuthStore.getState().user?.id !== id) return;
      useAuthStore.setState({ user });
      useNotificationStore.getState().notify('Your changes are saved.');
      return user;
    } catch (failure) { setError(getErrorMessage(failure)); }
  };
  return { save, error };
}
export function ProfilePage() {
  const user = useAuthStore(state => state.user);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting, isDirty } } = useForm({ defaultValues: { name: user.name, homeCity: user.homeCity || '' } });
  const { save, error } = useAccountSave(customerApi.updateProfile);
  return <div className="workspace-page fade-in"><div className="workspace-page-heading"><div><p className="eyebrow">THE PERSON BEHIND THE PLANS</p><h1>My profile<span className="welcome-dot">.</span></h1><p>A few details to make your journey feel more personal.</p></div></div><section className="workspace-panel account-panel"><div className="account-intro"><span className="avatar">{user.name.slice(0, 1).toUpperCase()}</span><div><h2>{user.name}</h2><p>Traveler · {user.email}</p></div></div><form noValidate className="account-form" onSubmit={handleSubmit(async values => { const updated = await save(values); if (updated) reset({ name: updated.name, homeCity: updated.homeCity || '' }); })}>
    {error && <Alert severity="error">{error}</Alert>}<FormField label="Full name" registration={register('name', nameRules)} error={errors.name} autoComplete="name" /><TextField label="Email address" value={user.email} slotProps={{ input: { readOnly: true } }} helperText="Your sign-in email can’t be changed here." /><FormField label="Home city (optional)" registration={register('homeCity', { maxLength: { value: 100, message: 'Keep this under 101 characters.' } })} error={errors.homeCity} autoComplete="address-level2" helperText="We’ll use this as the departure city for new requests." /><Button type="submit" disabled={isSubmitting || !isDirty}>{isSubmitting ? <LoadingSpinner size={16} /> : <Check size={16} />} Save profile</Button>
  </form>{apiConfig.useMock && <p className="settings-note">Use sample details in this preview. Profile changes last until the page is reloaded.</p>}</section></div>;
}
export function SettingsPage() {
  const user = useAuthStore(state => state.user);
  const [preferences, setPreferences] = useState({ accommodation: user.preferences?.accommodation || 'Open to suggestions', transportation: user.preferences?.transportation || 'Open to suggestions' });
  const [saving, setSaving] = useState(false);
  const { save, error } = useAccountSave(customerApi.updatePreferences);
  async function submit(event) { event.preventDefault(); setSaving(true); try { await save(preferences); } finally { setSaving(false); } }
  return <div className="workspace-page fade-in"><div className="workspace-page-heading"><div><p className="eyebrow">MAKE YOURSELF AT HOME</p><h1>Your preferences<span className="welcome-dot">.</span></h1><p>A starting point for every new adventure.</p></div></div><section className="workspace-panel account-panel"><div className="workspace-section-heading"><div><h2>Your usual travel style</h2><p>These preferences prefill new requests. You can always change them for each trip.</p></div></div><form className="account-form" onSubmit={submit}>{error && <Alert severity="error">{error}</Alert>}{[['accommodation', 'Your ideal stay', ACCOMMODATIONS], ['transportation', 'Getting around', TRANSPORT]].map(([key, label, choices]) => <TextField key={key} select label={label} value={preferences[key]} disabled={saving} onChange={event => setPreferences(current => ({ ...current, [key]: event.target.value }))}>{choices.map(value => <MenuItem key={value} value={value}>{value}</MenuItem>)}</TextField>)}<Button type="submit" disabled={saving}>{saving ? <LoadingSpinner size={16} /> : <Check size={16} />} Save preferences</Button></form>
    <div className="settings-row"><div><h3>Prices & budgets</h3><p>All amounts are shown in Indian rupees (INR), for the entire travel party.</p></div><span className="avatar">₹</span></div><div className="settings-row"><div><h3>Your account security</h3><p>To request a password reset, sign out and use the password recovery link on the login page.</p></div><ShieldCheck size={24} /></div><p className="settings-note">{apiConfig.useMock ? 'This demo keeps your settings in memory and resets them on reload. No email or notifications are sent.' : 'Read how your details are handled in our privacy policy.'} <Link to={ROUTES.PRIVACY} className="text-link">Privacy policy</Link></p>
  </section></div>;
}
