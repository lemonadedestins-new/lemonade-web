import { useState } from 'react';
import { EmptyState, ErrorState } from '../../../components/common/Feedback';
import Button from '../../../components/common/Button';
import { TripLoading } from '../../trips/components/TripComponents';
import { usePartnerData } from '../hooks/usePartnerData';
import { LeadCard, PartnerFilters } from '../components/PartnerComponents';
import { ROUTES } from '../../../constants/routes';
const filters = [{ value: 'ALL', label: 'All enquiries' }, { value: 'NEW', label: 'New' }, { value: 'DRAFT', label: 'In progress' }, { value: 'QUOTED', label: 'Quote sent' }, { value: 'CLOSED', label: 'Closed' }];
export default function LeadsPage() {
  const { leads, loaded, error, load } = usePartnerData();
  const [filter, setFilter] = useState('ALL');
  const [query, setQuery] = useState('');
  const visible = leads.filter(lead => (filter === 'ALL' || lead.status === filter) && `${lead.destination} ${lead.departureCity} ${lead.tripType}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <div className="workspace-page fade-in"><div className="workspace-page-heading"><div><p className="eyebrow">THE START OF SOMETHING GOOD</p><h1>Travel enquiries<span className="welcome-dot">.</span></h1><p>Real preferences. Fresh possibilities. Your next great connection.</p></div></div><PartnerFilters filters={filters} selected={filter} onSelect={setFilter} query={query} onQuery={setQuery} label="Enquiries" />
    {error ? <ErrorState message={error} onRetry={() => load(true)} /> : !loaded ? <TripLoading cards={4} /> : visible.length ? <><p className="results-label">{visible.length} {visible.length === 1 ? 'enquiry' : 'enquiries'} assigned to your business</p><div className="lead-grid">{visible.map(lead => <LeadCard lead={lead} key={lead.id} />)}</div></> : <div className="workspace-panel"><EmptyState title={leads.length ? 'No enquiries on this trail.' : 'Your next connection is on its way.'} message={leads.length ? 'Try a different destination or status filter.' : 'Assigned customer enquiries will appear here. Complete your business profile to introduce your expertise.'}>{leads.length ? <Button variant="outline" onClick={() => { setFilter('ALL'); setQuery(''); }}>Clear filters</Button> : <Button to={ROUTES.PARTNER_PROFILE}>Complete your profile</Button>}</EmptyState></div>}
  </div>;
}
