import ProposalDetails from './ProposalDetails';
import { useState } from 'react';
import { ArrowUpRight, Check, Clock3, Hotel, Utensils, Car, X, CalendarDays } from 'lucide-react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Button from '../../../components/common/Button';
import { dateInput, formatDate, formatMoney } from '../../trips/tripModel';

function QuoteLists({ quote }) {
  return <div className="quote-list-columns"><div><h4>Included</h4><ul>{quote.inclusions.map(item => <li key={item}><Check size={14} />{item}</li>)}</ul></div><div><h4>Not included</h4><ul>{quote.exclusions.map(item => <li key={item}><X size={14} />{item}</li>)}</ul></div></div>;
}
export default function QuoteCard({ quote, selected = false, sample = false }) {
  const [open, setOpen] = useState(false);
  const expired = quote.validUntil < dateInput();
  return <article className={`quote-card ${selected ? 'quote-selected' : ''}`}>
    <div className="quote-planner"><span className="planner-avatar">{quote.plannerName.slice(0, 1)}</span><div><strong>{quote.plannerName}</strong><span>{sample ? 'Sample travel planner' : 'Travel planner'}</span></div>{selected && <span className="trip-status status-green">Selected</span>}</div>
    <h3>{quote.title}</h3><div className="quote-price"><strong>{formatMoney(quote.price)}</strong><span>Total for your group · INR</span></div><p className="quote-duration"><CalendarDays size={15} />{quote.days} days · {quote.nights} nights</p>
    <div className="quote-highlights"><p><Hotel size={17} /><span>{quote.accommodation}</span></p><p><Car size={17} /><span>{quote.transportation}</span></p><p><Utensils size={17} /><span>{quote.meals}</span></p></div>
    <QuoteLists quote={quote} />
    <div className="itinerary-preview"><h4>A glimpse of your journey</h4><p><span>Day 1</span>{quote.itinerary[0]?.title || 'Your adventure begins'}</p></div>
    <div className="quote-card-footer"><span className={expired ? 'quote-expired' : ''}><Clock3 size={14} />{expired ? 'Expired' : 'Valid until'} {formatDate(quote.validUntil)}</span><Button variant="outline" onClick={() => setOpen(true)} aria-label={`View details of ${quote.title}`}>View details <ArrowUpRight size={16} /></Button></div>
    <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth aria-labelledby={`quote-title-${quote.id}`}>
      <DialogTitle component="div" className="quote-dialog-header"><div><p className="eyebrow">{quote.plannerName}</p><h2 id={`quote-title-${quote.id}`}>{quote.title}</h2></div><IconButton aria-label="Close quotation" onClick={() => setOpen(false)}><X size={20} /></IconButton></DialogTitle>
      <DialogContent className="quote-dialog-content"><ProposalDetails quote={quote} sample={sample} /></DialogContent>
    </Dialog>
  </article>;
}
