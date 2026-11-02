import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { destinations, destinationCategories } from '../data/destinations';
import DestinationCard from './DestinationCard';
import DestinationDialog from './DestinationDialog';

export default function DestinationsSection({ explore = false }) {
  const [category, setCategory] = useState('All destinations');
  const [selected, setSelected] = useState(null);
  const visible = destinations.filter(item => category === 'All destinations' || item.category === category);
  return <section className={`section destinations-section ${explore ? 'explore-section' : ''}`} id="destinations"><div className="container"><div className="section-heading"><div><p className="eyebrow">A LITTLE INSPIRATION</p><h2>{explore ? 'Where will your curiosity take you?' : 'Some places just call to you.'}</h2><p className="section-description">Find a place you love. We’ll help you find your way there.</p></div>{!explore && <Link to="/explore" className="text-link">Explore all destinations <ArrowUpRight size={17} /></Link>}</div><div className="destination-filters" role="group" aria-label="Filter destinations by experience">{destinationCategories.map(item => <button key={item} className={category === item ? 'filter-chip selected' : 'filter-chip'} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}</div><div className="destination-grid" aria-live="polite">{visible.map(destination => <DestinationCard key={destination.id} destination={destination} onSelect={setSelected} />)}</div><DestinationDialog destination={selected} onClose={() => setSelected(null)} /></div></section>;
}
