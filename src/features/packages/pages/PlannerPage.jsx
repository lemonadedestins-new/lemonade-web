import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Languages } from 'lucide-react';
import { usePackages } from '../hooks/usePackages';
import PackageCard from '../components/PackageCard';
import { ErrorState, PageLoader } from '../../../components/common/Feedback';
import '../packages.css';
export default function PlannerPage() {
  const { id } = useParams();
  const { data: planner, loading, error, retry } = usePackages('planner', id);
  if (loading) return <PageLoader />;
  if (error) return <div className="container package-detail"><ErrorState message={error} onRetry={retry} /><Link to="/explore">Browse packages</Link></div>;
  return <div className="container package-detail"><Link className="back-link" to="/explore"><ArrowLeft size={16} /> Back to packages</Link><section className="planner-profile"><span className="planner-avatar" style={{ background: planner.color }}>{planner.initials}</span><div><p className="eyebrow">THE PEOPLE BEHIND THE JOURNEY{planner.isSample && ' · SAMPLE PLANNER'}</p><h1>{planner.businessName}</h1><p>{planner.description}</p><div className="package-meta"><span><MapPin size={16} />{planner.city || 'South India'}</span>{planner.languages.length > 0 && <span><Languages size={16} />{planner.languages.join(', ')}</span>}</div><p className="planner-specialties">{planner.specialties}</p></div></section><div className="catalog-results-heading"><div><h2>Journeys by {planner.businessName}</h2><p>{planner.packages.length} available package listings. Dates are confirmed on enquiry.</p></div></div><div className="package-grid">{planner.packages.map(item => <PackageCard item={item} key={item.id} />)}</div></div>;
}

