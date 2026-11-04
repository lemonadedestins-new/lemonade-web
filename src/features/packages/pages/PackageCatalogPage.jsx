import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, ArrowUpRight } from 'lucide-react';
import { destinations } from '../../home/data/destinations';
import { usePackages } from '../hooks/usePackages';
import { filterPackages } from '../packageModel';
import PackageCard, { PlannerCard } from '../components/PackageCard';
import { EmptyState, ErrorState, PageLoader } from '../../../components/common/Feedback';
import Button from '../../../components/common/Button';
import { apiConfig } from '../../../api/config';
import '../packages.css';
export default function PackageCatalogPage() {
  const [params, setParams] = useSearchParams();
  const { data, loading, error, retry } = usePackages();
  const filters = Object.fromEntries(params);
  const items = filterPackages(data || [], filters);
  const planners = [...new Map(items.map(item => [item.planner.id, item.planner])).values()];
  const allPlanners = [...new Map((data || []).map(item => [item.planner.id, item.planner])).values()];
  const chosen = destinations.find(place => place.id === filters.destination);
  function update(key, value) { const next = new URLSearchParams(params); value ? next.set(key, value) : next.delete(key); setParams(next, { replace: true }); }
  return <div className="catalog-page">
    <section className="catalog-intro container"><p className="eyebrow">NEARER PLACES. NEW PERSPECTIVES.</p><h1>{chosen ? `Find your kind of ${chosen.name}.` : 'The south is calling.'}</h1><p>Discover ready-to-explore packages from travel planners.<br />Find your place, compare the details, and choose who plans your journey.</p><span className="catalog-region">Kerala · Tamil Nadu · Karnataka · Puducherry</span></section>
    <section className="container catalog-content" aria-label="Find travel packages">
      <div className="catalog-search"><Search size={21} /><label className="sr-only" htmlFor="package-search">Search destination, package, or planner</label><input id="package-search" type="search" placeholder="Try Munnar, Ooty, or a travel planner…" value={filters.q || ''} onChange={event => update('q', event.target.value)} /></div>
      <div className="destination-filters" role="group" aria-label="Choose destination">{[{ id: '', name: 'All destinations' }, ...destinations].map(place => <button key={place.id} className={(!filters.destination && !place.id || filters.destination === place.id) ? 'filter-chip selected' : 'filter-chip'} aria-pressed={(filters.destination || '') === place.id} onClick={() => update('destination', place.id)}>{place.name}</button>)}</div>
      <div className="catalog-filters"><SlidersHorizontal size={19} /><label>Planner<select value={filters.planner || ''} onChange={e => update('planner', e.target.value)}><option value="">All planners</option>{allPlanners.map(p => <option key={p.id} value={p.id}>{p.businessName}</option>)}</select></label><label>Budget per adult<select value={filters.maxPrice || ''} onChange={e => update('maxPrice', e.target.value)}><option value="">Any budget</option><option value="8000">Up to ₹8,000</option><option value="10000">Up to ₹10,000</option><option value="15000">Up to ₹15,000</option></select></label><label>Duration<select value={filters.duration || ''} onChange={e => update('duration', e.target.value)}><option value="">Any duration</option><option value="short">1–3 days</option><option value="long">4+ days</option></select></label><label>Sort by<select value={filters.sort || ''} onChange={e => update('sort', e.target.value)}><option value="">Price: low to high</option><option value="price-desc">Price: high to low</option><option value="duration">Shortest first</option></select></label><button className="text-link" onClick={() => setParams({})}>Reset filters</button></div>
      <div className="catalog-results-heading"><div aria-live="polite"><h2>{loading ? 'Finding your next escape…' : `${items.length} packages · ${planners.length} planners`}</h2><p>{chosen ? `Options for ${chosen.name}, all in one place.` : 'A closer look at what each planner offers.'}</p></div><div className="catalog-view" role="group" aria-label="Results view"><button aria-pressed={filters.view !== 'planners'} onClick={() => update('view', '')}>Packages</button><button aria-pressed={filters.view === 'planners'} onClick={() => update('view', 'planners')}>Travel planners</button></div></div>
      {loading ? <PageLoader /> : error ? <ErrorState message={error} onRetry={retry} /> : !items.length ? <EmptyState title="A little change of plans?" message="No packages match these filters. Try another destination or widen your budget."><Button onClick={() => setParams({})}>See all packages</Button></EmptyState> : filters.view === 'planners' ? <div className="planner-grid">{planners.map(planner => <PlannerCard key={planner.id} planner={planner} packages={items.filter(item => item.planner.id === planner.id)} />)}</div> : <div className="package-grid">{items.map(item => <PackageCard key={item.id} item={item} />)}</div>}
      <p className="catalog-disclosure">{apiConfig.useMock ? 'Demo marketplace: all businesses and package prices are illustrative. ' : ''}Prices are per adult on twin sharing. Confirm dates, availability, and final terms with the planner before booking.</p>
      <div className="catalog-help"><div><h2>A package is just the beginning.</h2><p>Ask the planner about your dates, preferences, and a personal touch.</p></div><Button to="/#travel-partners" variant="outline">Are you a travel planner? <ArrowUpRight size={17} /></Button></div>
    </section>
  </div>;
}

