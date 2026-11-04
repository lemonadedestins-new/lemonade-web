import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Clock, MapPin, Check, X, Hotel, Car, Utensils } from 'lucide-react';
import { usePackages } from '../hooks/usePackages';
import { destinationById, imageUrl } from '../../home/data/destinations';
import { formatMoney } from '../../trips/tripModel';
import { browsePath, enquiryPath, plannerPath } from '../packageModel';
import { ErrorState, PageLoader } from '../../../components/common/Feedback';
import Button from '../../../components/common/Button';
import { useAuthStore } from '../../auth/store/authStore';
import { ROLES } from '../../../constants/routes';
import '../packages.css';
export default function PackageDetailsPage() {
  const { id } = useParams();
  const { data: item, loading, error, retry } = usePackages('get', id);
  const role = useAuthStore(state => state.role);
  if (loading) return <PageLoader />;
  if (error) return <div className="container package-detail"><ErrorState message={error} onRetry={retry} /><Button to="/explore" variant="outline">Browse available packages</Button></div>;
  const place = destinationById(item.destinationId);
  return <article className="container package-detail">
    <Link to={browsePath(place.id)} className="back-link"><ArrowLeft size={16} /> All {place.name} packages</Link>
    <div className="package-detail-heading"><p className="eyebrow">{place.name} · {place.country}</p><h1>{item.title}</h1><p>{item.summary}</p><div className="package-meta"><span><Clock size={16} />{item.days} days / {item.nights} nights</span><span><MapPin size={16} />Pickup & return: {item.pickupCity}</span>{item.isSample && <span>Sample package</span>}</div></div>
    <img className="package-cover" src={imageUrl(place, 1400)} alt={place.alt} width="1400" height="600" />
    <div className="package-detail-grid"><div>
      <section className="package-section"><p className="eyebrow">THE EXPERIENCE</p><h2>The little details, considered.</h2><div className="package-highlights">{[[Hotel, 'Your stay', item.accommodation], [Car, 'Getting around', item.transportation], [Utensils, 'At the table', item.meals]].map(([Icon, label, text]) => <div key={label}><Icon size={22} /><h3>{label}</h3><p>{text}</p></div>)}</div></section>
      <section className="package-section"><p className="eyebrow">ONE DAY AT A TIME</p><h2>Your itinerary.</h2><ol className="package-itinerary">{item.itinerary.map(day => <li key={day.day}><span>{String(day.day).padStart(2, '0')}</span><div><h3>{day.title}</h3><p>{day.description}</p></div></li>)}</ol></section>
      <section className="package-section package-list-columns">{[['Included', item.inclusions, Check], ['Not included', item.exclusions, X]].map(([label, list, Icon]) => <div key={label}><h2>{label}</h2><ul>{list.map((text, index) => <li key={index}><Icon size={16} />{text}</li>)}</ul></div>)}</section>
      <section className="package-section"><h2>Before you go.</h2><p className="package-terms">{item.terms}</p></section>
    </div><aside className="package-enquiry-card"><p className="eyebrow">YOUR NEXT GOOD JOURNEY</p><span>Starting from</span><strong className="package-detail-price">{formatMoney(item.price)}</strong><p>per adult · twin sharing · minimum 2 adults</p><hr /><Link className="package-planner" to={plannerPath(item.planner.id)}><span style={{ background: item.planner.color }}>{item.planner.initials}</span><div><strong>{item.planner.businessName}</strong><small>Based in {item.planner.city || 'South India'}</small></div><ArrowUpRight size={17} /></Link><p>{item.planner.description}</p>{role === ROLES.BUSINESS_OWNER ? <Button to="/partner/packages" className="button-full" variant="outline">Manage your packages</Button> : <Button to={enquiryPath(item.id)} className="button-full" arrow>Enquire about this package</Button>}<small>Share your dates with this planner. No booking or payment required.</small><Link className="text-link" to={plannerPath(item.planner.id)}>See all their packages <ArrowUpRight size={15} /></Link></aside></div>
  </article>;
}

