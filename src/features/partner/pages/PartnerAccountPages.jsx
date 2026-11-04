import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Check, Building2 } from 'lucide-react';
import Alert from '@mui/material/Alert';
import Button from '../../../components/common/Button';
import { LoadingSpinner } from '../../../components/common/Feedback';
import { QuoteField } from '../../quotes/components/QuoteFormFields';
import { useAuthStore } from '../../auth/store/authStore';
import { useNotificationStore } from '../../../store/notificationStore';
import { partnerApi } from '../../../api/partnerApi';
import { apiConfig } from '../../../api/config';
import { getErrorMessage } from '../../../api/errors';
import { normalizePartnerProfile, validatePartnerProfile, validatePartnerSettings } from '../partnerModel';

export const PartnerProfilePage = () => <PartnerAccountForm key="profile" />;
export const PartnerSettingsPage = () => <PartnerAccountForm key="settings" settings />;
function PartnerAccountForm({ settings = false }) {
  const user = useAuthStore(state => state.user);
  const [requestError, setRequestError] = useState(null);
  const { register, handleSubmit, setError, clearErrors, reset, formState: { errors, isSubmitting, isDirty } } = useForm({ defaultValues: settings ? { validityDays: user.partnerSettings?.validityDays || 7, defaultTerms: user.partnerSettings?.defaultTerms || '' } : normalizePartnerProfile(user) });
  async function submit(input) {
    const values = settings ? { validityDays: Number(input.validityDays), defaultTerms: input.defaultTerms.trim() } : normalizePartnerProfile(input);
    const invalid = settings ? validatePartnerSettings(values) : validatePartnerProfile(values);
    clearErrors(); setRequestError(null);
    if (Object.keys(invalid).length) { Object.entries(invalid).forEach(([key, message]) => setError(key, { message }, { shouldFocus: true })); return; }
    try {
      const updated = await (settings ? partnerApi.updateSettings(values) : partnerApi.updateProfile(values));
      if (useAuthStore.getState().user?.id !== user.id) return;
      useAuthStore.setState({ user: updated }); reset(values);
      useNotificationStore.getState().notify(settings ? 'Your quote defaults are saved.' : 'Your business profile is updated.');
    } catch (error) { setRequestError(getErrorMessage(error)); }
  }
  const field = { register, errors };
  return <div className="workspace-page fade-in"><div className="workspace-page-heading"><div><p className="eyebrow">{settings ? 'A LITTLE LESS REPETITION' : 'THE PEOPLE BEHIND THE JOURNEYS'}</p><h1>{settings ? 'Your quote defaults.' : 'Tell your business story.'}</h1><p>{settings ? 'A useful starting point for every proposal. Adjust the details for each traveler.' : 'Introduce the expertise and care you bring to every trip.'}</p></div></div><section className="workspace-panel account-panel"><div className="account-intro"><span className="avatar"><Building2 size={24} /></span><div><h2>{user.businessName || user.name}</h2><p>{user.email}</p></div></div><form className="account-form trip-form-fields" onSubmit={handleSubmit(submit)} noValidate aria-busy={isSubmitting}>{requestError && <Alert severity="error">{requestError}</Alert>}{settings ? <><QuoteField {...field} name="validityDays" label="Default quote validity (days)" type="number" required helperText="1–30 days. New proposals are capped at the trip’s start date." slotProps={{ htmlInput: { min: 1, max: 30, step: 1 } }} /><QuoteField {...field} name="defaultTerms" label="Default terms & cancellation policy" multiline minRows={6} helperText="Optional. Review these terms for every proposal before sending." slotProps={{ htmlInput: { maxLength: 3000 } }} /></> : <><div className="form-two-columns"><QuoteField {...field} name="name" label="Your name" required autoComplete="name" slotProps={{ htmlInput: { maxLength: 80 } }} /><QuoteField {...field} name="businessName" label="Business name" required autoComplete="organization" slotProps={{ htmlInput: { maxLength: 100 } }} /></div><QuoteField {...field} name="city" label="Based in" required autoComplete="address-level2" slotProps={{ htmlInput: { maxLength: 100 } }} /><QuoteField {...field} name="specialties" label="Destinations & specialties" placeholder="Munnar, family holidays, slow travel…" slotProps={{ htmlInput: { maxLength: 300 } }} /><QuoteField {...field} name="description" label="About your business" multiline minRows={5} slotProps={{ htmlInput: { maxLength: 1500 } }} helperText="Share your approach and experience. Avoid sensitive personal details." /></>}<Button type="submit" disabled={!isDirty || isSubmitting}>{isSubmitting ? <LoadingSpinner size={16} /> : <Check size={16} />}Save {settings ? 'defaults' : 'profile'}</Button></form><p className="settings-note">{settings ? 'Defaults apply to new quote drafts. Existing proposals keep their original details.' : 'Your profile appears with your published packages. Updates apply to your catalog; existing enquiries and sent proposals keep their original details.'}{apiConfig.useMock && ' Demo changes reset on reload.'}</p></section></div>;
}
