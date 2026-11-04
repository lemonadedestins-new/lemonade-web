import { ArrowUpRight, CalendarDays, MapPin, MessageSquareText, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import Skeleton from '@mui/material/Skeleton';
import { STATUS_META, TRIP_STATUS } from '../../../constants/trips';
import { destinations, imageUrl, HERO_IMAGE } from '../../home/data/destinations';
import { formatDate, formatMoney, travelerLabel, tripPath } from '../tripModel';

export function TripStatus({ status }) {
  const meta = STATUS_META[status] || { label: status, tone: 'neutral' };
  return <span className={`trip-status status-${meta.tone}`}><span />{meta.label}</span>;
}
export function TripImage({ destination, ...props }) {
  const place = destinations.find(item => item.name.toLowerCase() === destination?.toLowerCase());
  return <img src={place ? imageUrl(place, 800) : HERO_IMAGE} alt="" loading="lazy" {...props} />;
}
export function TripCard({ trip }) {
  const draft = trip.status === TRIP_STATUS.DRAFT;
  return <article className="trip-card">
    <div className="trip-card-photo"><TripImage destination={trip.destination} /><TripStatus status={trip.status} /></div>
    <div className="trip-card-body"><p className="trip-card-type">{trip.tripType || 'Your next adventure'}{trip.isSample && ' · Sample'}</p><h3><Link to={tripPath(trip.id)}>{trip.destination}</Link></h3>
      <div className="trip-card-meta"><span><CalendarDays size={15} />{trip.startDate ? `${formatDate(trip.startDate, { year: undefined })} – ${formatDate(trip.endDate)}` : 'Dates to dream about'}</span><span><Users size={15} />{travelerLabel(trip)}<i />{formatMoney(trip.budget)}</span></div>
      <div className="trip-card-footer"><span><MessageSquareText size={15} />{trip.quotes?.length ? `${trip.quotes.length} planner ${trip.quotes.length === 1 ? 'proposal' : 'proposals'}` : draft ? 'Ready when you are' : 'Awaiting proposals'}</span><Link to={`${tripPath(trip.id)}${draft ? '/edit' : ''}`} className="trip-card-link" aria-label={`${draft ? 'Continue planning' : 'View trip'} to ${trip.destination}`}><span>{draft ? 'Continue' : 'View trip'}</span><ArrowUpRight size={18} /></Link></div>
    </div>
  </article>;
}
export function TripSummary({ trip }) {
  const rows = [
    ['Destination', trip.destination], ['Leaving from', trip.departureCity],
    ['Travel dates', trip.startDate ? `${formatDate(trip.startDate)} – ${formatDate(trip.endDate)}` : 'Not set yet'],
    ['Travelers', `${trip.adults || 0} adults · ${trip.children || 0} children`],
    ['Total budget', `${formatMoney(trip.budget)}${trip.budget ? ' · INR, for everyone' : ''}`],
    ['Trip type', trip.tripType], ['Accommodation', trip.accommodation], ['Transportation', trip.transportation],
  ];
  return <div className="trip-summary">{trip.packageSelection && <div className="package-selection"><span className="small-label">PACKAGE ENQUIRY</span><strong>{trip.packageSelection.title}</strong><p>{trip.packageSelection.plannerName} · {formatMoney(trip.packageSelection.pricePerPerson)} per adult at enquiry · pickup: {trip.packageSelection.pickupCity}</p><p>Dates and the final price are subject to planner confirmation.</p></div>}<dl className="trip-facts">{rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || 'Not set yet'}</dd></div>)}</dl>
    <div className="summary-note"><h4>Things you love</h4>{trip.interests?.length ? <div className="interest-tags">{trip.interests.map(interest => <span key={interest}>{interest}</span>)}</div> : <p>Open to inspiration</p>}</div>
    {trip.specialRequirements && <div className="summary-note"><h4>Special requirements</h4><p>{trip.specialRequirements}</p></div>}
    {trip.notes && <div className="summary-note"><h4>A little more about your trip</h4><p>{trip.notes}</p></div>}
  </div>;
}
export function ActivityTimeline({ events }) {
  return <ol className="activity-list">{events.map(event => <li key={event.id}><span className="activity-dot" /><div><strong>{event.title}</strong><p>{event.detail}</p><time dateTime={event.at}>{formatDate(event.at)}</time>{event.destination && <Link to={tripPath(event.tripId)}><MapPin size={12} />{event.destination}</Link>}</div></li>)}</ol>;
}
export function TripLoading({ cards = 3 }) {
  return <div role="status" aria-label="Loading your trips" className="trip-grid">{Array.from({ length: cards }, (_, index) => <div className="trip-card" key={index}><Skeleton variant="rectangular" height={160} /><div className="trip-card-body"><Skeleton width="35%" /><Skeleton height={40} width="70%" /><Skeleton /><Skeleton /><Skeleton height={45} /></div></div>)}</div>;
}
