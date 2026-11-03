import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import Alert from '@mui/material/Alert';
import Button from '../../../components/common/Button';
import { ConfirmDialog, ErrorState, PageLoader } from '../../../components/common/Feedback';
import { usePartnerResource } from '../../partner/hooks/usePartnerData';
import { usePartnerStore } from '../../partner/store/partnerStore';
import { PartnerStatus } from '../../partner/components/PartnerComponents';
import { useNotificationStore } from '../../../store/notificationStore';
import { getErrorMessage } from '../../../api/errors';
import { ROUTES } from '../../../constants/routes';
import { leadPath, createQuotePath } from '../../../constants/quotes';
import ProposalDetails from '../components/ProposalDetails';

export default function QuoteDetailsPage() {
  const { id } = useParams();
  const { data: quote, loading, error, retry } = usePartnerResource('quote', id);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState(null);
  async function withdraw() {
    setBusy(true); setActionError(null);
    try { await usePartnerStore.getState().withdrawQuote(id); setConfirming(false); useNotificationStore.getState().notify('The proposal has been withdrawn from the traveler’s trip.'); retry(); }
    catch (failure) { setConfirming(false); setActionError(getErrorMessage(failure)); }
    finally { setBusy(false); }
  }
  if (loading) return <PageLoader />;
  if (error) return <ErrorState message={error} onRetry={retry} />;
  if (quote.status === 'DRAFT' && quote.canEdit !== false) return <Navigate to={createQuotePath(quote.leadId)} replace />;
  return (
    <div className="workspace-page fade-in">
      <Link className="back-link" to={ROUTES.QUOTES}><ArrowLeft size={16} /> All quotes</Link>
      <div className="workspace-page-heading">
        <div>
          <p className="eyebrow">{quote.destination} · YOUR PROPOSAL</p>
          <h1>{quote.title}</h1>
          <p>Prepared by {quote.plannerName}</p>
        </div>
        <PartnerStatus quote status={quote.status} />
      </div>
      {quote.status === 'DRAFT' && <Alert severity="info" sx={{ mb: 3 }}>This draft remains private. Its enquiry is closed, so it can no longer be edited or sent.</Alert>}
      {actionError && <Alert severity="error" sx={{ mb: 3 }}>{actionError}</Alert>}
      {quote.status === 'ACCEPTED' && <Alert severity="success" sx={{ mb: 3 }}>The traveler has selected this proposal. A planner selection does not confirm a booking or payment.</Alert>}
      {quote.status === 'WITHDRAWN' && <Alert severity="info" sx={{ mb: 3 }}>This proposal is no longer visible in the traveler’s quote list. It remains here for your records.</Alert>}
      <section className="workspace-panel proposal-page"><ProposalDetails quote={quote} sample={quote.isSample} /></section>
      <div className="proposal-page-actions">
        <Button to={leadPath(quote.leadId)} variant="outline">View travel brief <ArrowUpRight size={16} /></Button>
        {['SUBMITTED', 'EXPIRED'].includes(quote.status) && <Button variant="outline" onClick={() => setConfirming(true)}>Withdraw proposal</Button>}
      </div>
      <ConfirmDialog open={confirming} title="Withdraw this proposal?" message="This removes the proposal from the traveler’s available quotes. It remains in your records and cannot be resubmitted." confirmLabel="Withdraw proposal" onConfirm={withdraw} onClose={() => setConfirming(false)} loading={busy} />
    </div>
  );
}
