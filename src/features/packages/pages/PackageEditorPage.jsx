import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save, Send } from 'lucide-react';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import { destinations } from '../../home/data/destinations';
import { EMPTY_PACKAGE, normalizePackage, validatePackage } from '../packageModel';
import { usePackages } from '../hooks/usePackages';
import { QuoteField } from '../../quotes/components/QuoteFormFields';
import { packageApi } from '../../../api/packageApi';
import { getErrorMessage } from '../../../api/errors';
import { ConfirmDialog, ErrorState, PageLoader } from '../../../components/common/Feedback';
import Button from '../../../components/common/Button';
import { useNotificationStore } from '../../../store/notificationStore';
import '../packages.css';
export default function PackageEditorPage() {
  const { id } = useParams();
  return id ? <ExistingPackage id={id} /> : <PackageForm key="new" />;
}
function ExistingPackage({ id }) {
  const { data, loading, error, retry } = usePackages('owned', id);
  if (loading) return <PageLoader />;
  if (error) return <ErrorState message={error} onRetry={retry} />;
  return <PackageForm key={id} item={data} />;
}
function PackageForm({ item }) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [requestError, setRequestError] = useState(null);
  const initial = item ? { ...item, inclusions: item.inclusions.join('\n'), exclusions: item.exclusions.join('\n') } : EMPTY_PACKAGE;
  const { register, control, getValues, watch, setValue, setError, clearErrors, formState: { errors } } = useForm({ defaultValues: initial });
  const { fields, append, remove } = useFieldArray({ control, name: 'itinerary' });
  const shared = { register, errors };
  const values = watch();
  function validate(status) {
    clearErrors();
    const found = validatePackage(getValues(), { draft: status !== 'PUBLISHED' });
    Object.entries(found).forEach(([name, message]) => setError(name, { message }));
    const first = Object.keys(found)[0];
    if (first) requestAnimationFrame(() => document.getElementById(`quote-${first}`)?.focus());
    return !first;
  }
  async function save(status) {
    if (!validate(status)) { setConfirming(false); return; }
    setBusy(true); setRequestError(null);
    try { await packageApi.save({ ...normalizePackage(getValues()), status }, item?.id); useNotificationStore.getState().notify(status === 'PUBLISHED' ? 'Your package is now in the destination catalog.' : 'Your package draft is saved.'); navigate('/partner/packages'); }
    catch (error) { setRequestError(getErrorMessage(error)); Object.entries(error.response?.data?.fields || {}).forEach(([name, message]) => setError(name, { message })); }
    finally { setBusy(false); setConfirming(false); }
  }
  function changeDays(index) {
    const count = index == null ? fields.length + 1 : fields.length - 1;
    if (index == null) append({ title: '', description: '' }); else remove(index);
    setValue('days', count);
  }
  return <div className="workspace-page"><Link className="back-link" to="/partner/packages"><ArrowLeft size={16} /> Your packages</Link><div className="workspace-page-heading"><div><p className="eyebrow">A JOURNEY WORTH SHARING</p><h1>{item ? 'Shape your package.' : 'Add your next great escape.'}</h1><p>South Indian destinations only. Every published package shows your business profile.</p></div></div><form className="workspace-panel package-editor" onSubmit={e => { e.preventDefault(); if (!busy && validate('PUBLISHED')) setConfirming(true); }} noValidate aria-busy={busy}>{requestError && <Alert severity="error">{requestError}</Alert>}<fieldset className="trip-fields-container trip-form-fields" disabled={busy}>
    <h2>The essentials</h2><QuoteField {...shared} name="title" label="Package title" required slotProps={{ htmlInput: { maxLength: 120 } }} /><label className="package-select-label" htmlFor="quote-destinationId">Destination<select id="quote-destinationId" {...register('destinationId')} aria-invalid={!!errors.destinationId}>{destinations.map(place => <option value={place.id} key={place.id}>{place.name}, {place.country}</option>)}</select>{errors.destinationId && <span className="field-error">{errors.destinationId.message}</span>}</label><QuoteField {...shared} name="summary" label="A short introduction" required multiline minRows={3} helperText="Help travelers see what makes this package special." slotProps={{ htmlInput: { maxLength: 1000 } }} /><div className="form-two-columns"><QuoteField {...shared} name="price" label="Starting price per adult (₹ INR)" required type="number" helperText="Based on 2 adults, twin sharing. Include applicable taxes." slotProps={{ htmlInput: { min: 500, max: 500000 } }} /><QuoteField {...shared} name="pickupCity" label="Pickup & return city" required slotProps={{ htmlInput: { maxLength: 100 } }} /></div>
    <h2>Stays, transfers & meals</h2><QuoteField {...shared} name="accommodation" label="Accommodation details" multiline minRows={2} required slotProps={{ htmlInput: { maxLength: 1000 } }} /><QuoteField {...shared} name="transportation" label="Transportation details" multiline minRows={2} required slotProps={{ htmlInput: { maxLength: 1000 } }} /><QuoteField {...shared} name="meals" label="Meals included" required slotProps={{ htmlInput: { maxLength: 500 } }} />
    <h2>A day-by-day plan</h2><p className="panel-footnote">{fields.length} days / {Math.max(fields.length - 1, 0)} nights. Add or remove days to set the package duration.</p>{errors.itinerary?.message && <p className="field-error" role="alert">{errors.itinerary.message}</p>}<div className="itinerary-editor">{fields.map((field, index) => <section className="itinerary-day" key={field.id}><div className="itinerary-day-heading"><span>DAY {index + 1}</span><IconButton aria-label={`Remove day ${index + 1}`} disabled={fields.length <= 1 || busy} onClick={() => changeDays(index)}><Trash2 size={17} /></IconButton></div><QuoteField {...shared} name={`itinerary.${index}.title`} label={`Day ${index + 1} title`} required slotProps={{ htmlInput: { maxLength: 120 } }} /><QuoteField {...shared} name={`itinerary.${index}.description`} label="What happens on this day?" required multiline minRows={3} slotProps={{ htmlInput: { maxLength: 2000 } }} /></section>)}</div><Button variant="outline" onClick={() => changeDays()} disabled={fields.length >= 30 || busy}><Plus size={16} /> Add a day</Button>
    <h2>Make the details clear</h2><div className="form-two-columns"><QuoteField {...shared} name="inclusions" label="Included" required multiline minRows={5} helperText="One item per line, up to 30." /><QuoteField {...shared} name="exclusions" label="Not included" required multiline minRows={5} helperText="One item per line. Write None if needed." /></div><QuoteField {...shared} name="terms" label="Pricing, availability & cancellation terms" required multiline minRows={4} slotProps={{ htmlInput: { maxLength: 3000 } }} helperText="Explain seasonal pricing, room sharing, extra costs, and cancellation conditions." />
    </fieldset><div className="package-editor-actions">{item?.status !== 'PUBLISHED' && <Button variant="outline" disabled={busy} onClick={() => save('DRAFT')}><Save size={16} /> Save draft</Button>}<Button type="submit" disabled={busy}><Send size={16} />{busy ? 'Saving…' : item?.status === 'PUBLISHED' ? 'Review & save changes' : 'Review & publish'}</Button></div><p className="panel-footnote">Unsaved edits are kept on this page only. Save a draft before leaving. Demo packages reset on reload.</p></form><ConfirmDialog open={confirming} title={item?.status === 'PUBLISHED' ? 'Update this published package?' : 'Publish this package?'} message={`“${values.title}” will be visible in the public catalog under your business name. Check the per-person price, itinerary, and inclusions before continuing. Existing enquiries retain their original details.`} confirmLabel={item?.status === 'PUBLISHED' ? 'Save changes' : 'Publish package'} onConfirm={() => save('PUBLISHED')} onClose={() => setConfirming(false)} loading={busy} /></div>;
}

