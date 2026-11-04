import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import { ArrowUpRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../../../components/common/Button';
import { destinationById } from '../../home/data/destinations';
import { formatMoney } from '../../trips/tripModel';
import { packagePath, plannerPath } from '../packageModel';

const value = (item, key) => {
  if (key === 'destination') return destinationById(item.destinationId)?.name || 'South India';
  if (key === 'price') return `${formatMoney(item.price)} per adult`;
  if (key === 'duration') return `${item.days} days · ${item.nights} nights`;
  if (key === 'planner') return item.planner?.businessName || 'Travel planner';
  if (Array.isArray(item[key])) return item[key].join(', ');
  return item[key] || 'Not specified';
};

const rows = [
  ['destination', 'Destination'],
  ['planner', 'Planner'],
  ['price', 'Starting price'],
  ['duration', 'Duration'],
  ['pickupCity', 'Pickup city'],
  ['accommodation', 'Stay'],
  ['transportation', 'Transport'],
  ['meals', 'Meals'],
  ['inclusions', 'Included'],
];

export default function PackageCompareDialog({ items, open, onClose, onRemove }) {
  return <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg" aria-labelledby="package-compare-title">
    <DialogTitle component="div" className="package-compare-title"><div><p className="eyebrow">YOUR SHORTLIST</p><h2 id="package-compare-title">Compare packages</h2><p>See the practical details together before you choose who to enquire with.</p></div><IconButton aria-label="Close package comparison" onClick={onClose}><X size={21} /></IconButton></DialogTitle>
    <DialogContent className="package-compare-content">
      <div className="package-comparison-scroll"><table className="package-comparison-table"><caption className="sr-only">Selected travel packages compared by price, duration, planner, and inclusions</caption><thead><tr><th scope="col">Details</th>{items.map(item => <th scope="col" key={item.id}><div className="comparison-package-heading"><strong>{item.title}</strong><span>{item.planner?.businessName}</span><button type="button" onClick={() => onRemove(item.id)}>Remove</button></div></th>)}</tr></thead><tbody>{rows.map(([key, label]) => <tr key={key}><th scope="row">{label}</th>{items.map(item => <td key={`${item.id}-${key}`}>{key === 'planner' ? <Link to={plannerPath(item.planner.id)} onClick={onClose}>{value(item, key)} <ArrowUpRight size={13} /></Link> : value(item, key)}</td>)}</tr>)}<tr><th scope="row">Next step</th>{items.map(item => <td key={`${item.id}-action`}><Button to={packagePath(item.id)} variant="outline" onClick={onClose}>View package <ArrowUpRight size={15} /></Button></td>)}</tr></tbody></table></div>
      <p className="package-compare-footnote">Prices are indicative per adult on twin sharing. Dates, availability, and final terms are confirmed with the planner.</p>
    </DialogContent>
  </Dialog>;
}
