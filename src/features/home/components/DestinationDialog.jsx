import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import { X, Clock, Check } from 'lucide-react';
import Button from '../../../components/common/Button';
import { browsePath } from '../../packages/packageModel';
import { imageUrl } from '../data/destinations';

export default function DestinationDialog({ destination, onClose }) {
  const planPath = browsePath(destination?.id);
  return <Dialog open={!!destination} onClose={onClose} maxWidth="sm" fullWidth aria-labelledby="destination-dialog-title">{destination && <><div className="destination-dialog-image"><img src={imageUrl(destination, 1000)} alt={destination.alt} /><IconButton onClick={onClose} aria-label="Close destination details" sx={{ position: 'absolute', top: 14, right: 14, background: 'white' }}><X size={20} /></IconButton></div><DialogContent sx={{ p: { xs: 3, sm: 4 } }}><p className="eyebrow">{destination.tag}</p><h2 id="destination-dialog-title" className="dialog-title">A little more {destination.name}.</h2><p className="dialog-description">{destination.description}</p><div className="destination-highlights">{destination.highlights.map(item => <span key={item}><Check size={15} />{item}</span>)}</div><p className="destination-duration"><Clock size={16} /> Suggested stay: {destination.duration}</p><Button to={planPath} className="button-full" arrow>See packages for {destination.name}</Button><p className="dialog-footnote">Your preferences. Your pace. Your kind of journey.</p></DialogContent></>}</Dialog>;
}
