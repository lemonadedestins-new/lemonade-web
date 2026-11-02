import { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '../../../components/common/Button';
import { EmptyState, ErrorState } from '../../../components/common/Feedback';
import { useTripStore } from '../store/tripStore';
import { TripCard, TripLoading } from '../components/TripComponents';
import { ACTIVE_STATUSES, TRIP_STATUS } from '../../../constants/trips';
import { ROUTES } from '../../../constants/routes';

const filters = [
  { label: 'All trips', value: 'all', matches: () => true },
  { label: 'In progress', value: 'active', matches: trip => ACTIVE_STATUSES.includes(trip.status) },
  { label: 'Drafts', value: 'drafts', matches: trip => trip.status === TRIP_STATUS.DRAFT },
  { label: 'Planner selected', value: 'selected', matches: trip => trip.status === TRIP_STATUS.PLANNER_SELECTED },
  { label: 'Past & closed', value: 'closed', matches: trip => [TRIP_STATUS.CLOSED, TRIP_STATUS.CANCELLED].includes(trip.status) },
];
export default function MyTripsPage() {
  const trips = useTripStore(state => state.trips);
  const loaded = useTripStore(state => state.loaded);
  const loading = useTripStore(state => state.loading);
  const error = useTripStore(state => state.error);
  const load = useTripStore(state => state.loadTrips);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  useEffect(() => { void load(); }, [load]);
  const visible = trips.filter(trip => filters.find(item => item.value === filter).matches(trip) && `${trip.destination} ${trip.departureCity} ${trip.tripType}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <div className="workspace-page fade-in"><div className="workspace-page-heading"><div><p className="eyebrow">COLLECT MOMENTS, NOT TO-DO LISTS</p><h1>My trips<span className="welcome-dot">.</span></h1><p>Every idea, every possibility, all in one place.</p></div><Button to={ROUTES.NEW_TRIP}><Plus size={18} /> New trip request</Button></div>
    <div className="trip-list-toolbar"><div className="trip-filters" role="group" aria-label="Filter trips">{filters.map(item => <button key={item.value} type="button" aria-pressed={filter === item.value} className={filter === item.value ? 'selected' : ''} onClick={() => setFilter(item.value)}>{item.label}<span>{trips.filter(item.matches).length}</span></button>)}</div><TextField label="Search trips" size="small" value={query} onChange={event => setQuery(event.target.value)} slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search size={17} /></InputAdornment> } }} /></div>
    {error ? <ErrorState message={error} onRetry={() => load(true)} /> : loading || !loaded ? <TripLoading cards={6} /> : visible.length ? <><p className="results-label">{visible.length} {visible.length === 1 ? 'trip' : 'trips'} · your next chapter awaits</p><div className="trip-grid">{visible.map(trip => <TripCard key={trip.id} trip={trip} />)}</div></> : <div className="workspace-panel"><EmptyState title={trips.length ? 'No trips on this trail.' : 'Where shall we go?'} message={trips.length ? 'Try another filter or destination to find your trip.' : 'Give your next adventure a place to begin. Save an idea or send your first trip request.'}>{trips.length ? <Button variant="outline" onClick={() => { setFilter('all'); setQuery(''); }}>Clear filters</Button> : <Button to={ROUTES.NEW_TRIP}><Plus size={17} /> Plan your first trip</Button>}</EmptyState></div>}
  </div>;
}
