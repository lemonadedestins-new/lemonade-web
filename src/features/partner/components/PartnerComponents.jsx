import { Link } from 'react-router-dom';
import { ArrowUpRight, CalendarDays, MapPin, Users } from 'lucide-react';
import TextField from '@mui/material/TextField';
import { LEAD_META, QUOTE_META, leadPath, quotePath, createQuotePath } from '../../../constants/quotes';
import { formatDate, formatMoney, travelerLabel } from '../../trips/tripModel';
import { TripImage } from '../../trips/components/TripComponents';

export function PartnerStatus({ status, quote = false }) {
  const meta = (quote ? QUOTE_META : LEAD_META)[status] || { label: status, tone: 'neutral' };
  return <span className={`trip-status status-${meta.tone}`}><span />{meta.label}</span>;
}
export function LeadCard({ lead }) {
  return <article className="lead-card"><div className="lead-card-photo"><TripImage destination={lead.destination} /><PartnerStatus status={lead.status} /></div><div className="lead-card-body"><div className="lead-card-heading"><div><p className="small-label">{lead.tripType}{lead.isSample && ' · SAMPLE ENQUIRY'}</p><h3><Link to={leadPath(lead.id)}>{lead.destination}</Link></h3></div><div className="lead-budget"><strong>{formatMoney(lead.budget)}</strong><span>Total budget · INR</span></div></div><div className="lead-facts"><span><MapPin size={15} />From {lead.departureCity}</span><span><Users size={15} />{travelerLabel(lead)}</span><span><CalendarDays size={15} />{formatDate(lead.startDate)} – {formatDate(lead.endDate, { year: undefined })}</span></div><p className="lead-excerpt">{lead.notes || lead.specialRequirements || 'A personalized journey, shaped around the traveler.'}</p><div className="lead-card-footer"><span>Received {formatDate(lead.createdAt)}</span><Link to={leadPath(lead.id)} className="text-link">View enquiry <ArrowUpRight size={16} /></Link></div></div></article>;
}
export function QuoteSummaryCard({ quote }) {
  const draft = quote.status === 'DRAFT';
  const editable = draft && quote.canEdit !== false;
  return <article className="workspace-panel partner-quote-card"><div className="partner-quote-top"><span><MapPin size={15} />{quote.destination}</span><PartnerStatus quote status={quote.status} /></div><h3>{quote.title}</h3><p className="partner-quote-price">{formatMoney(quote.price)}<span>Total · {quote.days} days / {quote.nights} nights</span></p><p className="partner-quote-validity">{draft ? 'Only visible to you' : `Valid until ${formatDate(quote.validUntil)}`}</p><div className="lead-card-footer"><span>Updated {formatDate(quote.updatedAt)}</span><Link className="text-link" to={editable ? createQuotePath(quote.leadId) : quotePath(quote.id)}>{editable ? 'Continue draft' : 'View proposal'}<ArrowUpRight size={16} /></Link></div></article>;
}
export function PartnerFilters({ filters, selected, onSelect, query, onQuery, label }) {
  return <div className="partner-toolbar"><div className="trip-filters" role="group" aria-label={`Filter ${label.toLowerCase()}`}>{filters.map(filter => <button key={filter.value} type="button" aria-pressed={selected === filter.value} className={selected === filter.value ? 'selected' : ''} onClick={() => onSelect(filter.value)}>{filter.label}</button>)}</div><TextField label={`Search ${label.toLowerCase()}`} size="small" value={query} onChange={event => onQuery(event.target.value)} /></div>;
}
