import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, CalendarDays, Compass, MessageSquareText, Plus, Sparkles, Luggage } from 'lucide-react';
import Button from '../../../components/common/Button';
import { EmptyState, ErrorState } from '../../../components/common/Feedback';
import { useAuthStore } from '../../auth/store/authStore';
import { useTripStore } from '../../trips/store/tripStore';
import { ActivityTimeline, TripCard, TripImage, TripLoading } from '../../trips/components/TripComponents';
import { ACTIVE_STATUSES, TRIP_STATUS } from '../../../constants/trips';
import { ROUTES } from '../../../constants/routes';
import { dateInput, formatDate, tripPath } from '../../trips/tripModel';

export default function DashboardPage() {
  const user = useAuthStore(state => state.user);
  const trips = useTripStore(state => state.trips);
  const loading = useTripStore(state => state.loading);
  const loaded = useTripStore(state => state.loaded);
  const error = useTripStore(state => state.error);
  const load = useTripStore(state => state.loadTrips);
  const { state } = useLocation();
  useEffect(() => { void load(); }, [load]);
  const active = trips.filter(trip => ACTIVE_STATUSES.includes(trip.status));
  const upcoming = trips.filter(trip => trip.status === TRIP_STATUS.PLANNER_SELECTED && trip.startDate >= dateInput()).sort((a, b) => a.startDate.localeCompare(b.startDate));
  const responses = active.reduce((total, trip) => total + (trip.quotes?.length || 0), 0);
  const events = trips.flatMap(trip => trip.timeline.map(event => ({ ...event, destination: trip.destination, tripId: trip.id }))).sort((a, b) => b.at.localeCompare(a.at)).slice(0, 4);
  const stats = [{ label: 'Active requests', value: active.length, icon: Luggage, detail: 'Good things in the making' }, { label: 'Planner proposals', value: responses, icon: MessageSquareText, detail: 'Ideas for your next journey' }, { label: 'Upcoming trips', value: upcoming.length, icon: CalendarDays, detail: 'Something to look forward to' }];
  return <div className="workspace-page fade-in">
    <div className="workspace-page-heading"><div><p className="eyebrow">YOUR JOURNEY, ALL TOGETHER</p><h1>Hello, {user?.name?.split(' ')[0] || 'traveler'}<span className="welcome-dot">.</span></h1><p>A little closer to somewhere wonderful.</p></div><span className="dashboard-date"><CalendarDays size={15} />{formatDate(dateInput())}</span></div>
    <section className="dashboard-hero"><div><p className="eyebrow"><Sparkles size={14} /> A WORLD OF POSSIBILITIES</p><h2>{state?.destination ? `${state.destination} is calling.` : 'Your next great story starts here.'}</h2><p>Explore South Indian packages, compare the planners behind them, and ask about your preferred dates.</p><Button to={ROUTES.EXPLORE} variant="lemon"><Plus size={17} /> Browse travel packages</Button></div><div className="dashboard-hero-image"><TripImage destination="Munnar" /><span><Compass size={16} /> A change of scenery, a fresh perspective.</span></div></section>
    {error ? <ErrorState message={error} onRetry={() => load(true)} /> : <>
      <section className="stat-grid" aria-label="Your travel at a glance">{stats.map(({ label, value, icon: Icon, detail }) => <div className="stat-card" key={label}><div><p>{label}</p><strong>{!loaded ? '—' : value.toString().padStart(2, '0')}</strong><span>{detail}</span></div><span className="stat-icon"><Icon size={21} strokeWidth={1.5} /></span></div>)}</section>
      <section><div className="workspace-section-heading"><div><h2>Trips in the making</h2><p>From a first idea to your perfect escape.</p></div><Link className="text-link" to={ROUTES.TRIPS}>All trips <ArrowRight size={17} /></Link></div>
        {loading || !loaded ? <TripLoading /> : trips.length ? <div className="trip-grid">{[...active, ...trips.filter(trip => !ACTIVE_STATUSES.includes(trip.status))].slice(0, 3).map(trip => <TripCard trip={trip} key={trip.id} />)}</div> : <div className="workspace-panel"><EmptyState title="A blank page. Endless possibilities." message="Your trips will live here. Start with a destination and we’ll take it from there."><Button to={ROUTES.EXPLORE}>Find your first package <ArrowUpRight size={17} /></Button></EmptyState></div>}
      </section>
      {loaded && <div className="dashboard-bottom"><section className="workspace-panel"><div className="workspace-section-heading"><h2>Recent activity</h2><span className="small-label">THE LATEST</span></div>{events.length ? <ActivityTimeline events={events} /> : <p className="quiet-empty">Every journey starts with an idea. Save a draft or submit a request to see your activity here.</p>}</section>
        <section className="workspace-panel upcoming-panel"><div className="workspace-section-heading"><h2>On the horizon</h2><CalendarDays size={19} /></div>{upcoming.length ? upcoming.slice(0, 2).map(trip => <Link to={tripPath(trip.id)} className="upcoming-trip" key={trip.id}><TripImage destination={trip.destination} /><div><span className="small-label">PLANNER SELECTED</span><h3>{trip.destination}</h3><p>{formatDate(trip.startDate)}<ArrowUpRight size={18} /></p></div></Link>) : <div className="upcoming-empty"><Compass size={36} strokeWidth={1} /><h3>Something to look forward to.</h3><p>Trips with a selected planner will appear here.</p><Link to={ROUTES.EXPLORE} className="text-link">Explore South India packages <ArrowUpRight size={16} /></Link></div>}<p className="panel-footnote">A selected planner doesn’t confirm a booking. Check arrangements directly with your planner.</p></section>
      </div>}
    </>}
  </div>;
}
