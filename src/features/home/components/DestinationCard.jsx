import { Link } from 'react-router-dom';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { imageUrl } from '../data/destinations';
import { browsePath } from '../../packages/packageModel';
export default function DestinationCard({ destination }) {
  return <Link className="destination-card" to={browsePath(destination.id)} aria-label={`View packages and planners for ${destination.name}`}><div className="destination-image"><img src={imageUrl(destination)} alt={destination.alt} loading="lazy" width="700" height="480" /><span className="destination-category">{destination.category}</span><span className="destination-arrow"><ArrowUpRight size={20} /></span></div><div className="destination-info"><div className="destination-title"><h3>{destination.name}</h3><span><MapPin size={12} />{destination.country}</span></div><p>{destination.description}</p></div></Link>;
}
