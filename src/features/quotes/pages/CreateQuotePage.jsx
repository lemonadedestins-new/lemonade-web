import { useEffect, useRef, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Save, Send, MapPin, CalendarDays, Users } from 'lucide-react';
import Alert from '@mui/material/Alert';
import Button from '../../../components/common/Button';
import { ConfirmDialog, ErrorState, LoadingSpinner, PageLoader } from '../../../components/common/Feedback';
import { usePartnerResource } from '../../partner/hooks/usePartnerData';
import { usePartnerStore } from '../../partner/store/partnerStore';
import { useAuthStore } from '../../auth/store/authStore';
import { useNotificationStore } from '../../../store/notificationStore';
import { getErrorMessage } from '../../../api/errors';
import { apiConfig } from '../../../api/config';
import { DEFAULT_QUOTE, leadPath, quotePath } from '../../../constants/quotes';
import { ROUTES } from '../../../constants/routes';
import { dateInput, formatDate, formatMoney, travelerLabel } from '../../trips/tripModel';
import { normalizeQuote, quoteFormValues, validateQuote } from '../quoteModel';
import { PackageFields, ItineraryFields, QuoteDetailFields } from '../components/QuoteFormFields';
import ProposalDetails from '../components/ProposalDetails';

const steps = ['The package', 'The itinerary', 'The details', 'Review & send'];
const stepFor = key => key.startsWith('itinerary') || ['days', 'nights'].includes(key) ? 1 : ['inclusions', 'exclusions', 'validUntil', 'terms', 'notes'].includes(key) ? 2 : 0;
function defaults(lead, user) {
  if (lead.quote) return quoteFormValues(lead.quote);
  const days = Math.max(1, Math.min(30, Math.round((Date.parse(lead.endDate) - Date.parse(lead.startDate)) / 86400000) + 1));
  const expiry = new Date(); expiry.setDate(expiry.getDate() + (user.partnerSettings?.validityDays || 7));
  return quoteFormValues({ ...DEFAULT_QUOTE, days, nights: days - 1, terms: user.partnerSettings?.defaultTerms || '', validUntil: dateInput(expiry) < lead.startDate ? dateInput(expiry) : lead.startDate, itinerary: Array.from({ length: days }, (_, index) => ({ day: index + 1, title: '', description: '' })) });
}
export default function CreateQuotePage() {
  const { leadId } = useParams();
  const { data: lead, loading, error, retry } = usePartnerResource('lead', leadId);
  if (loading) return <PageLoader />;
  if (error) return <ErrorState message={error} onRetry={retry} />;
  if (!lead.canQuote) return <div className="workspace-panel"><h1>This enquiry already has its next step.</h1><p className="section-description">A submitted quote cannot be edited, and closed enquiries don’t accept new proposals.</p><div className="proposal-page-actions"><Button to={lead.quote ? quotePath(lead.quote.id) : leadPath(lead.id)}>View {lead.quote ? 'proposal' : 'enquiry'}</Button></div></div>;
  return <QuoteForm key={lead.id} lead={lead} />;
}
function QuoteForm({ lead }) {
  const user = useAuthStore(state => state.user);
  const saved = usePartnerStore.getState().formDrafts[lead.id];
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [requestError, setRequestError] = useState(null);
  const heading = useRef(null);
  const finished = useRef(false);
  const navigate = useNavigate();
  const { register, control, watch, setValue, getValues, clearErrors, setError, formState: { errors } } = useForm({ defaultValues: saved || defaults(lead, user), shouldUnregister: false });
  const { fields, append, remove } = useFieldArray({ control, name: 'itinerary' });
  const values = watch();
  useEffect(() => {
    const subscription = watch(value => { if (!finished.current) usePartnerStore.getState().rememberDraft(lead.id, value); });
    return () => subscription.unsubscribe();
  }, [watch, lead.id]);
  function goTo(index) { setStep(index); setRequestError(null); requestAnimationFrame(() => { heading.current?.focus(); heading.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }); }
  function showErrors(found) {
    clearErrors();
    Object.entries(found).forEach(([key, message]) => setError(key, { type: 'validate', message }));
    const first = Object.keys(found)[0];
    if (first) { setStep(stepFor(first)); requestAnimationFrame(() => document.getElementById(`quote-${first}`)?.focus()); }
    return !first;
  }
  function next() {
    const all = validateQuote(getValues(), { tripStart: lead.startDate });
    const found = Object.fromEntries(Object.entries(all).filter(([key]) => stepFor(key) === step));
    if (showErrors(found)) goTo(step + 1);
  }
  function changeDay(index) {
    const count = index == null ? fields.length + 1 : fields.length - 1;
    if (index == null) append({ day: count, title: '', description: '' }, { shouldFocus: false }); else remove(index);
    setValue('days', count); setValue('nights', count - 1);
  }
  async function save(draft) {
    const payload = normalizeQuote(getValues());
    if (!showErrors(validateQuote(payload, { draft, tripStart: lead.startDate }))) { setConfirming(false); return; }
    setBusy(true); setRequestError(null);
    try {
      const quote = await usePartnerStore.getState().saveQuote(lead.id, { ...payload, status: draft ? 'DRAFT' : 'SUBMITTED' }, lead.quote?.id);
      finished.current = true;
      usePartnerStore.getState().clearDraft(lead.id);
      useNotificationStore.getState().notify(draft ? 'Your quote draft is saved. Pick up where you left off.' : 'Your proposal is now available in the traveler’s trip.');
      navigate(draft ? ROUTES.QUOTES : quotePath(quote.id), { replace: true });
    } catch (error) { setRequestError(getErrorMessage(error)); if (error.response?.data?.fields) showErrors(error.response.data.fields); }
    finally { setBusy(false); setConfirming(false); }
  }
  function submit(event) {
    event.preventDefault(); if (busy) return;
    if (step < 3) next();
    else if (showErrors(validateQuote(getValues(), { tripStart: lead.startDate }))) setConfirming(true);
  }
  return <div className="workspace-page quote-builder fade-in"><Link to={leadPath(lead.id)} className="back-link"><ArrowLeft size={16} /> Back to the travel brief</Link><div className="workspace-page-heading"><div><p className="eyebrow">YOUR EXPERTISE, BEAUTIFULLY PRESENTED</p><h1>{lead.quote ? 'Finish your proposal.' : 'Create something worth the journey.'}</h1><p>A personal plan for {lead.destination}. Clear details, from the first day to the last.</p></div></div><ol className="trip-stepper quote-stepper" aria-label="Quote progress">{steps.map((label, index) => <li key={label} className={index <= step ? 'active' : ''} aria-current={index === step ? 'step' : undefined}><button type="button" onClick={() => goTo(index)} disabled={index > step || busy}><span>{index < step ? <Check size={16} /> : `0${index + 1}`}</span><div><strong>{label}</strong><small>{index === step ? 'You are here' : index < step ? 'Ready to go' : 'Up next'}</small></div></button></li>)}</ol>
    <div className="trip-request-grid"><form className="workspace-panel trip-form" onSubmit={submit} noValidate aria-busy={busy}><div className="trip-form-heading"><span className="small-label">STEP 0{step + 1} OF 04</span><h2 ref={heading} tabIndex={-1}>{steps[step]}</h2><p>{['Give the traveler a clear picture of the experience.', 'Build a thoughtful rhythm, one day at a time.', 'Clarity today makes for a smoother journey tomorrow.', 'This is how your proposal will read. Check every detail before sending.'][step]}</p></div>{requestError && <Alert severity="error" sx={{ mb: 3 }}>{requestError}</Alert>}<fieldset className="trip-fields-container" disabled={busy}>{step === 0 && <PackageFields register={register} errors={errors} />}{step === 1 && <ItineraryFields register={register} errors={errors} fields={fields} addDay={() => changeDay()} removeDay={changeDay} busy={busy} />}{step === 2 && <QuoteDetailFields register={register} errors={errors} tripStart={lead.startDate} />}{step === 3 && <><div className="proposal-review-heading"><p className="eyebrow">{user.businessName || user.name}</p><h3>{values.title}</h3></div><ProposalDetails quote={normalizeQuote(values)} /><p className="review-disclosure">{apiConfig.useMock ? 'This demo proposal will appear in the traveler’s trip within this browser session. No email, booking, or payment is created.' : 'Sending makes this proposal available to the traveler. Submitted quotes cannot be edited; review your prices, dates, and terms carefully.'}</p></>}</fieldset><div className="trip-form-actions">{step ? <Button variant="outline" disabled={busy} onClick={() => goTo(step - 1)}><ArrowLeft size={16} /> Back</Button> : <span className="required-hint">* Required fields</span>}<Button type="submit" disabled={busy}>{busy ? <LoadingSpinner size={17} /> : step === 3 ? <Send size={16} /> : null}{step === 3 ? 'Send proposal' : 'Continue'}{step < 3 && <ArrowRight size={16} />}</Button></div></form>
      <aside className="trip-form-aside"><div className="quote-brief"><p className="eyebrow">THE TRAVELER’S WISH LIST</p><h3>{lead.destination}</h3><p><MapPin size={15} />From {lead.departureCity}</p><p><CalendarDays size={15} />{formatDate(lead.startDate)} – {formatDate(lead.endDate, { year: undefined })}</p><p><Users size={15} />{travelerLabel(lead)} · {lead.tripType}</p><div><span>Total budget</span><strong>{formatMoney(lead.budget)}</strong></div><p className="quote-brief-note">{lead.specialRequirements || lead.notes || 'A trip that feels personal.'}</p></div><div className="draft-panel"><Save size={21} /><h3>Good ideas take shape.</h3><p>Save a private draft and come back to the details. A package title is enough to begin.</p><Button variant="outline" disabled={busy} onClick={() => save(true)}>Save draft & exit</Button><small>{apiConfig.useMock ? 'Demo drafts reset on reload. Only sent proposals appear for the traveler.' : 'Save before closing this page. Unfinished edits are kept only in memory.'}</small></div></aside>
    </div><ConfirmDialog open={confirming} title="Ready to share this journey?" message="The traveler will be able to view your proposal. Check that the total price, itinerary, and terms are final; sent proposals cannot be edited." confirmLabel="Send proposal" onConfirm={() => save(false)} onClose={() => setConfirming(false)} loading={busy} />
  </div>;
}
