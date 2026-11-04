import { Link, useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Alert from '@mui/material/Alert';
import { ArrowLeft, Send } from 'lucide-react';
import { usePackages } from '../hooks/usePackages';
import { packageApi } from '../../../api/packageApi';
import { getErrorMessage } from '../../../api/errors';
import { useTripStore } from '../../trips/store/tripStore';
import { useAuthStore } from '../../auth/store/authStore';
import { useNotificationStore } from '../../../store/notificationStore';
import { ErrorState, PageLoader } from '../../../components/common/Feedback';
import Button from '../../../components/common/Button';
import { QuoteField } from '../../quotes/components/QuoteFormFields';
import { dateInput, formatDate, formatMoney, tripPath } from '../../trips/tripModel';
import { packageEndDate, packagePath, validateEnquiry } from '../packageModel';
import { apiConfig } from '../../../api/config';
import '../packages.css';
export default function PackageEnquiryPage() {
  const { id } = useParams(); const { data, loading, error, retry } = usePackages('get', id);
  if (loading) return <PageLoader />;
  if (error) return <ErrorState message={error} onRetry={retry} />;
  return <EnquiryForm item={data} key={id} />;
}
function EnquiryForm({ item }) {
  const user = useAuthStore(state => state.user);
  const navigate = useNavigate();
  const [requestError, setRequestError] = useState(null);
  const { register, watch, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({ defaultValues: { startDate: '', adults: 2, departureCity: user.homeCity || '', notes: '' } });
  const values = watch();
  const end = values.startDate && !validateEnquiry(values).startDate ? packageEndDate(values.startDate, item.days) : '';
  async function submit(input) {
    const found = validateEnquiry(input);
    if (Object.keys(found).length) { Object.entries(found).forEach(([key, message]) => setError(key, { message })); return; }
    setRequestError(null);
    try {
      const trip = await packageApi.enquire(item.id, input);
      useTripStore.setState({ loaded: false });
      useNotificationStore.getState().notify('Your package enquiry is saved. Follow the planner response in My trips.');
      navigate(tripPath(trip.id), { replace: true });
    } catch (error) { setRequestError(getErrorMessage(error)); Object.entries(error.response?.data?.fields || {}).forEach(([key, message]) => setError(key, { message })); }
  }
  return <div className="workspace-page"><Link className="back-link" to={packagePath(item.id)}><ArrowLeft size={16} /> Back to the package</Link><div className="workspace-page-heading"><div><p className="eyebrow">A CONVERSATION STARTS HERE</p><h1>Make it your journey.</h1><p>Enquire with {item.planner.businessName} about {item.title}.</p></div></div><div className="package-detail-grid"><form className="workspace-panel trip-form-fields" onSubmit={handleSubmit(submit)} noValidate aria-busy={isSubmitting}>{requestError && <Alert severity="error">{requestError}</Alert>}<fieldset className="trip-fields-container trip-form-fields" disabled={isSubmitting}><QuoteField name="startDate" label="Preferred start date" required type="date" register={register} errors={errors} slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: dateInput() } }} helperText={end ? `Your ${item.days}-day trip would end on ${formatDate(end)}.` : 'Availability is confirmed by the planner.'} /><QuoteField name="adults" label="Number of adults" required type="number" register={register} errors={errors} slotProps={{ htmlInput: { min: 2, max: 20 } }} helperText="Sample pricing uses two adults sharing. Mention children or a single room in your notes for a revised quote." /><QuoteField name="departureCity" label="Your departure city" required register={register} errors={errors} slotProps={{ htmlInput: { maxLength: 100 } }} helperText={`Package pickup is in ${item.pickupCity}. Travel to the pickup city is excluded.`} /><QuoteField name="notes" label="Preferences or questions (optional)" multiline minRows={4} register={register} errors={errors} slotProps={{ htmlInput: { maxLength: 1500 } }} /></fieldset><p className="panel-footnote">{apiConfig.useMock ? 'Demo enquiry: saved for this planner in this browser session. No real message, booking, or payment is sent.' : 'This is an enquiry only. Confirm availability, final pricing, and terms with the planner.'}</p><Button type="submit" disabled={isSubmitting}><Send size={16} />{isSubmitting ? 'Saving enquiry…' : 'Submit package enquiry'}</Button></form><aside className="package-enquiry-card"><p className="eyebrow">YOUR SELECTED PACKAGE</p><h2>{item.title}</h2><p>{item.days} days / {item.nights} nights · {item.planner.businessName}</p><hr /><span>Indicative total for {values.adults || 0} adults</span><strong className="package-detail-price">{formatMoney(item.price * (Number(values.adults) || 0))}</strong><p>{formatMoney(item.price)} per adult on twin sharing. Extra requirements may change the final quote.</p></aside></div></div>;
}

