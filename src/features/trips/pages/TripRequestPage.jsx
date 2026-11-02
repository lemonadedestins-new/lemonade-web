import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, CheckCheck, Compass, Save, ShieldCheck } from 'lucide-react';
import Alert from '@mui/material/Alert';
import Button from '../../../components/common/Button';
import { ErrorState, LoadingSpinner, PageLoader } from '../../../components/common/Feedback';
import { useTrip } from '../hooks/useTrip';
import { useTripStore } from '../store/tripStore';
import { useNotificationStore } from '../../../store/notificationStore';
import { DEFAULT_TRIP, FORM_STEPS, TRIP_STATUS } from '../../../constants/trips';
import { ROUTES } from '../../../constants/routes';
import { apiConfig } from '../../../api/config';
import { getErrorMessage } from '../../../api/errors';
import { formatMoney, normalizeTrip, tripPath, validateTrip } from '../tripModel';
import { TripSummary } from '../components/TripComponents';
import { EssentialsFields, PreferencesFields } from '../components/TripFormFields';
import { useAuthStore } from '../../auth/store/authStore';

export default function TripRequestPage() {
  const { id } = useParams();
  const result = useTrip(id);
  if (result.loading) return <PageLoader />;
  if (result.error) return <ErrorState title="This draft took a detour." message={result.error} onRetry={result.notFound ? undefined : result.retry} />;
  if (result.trip && result.trip.status !== TRIP_STATUS.DRAFT) return <div className="workspace-panel"><h1>This trip is already submitted.</h1><p className="section-description">You can follow its progress from the trip details page.</p><Button to={tripPath(id)}>View trip</Button></div>;
  return <TripRequestForm key={id || 'new'} trip={result.trip} />;
}
function TripRequestForm({ trip }) {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const draftKey = trip?.id || 'new';
  const savedValues = useTripStore.getState().formDrafts[draftKey];
  const user = useAuthStore(state => state.user);
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [requestError, setRequestError] = useState(null);
  const finished = useRef(false);
  const heading = useRef(null);
  const { register, control, watch, getValues, setError, clearErrors, formState: { errors } } = useForm({ defaultValues: savedValues || normalizeTrip(trip || { ...DEFAULT_TRIP, ...user?.preferences, departureCity: user?.homeCity || '', destination: (params.get('destination') || '').slice(0, 100) }), shouldUnregister: false });
  const values = watch();
  useEffect(() => {
    const subscription = watch(value => { if (!finished.current) useTripStore.getState().rememberDraft(draftKey, value); });
    return () => subscription.unsubscribe();
  }, [watch, draftKey]);
  function goToStep(index) { setStep(index); setRequestError(null); requestAnimationFrame(() => { heading.current?.focus(); heading.current?.scrollIntoView({ block: 'start', behavior: 'smooth' }); }); }
  function showErrors(found) {
    clearErrors();
    Object.entries(found).forEach(([key, message]) => setError(key, { type: 'validate', message }));
    const first = Object.keys(found)[0];
    if (first) {
      const index = FORM_STEPS.findIndex(item => item.fields.includes(first));
      if (index >= 0) setStep(index);
      requestAnimationFrame(() => document.getElementById(`trip-${first}`)?.focus());
    }
    return !first;
  }
  function next() {
    const found = validateTrip(getValues());
    const relevant = Object.fromEntries(Object.entries(found).filter(([key]) => FORM_STEPS[step].fields.includes(key)));
    if (showErrors(relevant)) goToStep(step + 1);
  }
  async function save(draft) {
    const payload = normalizeTrip(getValues());
    if (!showErrors(validateTrip(payload, { draft }))) return;
    setBusy(true); setRequestError(null);
    try {
      const result = await useTripStore.getState().saveTrip({ ...payload, status: draft ? TRIP_STATUS.DRAFT : TRIP_STATUS.SUBMITTED }, trip?.id);
      finished.current = true;
      useTripStore.getState().clearDraft(draftKey);
      useNotificationStore.getState().notify(draft ? 'Your draft is saved. Come back when inspiration strikes.' : 'Your trip request is submitted. A new journey starts here.');
      navigate(tripPath(result.id), { replace: true });
    } catch (error) {
      setRequestError(getErrorMessage(error));
      if (error.response?.data?.fields) showErrors(error.response.data.fields);
    } finally { setBusy(false); }
  }
  return <div className="workspace-page trip-request-page fade-in">
    <Link to={ROUTES.TRIPS} className="back-link"><ArrowLeft size={16} /> Back to my trips</Link>
    <div className="workspace-page-heading"><div><p className="eyebrow">A GOOD JOURNEY STARTS WITH YOU</p><h1>Let’s plan something wonderful.</h1><p>A few thoughtful details. A trip that’s entirely yours.</p></div></div>
    <ol className="trip-stepper" aria-label="Trip request progress">{FORM_STEPS.map((item, index) => <li key={item.title} className={index <= step ? 'active' : ''} aria-current={index === step ? 'step' : undefined}><button type="button" disabled={index > step || busy} onClick={() => goToStep(index)}><span>{index < step ? <Check size={17} /> : `0${index + 1}`}</span><div><strong>{item.title}</strong><small>{index === step ? 'You are here' : index < step ? 'Ready to go' : 'Up next'}</small></div></button></li>)}</ol>
    <div className="trip-request-grid"><form className="workspace-panel trip-form" noValidate aria-busy={busy} onSubmit={event => { event.preventDefault(); if (!busy) { if (step < 2) next(); else void save(false); } }}>
      <div className="trip-form-heading"><span className="small-label">STEP 0{step + 1} OF 03</span><h2 ref={heading} tabIndex={-1}>{FORM_STEPS[step].title}</h2><p>{FORM_STEPS[step].description}</p></div>
      {requestError && <Alert severity="error" sx={{ mb: 3 }}>{requestError}</Alert>}
      <fieldset disabled={busy} className="trip-fields-container">
        {step === 0 && <EssentialsFields register={register} errors={errors} startDate={values.startDate} />}
        {step === 1 && <PreferencesFields register={register} control={control} errors={errors} />}
        {step === 2 && <><div className="review-ready"><CheckCheck size={23} /><div><strong>Looks like the beginning of a great trip.</strong><p>Check your details below. You can go back to change anything.</p></div></div><TripSummary trip={normalizeTrip(values)} /><p className="review-disclosure">{apiConfig.useMock ? 'This demo saves your request in this browser session. No planners are contacted and no booking is made.' : 'Submitting sends your travel preferences to Lemonade for planner matching. This is an enquiry, with no booking or payment commitment.'}</p></>}
      </fieldset>
      <div className="trip-form-actions">{step > 0 ? <Button variant="outline" onClick={() => goToStep(step - 1)} disabled={busy}><ArrowLeft size={16} /> Back</Button> : <span className="required-hint">* Required fields</span>}<Button type="submit" disabled={busy}>{busy ? <><LoadingSpinner size={17} /> Saving…</> : step === 2 ? <>Submit trip request <ArrowRight size={17} /></> : <>Continue <ArrowRight size={17} /></>}</Button></div>
    </form><aside className="trip-form-aside"><div className="planning-note"><Compass size={34} strokeWidth={1.3} /><p className="eyebrow">YOUR TRIP, YOUR PACE</p><h3>A little detail goes a long way.</h3><p>The more we know about your kind of adventure, the better a planner can make it yours.</p><ul><li><Check size={16} /> Thoughtful, personalized proposals</li><li><Check size={16} /> Travel experts who know the place</li><li><Check size={16} /> Room for your own kind of magic</li></ul></div>
      <div className="draft-panel"><Save size={20} /><h3>Still dreaming?</h3><p>Save a draft and pick up where you left off. A destination is all you need to start.</p><Button variant="outline" onClick={() => save(true)} disabled={busy}>Save draft & exit</Button><small>{apiConfig.useMock ? 'Demo drafts and unfinished edits last until this page is reloaded.' : 'Unfinished edits stay in memory. Save a draft before closing this page.'}</small></div>
      {values.budget && <p className="form-budget"><span>Your approximate budget</span><strong>{formatMoney(Number(values.budget))}</strong><span>for the whole travel party</span></p>}
      <p className="form-reassurance"><ShieldCheck size={16} /> Just a request. No payment required.</p>
    </aside></div>
  </div>;
}
