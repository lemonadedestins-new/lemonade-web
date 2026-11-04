import { Link } from 'react-router-dom';
import { ArrowUpRight, Clock, MapPin, Check } from 'lucide-react';
import { destinationById, imageUrl } from '../../home/data/destinations';
import { formatMoney } from '../../trips/tripModel';
import { packagePath, plannerPath } from '../packageModel';
export default function PackageCard({ item }) {
  const place = destinationById(item.destinationId);
  return <article className="package-card">
    <Link to={packagePath(item.id)} className="package-card-image" aria-label={item.title}><img src={imageUrl(place)} alt={place.alt} loading="lazy" width="700" height="460" /><span>{place.name} · {place.country}</span></Link>
    <div className="package-card-body">
      <Link className="package-planner" to={plannerPath(item.planner.id)}><span style={{ background: item.planner.color }}>{item.planner.initials}</span>{item.planner.businessName}<ArrowUpRight size={14} /></Link>
      <h3><Link to={packagePath(item.id)}>{item.title}</Link></h3>
      <div className="package-meta"><span><Clock size={14} />{item.days} days / {item.nights} nights</span><span><MapPin size={14} />From {item.pickupCity}</span></div>
      <p className="package-card-summary">{item.summary}</p>
      <div className="package-included">{item.inclusions.slice(0, 2).map((entry, index) => <span key={index}><Check size={13} />{entry}</span>)}</div>
      <div className="package-card-bottom"><div><small>Starting from</small><strong>{formatMoney(item.price)}</strong><small>per adult · twin sharing</small></div><Link to={packagePath(item.id)} className="text-link">View package <ArrowUpRight size={16} /></Link></div>
    </div>
  </article>;
}
export function PlannerCard({ planner, packages }) {
  const places = [...new Set(packages.map(item => destinationById(item.destinationId)?.name))];
  const starting = Math.min(...packages.map(item => item.price));
  return <article className="planner-card">
    <span className="planner-avatar" style={{ background: planner.color }}>{planner.initials}</span>
    <div><p className="eyebrow">BASED IN {planner.city || 'SOUTH INDIA'}</p><h3><Link to={plannerPath(planner.id)}>{planner.businessName}</Link></h3><p>{planner.description || planner.specialties}</p><div className="package-tags">{places.map(name => <span key={name}>{name}</span>)}</div><div className="planner-card-footer"><span>{packages.length} matching {packages.length === 1 ? 'package' : 'packages'} · from {formatMoney(starting)}/adult</span><Link className="text-link" to={plannerPath(planner.id)}>Meet the planner <ArrowUpRight size={16} /></Link></div></div>
  </article>;
}

