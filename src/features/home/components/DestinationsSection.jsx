import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { destinations, destinationCategories } from '../data/destinations';
import DestinationCard from './DestinationCard';
export default function DestinationsSection() {
  const [category, setCategory] = useState('All destinations');
  const visible = destinations.filter(item => category === 'All destinations' || item.category === category);
  return <section className="section destinations-section" id="destinations"><div className="container"><div className="section-heading"><div><p className="eyebrow">A LITTLE CLOSER. A LITTLE MORE YOU.</p><h2>Six places. So many possibilities.</h2><p className="section-description">Choose your corner of South India. Discover the packages and planners who can take you there.</p></div><Link to="/explore" className="text-link">Browse all packages <ArrowUpRight size={17} /></Link></div><div className="destination-filters" role="group" aria-label="Filter destinations by experience">{destinationCategories.map(item => <button key={item} className={category === item ? 'filter-chip selected' : 'filter-chip'} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}</div><div className="destination-grid" aria-live="polite">{visible.map(destination => <DestinationCard key={destination.id} destination={destination} />)}</div></div></section>;
}
