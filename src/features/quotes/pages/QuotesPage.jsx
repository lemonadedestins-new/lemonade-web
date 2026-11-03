import { useState } from 'react';
import Button from '../../../components/common/Button';
import { EmptyState, ErrorState } from '../../../components/common/Feedback';
import { TripLoading } from '../../trips/components/TripComponents';
import { PartnerFilters, QuoteSummaryCard } from '../../partner/components/PartnerComponents';
import { usePartnerData } from '../../partner/hooks/usePartnerData';
import { QUOTE_META } from '../../../constants/quotes';
import { ROUTES } from '../../../constants/routes';
const filters = [{ value: 'ALL', label: 'All quotes' }, ...Object.entries(QUOTE_META).map(([value, meta]) => ({ value, label: meta.label }))];
export default function QuotesPage() {
  const { quotes, loaded, error, load } = usePartnerData();
  const [filter, setFilter] = useState('ALL');
  const [query, setQuery] = useState('');
  const visible = quotes.filter(quote => (filter === 'ALL' || quote.status === filter) && `${quote.title} ${quote.destination}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <div className="workspace-page fade-in"><div className="workspace-page-heading"><div><p className="eyebrow">THOUGHTFUL IDEAS, BEAUTIFULLY TOGETHER</p><h1>My quotes<span className="welcome-dot">.</span></h1><p>From a first draft to a traveler’s favorite plan.</p></div><Button to={ROUTES.LEADS}>Find an enquiry</Button></div><PartnerFilters filters={filters} selected={filter} onSelect={setFilter} query={query} onQuery={setQuery} label="Quotes" />{error ? <ErrorState message={error} onRetry={() => load(true)} /> : !loaded ? <TripLoading cards={2} /> : visible.length ? <div className="quote-grid">{visible.map(quote => <QuoteSummaryCard quote={quote} key={quote.id} />)}</div> : <div className="workspace-panel"><EmptyState title={quotes.length ? 'No quotes match just yet.' : 'Every great trip starts with an idea.'} message={quotes.length ? 'Try another status or search term.' : 'Choose an assigned travel enquiry and create your first proposal.'}>{quotes.length ? <Button variant="outline" onClick={() => { setFilter('ALL'); setQuery(''); }}>Clear filters</Button> : <Button to={ROUTES.LEADS}>Browse enquiries</Button>}</EmptyState></div>}</div>;
}
