import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Logo from '../common/Logo';
import Button from '../common/Button';
import { ROLE_HOME, registrationPath, ROLES } from '../../constants/routes';
import { useAuthStore } from '../../features/auth/store/authStore';

const links = [{ to: '/', label: 'Home' }, { to: '/explore', label: 'Explore' }, { to: '/#how-it-works', label: 'How it works' }, { to: '/#travel-partners', label: 'For travel planners' }, { to: '/about', label: 'About' }];

export default function Header({ account }) {
  const role = useAuthStore(state => state.role);
  if (role && !account) account = <Button to={ROLE_HOME[role]} arrow>My account</Button>;
  const [open, setOpen] = useState(false);
  const { pathname, hash } = useLocation();
  const nav = (mobile = false) => <nav aria-label={mobile ? 'Mobile navigation' : 'Main navigation'} className={mobile ? 'mobile-nav' : 'desktop-nav'}>{links.map(({ to, label }) => <NavLink key={to} to={to} onClick={() => setOpen(false)} className={pathname + hash === to ? 'nav-link active' : 'nav-link'}>{label}</NavLink>)}</nav>;
  return <header className="site-header"><div className="container header-inner"><Logo />{nav()}<div className="header-actions">{account || <><Link to="/login" className="login-link">Log in</Link><Button to={registrationPath(ROLES.CUSTOMER)} arrow>Get started</Button></>}</div><IconButton className="mobile-menu-button" aria-label="Open navigation menu" aria-expanded={open} onClick={() => setOpen(true)}><Menu /></IconButton></div><Drawer anchor="right" open={open} onClose={() => setOpen(false)} slotProps={{ paper: { sx: { width: 'min(340px, 100%)', padding: '24px', backgroundColor: '#fdfcf8' } } }}><div className="mobile-menu-heading"><Logo /><IconButton aria-label="Close navigation menu" onClick={() => setOpen(false)}><X /></IconButton></div>{nav(true)}<div className="mobile-menu-actions"><Button to="/login" variant="outline" onClick={() => setOpen(false)}>Log in</Button><Button to={registrationPath()} onClick={() => setOpen(false)}>Get started <ArrowUpRight size={16} /></Button></div><p className="mobile-menu-note">A little inspiration.<br />A world of possibilities.</p></Drawer></header>;
}
