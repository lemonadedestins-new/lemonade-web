import { Link } from 'react-router-dom';
import { ArrowUpRight, Instagram, Facebook, Linkedin, Heart } from 'lucide-react';
import Tooltip from '@mui/material/Tooltip';
import Logo from '../common/Logo';
import { registrationPath, ROLES } from '../../constants/routes';

export default function Footer() {
  return <footer className="site-footer"><div className="container"><div className="footer-main"><div className="footer-brand"><Logo /><p>Good journeys start with good people.<br />Let’s find yours.</p><div className="social-links">{[[Instagram, 'Instagram'], [Facebook, 'Facebook'], [Linkedin, 'LinkedIn']].map(([Icon, label]) => <Tooltip key={label} title={`${label} — coming soon`}><span tabIndex={0} aria-label={`${label} — coming soon`}><Icon size={17} /></span></Tooltip>)}</div></div><div className="footer-column"><h3>Discover</h3><Link to="/explore">Browse South India packages</Link><Link to="/#how-it-works">How it works</Link><Link to="/about">Our story</Link></div><div className="footer-column"><h3>We’re here to help</h3><Link to="/contact">Contact us</Link><Link to="/contact">Customer support</Link><Link to="/privacy">Privacy policy</Link><Link to="/terms">Terms of use</Link></div><div className="footer-column footer-partner"><h3>Let’s go places, together.</h3><p>Help travelers see the world<br />through your expertise.</p><Link className="text-link" to={registrationPath(ROLES.BUSINESS_OWNER)}>Become a travel partner <ArrowUpRight size={17} /></Link></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Lemonade Destinations. All rights reserved.</span><span>Made for the love of travel <Heart size={13} /></span></div></div></footer>;
}
