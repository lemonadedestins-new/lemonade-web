import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, FilePenLine, MapPin, MessageSquareText } from 'lucide-react';
import Alert from '@mui/material/Alert';
import Button from '../../../components/common/Button';
import { EmptyState, ErrorState, PageLoader } from '../../../components/common/Feedback';
import { ROUTES } from '../../../constants/routes';
import { STATUS_META, TRIP_STATUS } from '../../../constants/trips';
import { useTrip } from '../hooks/useTrip';
import { ActivityTimeline, TripImage, TripStatus, TripSummary } from '../components/TripComponents';
import { formatDate, tripPath } from '../tripModel';
import QuoteCard from '../../quotes/components/QuoteCard';
import { apiConfig } from '../../../api/config';

export default function TripDetailsPage() {
  const { id } = useParams();
  const { trip, loading, error, notFound, retry } = useTrip(id);
  if (loading) return <PageLoader />;
  if (error) return <><Link to={ROUTES.TRIPS} className="back-link"><ArrowLeft size={16} /> Back to my trips</Link><ErrorState title={notFound ? 'This trip isn’t on your map.' : 'We hit a small detour.'} message={error} onRetry={notFound ? undefined : retry} /></>;
  if (!trip) return null;
  const draft = trip.status === TRIP_STATUS.DRAFT;
  return <div className="workspace-page fade-in"><Link to={ROUTES.TRIPS} className="back-link"><ArrowLeft size={16} /> Back to my trips</Link>
    <section className="trip-detail-hero"><TripImage destination={trip.destination} /><div><TripStatus status={trip.status} /><h1>{trip.destination}<span className="welcome-dot">.</span></h1><p><MapPin size={16} />{trip.departureCity ? `From ${trip.departureCity}` : 'Departure city to be decided'}<span>·</span>{trip.tripType || 'Your next adventure'}</p></div>{draft && <Button to={`${tripPath(id)}/edit`} variant="light"><FilePenLine size={17} /> Continue planning</Button>}</section>
    <div className="trip-status-note"><div><strong>{STATUS_META[trip.status]?.label}</strong><p>{STATUS_META[trip.status]?.description}</p></div><span><CalendarDays size={15} />Created {formatDate(trip.createdAt)}</span></div>
    {apiConfig.useMock && <Alert severity="info" className="trip-demo-alert">{trip.isSample ? 'This is a sample trip with illustrative proposals. Explore the details or create a request of your own.' : 'Your request is saved in this demo session. No planners are contacted; it will reset on reload.'}</Alert>}
    <div className="trip-detail-columns"><section className="workspace-panel"><div className="workspace-section-heading"><h2>Your travel brief</h2>{draft && <Link to={`${tripPath(id)}/edit`} className="text-link">Edit <FilePenLine size={15} /></Link>}</div><TripSummary trip={trip} /></section><aside className="workspace-panel"><div className="workspace-section-heading"><h2>The journey so far</h2></div><ActivityTimeline events={[...trip.timeline].reverse()} /></aside></div>
    <section className="trip-quotes"><div className="workspace-section-heading"><div><p className="eyebrow">POSSIBILITIES, PERSONALIZED</p><h2>Ideas from your planners</h2><p>Different perspectives. One trip that feels right for you.</p></div><span className="proposal-count"><MessageSquareText size={17} />{trip.quotes.length} {trip.quotes.length === 1 ? 'proposal' : 'proposals'}</span></div>{trip.quotes.length ? <div className="quote-grid">{trip.quotes.map(quote => <QuoteCard key={quote.id} quote={quote} selected={trip.selectedQuoteId === quote.id} sample={trip.isSample} />)}</div> : <div className="workspace-panel"><EmptyState title={draft ? 'First, bring your idea to life.' : 'Good ideas take a little time.'} message={draft ? 'Finish and submit your trip request to begin the planner matching process.' : apiConfig.useMock ? 'New demo requests don’t generate proposals automatically. Open the sample Kashmir trip to explore planner quotations.' : 'Planner proposals will appear here when they’re ready. You can follow progress in your timeline.'}>{draft && <Button to={`${tripPath(id)}/edit`}>Continue your draft</Button>}</EmptyState></div>}</section>
  </div>;
}
