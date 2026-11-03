import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, CalendarDays, Lightbulb } from 'lucide-react';
import Alert from '@mui/material/Alert';
import Button from '../../../components/common/Button';
import { ErrorState, PageLoader } from '../../../components/common/Feedback';
import { TripImage, TripSummary } from '../../trips/components/TripComponents';
import { PartnerStatus, QuoteSummaryCard } from '../components/PartnerComponents';
import { usePartnerResource } from '../hooks/usePartnerData';
import { createQuotePath } from '../../../constants/quotes';
import { ROUTES } from '../../../constants/routes';
import { formatDate } from '../../trips/tripModel';

export default function LeadDetailsPage() {
  const { id } = useParams();
  const { data: lead, loading, error, retry } = usePartnerResource('lead', id);
  if (loading) return <PageLoader />;
  if (error) return <ErrorState message={error} onRetry={retry} />;
  return <div className="workspace-page fade-in"><Link to={ROUTES.LEADS} className="back-link"><ArrowLeft size={16} /> All travel enquiries</Link><section className="trip-detail-hero"><TripImage destination={lead.destination} /><div><PartnerStatus status={lead.status} /><h1>{lead.destination}<span className="welcome-dot">.</span></h1><p>{lead.tripType} · From {lead.departureCity}</p></div>{lead.canQuote && <Button to={createQuotePath(id)} variant="light">{lead.quote ? 'Continue quote' : 'Create a quote'}<ArrowUpRight size={17} /></Button>}</section><div className="trip-status-note"><div><strong>A journey shaped around the traveler.</strong><p>Use these details to build a proposal that feels personal.</p></div><span><CalendarDays size={15} />Received {formatDate(lead.createdAt)}</span></div>{lead.status === 'CLOSED' && <Alert severity="info" sx={{ mb: 3 }}>This enquiry is closed or its travel dates have passed. New proposals can no longer be submitted.</Alert>}
    <div className="trip-detail-columns"><section className="workspace-panel"><div className="workspace-section-heading"><h2>The traveler’s brief</h2></div><TripSummary trip={lead} /></section><aside className="lead-detail-aside">{lead.quote ? <QuoteSummaryCard quote={lead.quote} /> : <div className="planning-note"><Lightbulb size={30} strokeWidth={1.4} /><p className="eyebrow">MAKE IT PERSONAL</p><h3>Start with the little things.</h3><p>Reflect the traveler’s interests, explain what’s included, and leave room for their own kind of adventure.</p>{lead.canQuote && <Button to={createQuotePath(id)} className="button-full">Create a quote <ArrowUpRight size={16} /></Button>}</div>}<p className="panel-footnote">Only your own proposals are shown. Traveler contact details and other planners’ pricing are kept private.</p></aside></div>
  </div>;
}
