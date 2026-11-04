import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, FileText, MapPinned, Sparkles, CircleCheck, TrendingUp } from 'lucide-react';
import { usePackages } from '../../packages/hooks/usePackages';
import Button from '../../../components/common/Button';
import StatCard from '../../../components/common/StatCard';
import { EmptyState, ErrorState } from '../../../components/common/Feedback';
import { TripImage, TripLoading } from '../../trips/components/TripComponents';
import { useAuthStore } from '../../auth/store/authStore';
import { usePartnerData } from '../hooks/usePartnerData';
import { LeadCard, PartnerStatus } from '../components/PartnerComponents';
import { ROUTES } from '../../../constants/routes';
import { quotePath, createQuotePath } from '../../../constants/quotes';
import { formatDate } from '../../trips/tripModel';

export default function PartnerDashboardPage() {
  const user = useAuthStore(state => state.user);
  const { leads, quotes, loaded, error, load } = usePartnerData();
  const catalog = usePackages('mine');
  const available = leads.filter(lead => lead.canQuote);
  const fresh = leads.filter(lead => lead.status === 'NEW');
  const submitted = quotes.filter(quote => quote.status !== 'DRAFT');
  const stats = [{ label: 'Available enquiries', value: available.length, detail: 'Ready for your expertise', icon: MapPinned }, { label: 'New leads', value: fresh.length, detail: 'Your next connections', icon: Sparkles }, { label: 'Quotes submitted', value: submitted.length, detail: 'Ideas you’ve brought to life', icon: FileText }, { label: 'Accepted proposals', value: quotes.filter(quote => quote.status === 'ACCEPTED').length, detail: 'A planner selected, not a booking', icon: CircleCheck }];
  return <div className="workspace-page fade-in"><div className="workspace-page-heading"><div><p className="eyebrow">GOOD PEOPLE. EXTRAORDINARY JOURNEYS.</p><h1>Welcome back, {user?.name?.split(' ')[0]}<span className="welcome-dot">.</span></h1><p>A new connection could be someone’s favorite trip.</p></div><span className="partner-business-label">{user?.businessName || 'Your travel business'}</span></div>
    <section className="dashboard-hero partner-hero"><div><p className="eyebrow"><Sparkles size={15} /> YOUR EXPERTISE MAKES THE DIFFERENCE</p><h2>Your packages. Their next great journey.</h2><p>List the journeys you offer. Travelers find you through your destinations and send enquiries about specific packages.</p><Button to={ROUTES.PARTNER_PACKAGES} variant="lemon">Manage your packages <ArrowUpRight size={17} /></Button></div><div className="dashboard-hero-image"><TripImage destination="Munnar" /><span>Local knowledge. A world of possibilities.</span></div></section>
    <section className="workspace-panel" style={{ marginBottom: 28 }}><div className="workspace-section-heading"><div><h2>Your package catalog</h2><p>{catalog.loading ? 'Loading your listings…' : catalog.error ? 'Your catalog could not be loaded.' : `${catalog.data.filter(item => item.status === 'PUBLISHED').length} published · ${catalog.data.filter(item => item.status === 'DRAFT').length} drafts · ${catalog.data.filter(item => item.status === 'ARCHIVED').length} archived`}</p></div><Link className="text-link" to={ROUTES.PARTNER_PACKAGES}>View packages <ArrowRight size={16} /></Link></div></section>
    {error ? <ErrorState message={error} onRetry={() => load(true)} /> : <><section className="stat-grid partner-stat-grid" aria-label="Your business at a glance">{stats.map(stat => <StatCard key={stat.label} {...stat} value={loaded ? String(stat.value).padStart(2, '0') : '—'} />)}</section>
      <section><div className="workspace-section-heading"><div><h2>Journeys waiting for your touch</h2><p>Start with the traveler. Bring your own perspective.</p></div><Link className="text-link" to={ROUTES.LEADS}>All enquiries <ArrowRight size={17} /></Link></div>{!loaded ? <TripLoading cards={2} /> : available.length ? <div className="lead-grid">{available.slice(0, 2).map(lead => <LeadCard key={lead.id} lead={lead} />)}</div> : <div className="workspace-panel"><EmptyState title="A little breathing room." message="New assigned enquiries will appear here. In the meantime, keep your business profile up to date."><Button to={ROUTES.PARTNER_PROFILE} variant="outline">Review business profile</Button></EmptyState></div>}</section>
      <div className="dashboard-bottom"><section className="workspace-panel"><div className="workspace-section-heading"><h2>Recent activity</h2><Link className="text-link" to={ROUTES.QUOTES}>My quotes <ArrowRight size={16} /></Link></div>{quotes.length ? <div className="partner-activity">{quotes.slice(0, 4).map(quote => <Link key={quote.id} to={quote.status === 'DRAFT' && quote.canEdit !== false ? createQuotePath(quote.leadId) : quotePath(quote.id)}><span className="activity-dot" /><div><strong>{quote.title}</strong><p>{quote.destination} · {formatDate(quote.updatedAt)}</p></div><PartnerStatus quote status={quote.status} /></Link>)}</div> : <p className="quiet-empty">Your proposal activity will appear here once you save or send a quote.</p>}</section><section className="workspace-panel partner-insights"><TrendingUp size={28} strokeWidth={1.4} /><p className="eyebrow">ROOM TO GROW</p><h2>Connections worth nurturing.</h2><p>Thoughtful details and a clear itinerary help travelers see what makes your proposal different.</p><div><span>Conversion insights</span><strong>—</strong></div><small>Detailed conversion reporting will be available in a future release.</small></section></div>
    </>}
  </div>;
}
