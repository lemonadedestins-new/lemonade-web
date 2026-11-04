import { useState } from 'react';
import { Plus, Pencil, Archive, ArrowUpRight, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import { usePackages } from '../hooks/usePackages';
import { packageApi } from '../../../api/packageApi';
import { getErrorMessage } from '../../../api/errors';
import { ConfirmDialog, EmptyState, ErrorState, PageLoader } from '../../../components/common/Feedback';
import Button from '../../../components/common/Button';
import { destinationById, imageUrl } from '../../home/data/destinations';
import { formatMoney } from '../../trips/tripModel';
import { packageEditPath, packagePath } from '../packageModel';
import { useNotificationStore } from '../../../store/notificationStore';
import '../packages.css';
export default function ManagePackagesPage() {
  const { data, loading, error, retry } = usePackages('mine');
  const [status, setStatus] = useState('ALL');
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState(null);
  const visible = (data || []).filter(item => status === 'ALL' || item.status === status);
  async function archive() {
    setBusy(true); setActionError(null);
    try { await packageApi.save({ ...selected, status: 'ARCHIVED' }, selected.id); setSelected(null); useNotificationStore.getState().notify('Package archived. It is no longer in the public catalog.'); retry(); }
    catch (failure) { setActionError(getErrorMessage(failure)); setSelected(null); }
    finally { setBusy(false); }
  }
  return <div className="workspace-page"><div className="workspace-page-heading"><div><p className="eyebrow">YOUR EXPERTISE, READY TO EXPLORE</p><h1>Your package collection.</h1><p>Give travelers a clear starting point. Publish the journeys you already offer.</p></div><Button to="/partner/packages/new"><Plus size={17} /> Add a package</Button></div><div className="package-manager-note"><Package size={25} /><p>Published packages appear in destination searches with your business profile. Drafts and archived packages stay private. Enquiries arrive in <Link to="/partner/leads">Travel enquiries</Link>.</p></div><div className="trip-filters" role="group" aria-label="Filter package listings">{['ALL', 'PUBLISHED', 'DRAFT', 'ARCHIVED'].map(value => <button key={value} aria-pressed={status === value} className={status === value ? 'selected' : ''} onClick={() => setStatus(value)}>{value === 'ALL' ? 'All packages' : value.charAt(0) + value.slice(1).toLowerCase()}{data && ` (${value === 'ALL' ? data.length : data.filter(item => item.status === value).length})`}</button>)}</div>{actionError && <Alert severity="error" sx={{ my: 2 }}>{actionError}</Alert>}{loading ? <PageLoader /> : error ? <ErrorState message={error} onRetry={retry} /> : !visible.length ? <EmptyState title="Your next journey starts here." message="Add your first package or choose a different status filter."><Button to="/partner/packages/new">Create a package</Button></EmptyState> : <div className="managed-packages">{visible.map(item => { const place = destinationById(item.destinationId); return <article className="managed-package workspace-panel" key={item.id}><img src={imageUrl(place, 500)} alt={place.alt} loading="lazy" /><div><div className="package-meta"><span>{place.name}</span><span className={`package-status package-status-${item.status.toLowerCase()}`}>{item.status.toLowerCase()}</span></div><h2>{item.title}</h2><p>{item.days} days / {item.nights} nights · {formatMoney(item.price)} per adult</p><div className="managed-package-actions"><Link className="text-link" to={packageEditPath(item.id)}><Pencil size={15} /> Edit package</Link>{item.status === 'PUBLISHED' && <Link className="text-link" to={packagePath(item.id)}>View listing <ArrowUpRight size={15} /></Link>}{item.status !== 'ARCHIVED' && <button className="text-link" onClick={() => setSelected(item)} disabled={busy}><Archive size={15} /> Archive</button>}</div></div></article>; })}</div>}<ConfirmDialog open={!!selected} title="Archive this package?" message="It will leave the public catalog. Existing enquiries keep their original package details. You can edit and republish it later." confirmLabel="Archive package" onConfirm={archive} onClose={() => setSelected(null)} loading={busy} /></div>;
}

