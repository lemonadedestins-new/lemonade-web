import { Citrus } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Logo({ light = false }) {
  return <Link to="/" className={`brand ${light ? 'brand-light' : ''}`} aria-label="Lemonade Destinations home"><span className="brand-symbol"><Citrus size={29} strokeWidth={1.6} /></span><span className="brand-wordmark">lemonade<span>DESTINATIONS</span></span></Link>;
}
