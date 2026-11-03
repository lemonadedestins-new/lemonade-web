import { Suspense, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ArrowUpRight, ChevronRight, Compass, LogOut, Menu, X } from 'lucide-react';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Logo from '../components/common/Logo';
import Button from '../components/common/Button';
import { ConfirmDialog, PageLoader } from '../components/common/Feedback';
import { useAuthStore } from '../features/auth/store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { ROUTES } from '../constants/routes';
import { apiConfig } from '../api/config';
import '../features/customer/customer.css';

export default function WorkspaceLayout({ navigation, home, action, note, partner = false }) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const loading = useAuthStore(state => state.loading);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const title = pathname.endsWith('/quotes/new') ? 'Create a quote' : pathname === ROUTES.NEW_TRIP ? 'Plan a trip' : pathname.endsWith('/edit') ? 'Edit draft' : navigation.find(item => pathname.startsWith(item.to))?.label || 'Workspace';
  async function signOut() {
    try { await logout(); }
    catch { useNotificationStore.getState().notify('You’re signed out on this device. The server could not be reached.', 'warning'); }
    navigate(ROUTES.LOGIN, { replace: true });
  }
  const sidebar = <>
    <div className="workspace-brand"><Logo /><IconButton className="workspace-close" aria-label="Close navigation" onClick={() => setOpen(false)}><X size={20} /></IconButton></div>
    <p className="workspace-nav-label">{partner ? 'THE PLANNER WORKSPACE' : 'YOUR NEXT CHAPTER'}</p>
    <nav aria-label={partner ? 'Partner navigation' : 'Customer navigation'} className="workspace-nav">{navigation.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} onClick={() => setOpen(false)} className={({ isActive }) => `workspace-nav-link ${isActive ? 'active' : ''}`}><Icon size={19} strokeWidth={1.7} />{label}{to === ROUTES.EXPLORE && <ArrowUpRight size={15} />}</NavLink>)}</nav>
    <div className="sidebar-note"><Compass size={28} strokeWidth={1.3} /><h3>{note.title}</h3><p>{note.description}</p><Link to={action.to} onClick={() => setOpen(false)}>{note.link}<ArrowUpRight size={16} /></Link></div>
    <div className="sidebar-account"><span className="avatar">{user?.name?.slice(0, 1).toUpperCase()}</span><div><strong>{partner ? user?.businessName || user?.name : user?.name}</strong><span>{partner ? 'Travel planner' : 'Traveler account'}</span></div><IconButton onClick={() => setConfirming(true)} disabled={loading} aria-label="Log out"><LogOut size={19} /></IconButton></div>
  </>;
  return <div className={`customer-shell ${partner ? 'partner-shell' : ''}`}><a className="skip-link" href="#workspace-content">Skip to content</a><aside className="workspace-sidebar">{sidebar}</aside><Drawer open={open} onClose={() => setOpen(false)} slotProps={{ paper: { className: 'workspace-drawer', sx: { width: 'min(280px, 100%)', backgroundColor: '#fdfcf8' } } }}>{sidebar}</Drawer>
    <div className="workspace-body"><header className="workspace-header"><div className="workspace-breadcrumb"><IconButton className="workspace-menu" aria-label="Open navigation" aria-expanded={open} onClick={() => setOpen(true)}><Menu size={22} /></IconButton><Link to={home}>{partner ? 'Partner workspace' : 'My workspace'}</Link><ChevronRight size={14} /><span>{title}</span></div><Button to={action.to} className="header-plan">{action.label}<ArrowUpRight size={16} /></Button></header>
      <main className="workspace-main" id="workspace-content" tabIndex={-1}><Suspense fallback={<PageLoader />}><Outlet /></Suspense></main>
      <footer className="workspace-footer"><span>{partner ? 'Good people. Extraordinary journeys.' : 'Made for the way you travel.'}</span>{apiConfig.useMock && <span>Demo workspace · sample details only · resets on reload</span>}<Link to={ROUTES.CONTACT}>Need a hand?</Link></footer>
    </div><ConfirmDialog open={confirming} title="See you on the next journey?" message="Signing out clears unfinished form edits. Save your draft before you go." confirmLabel="Log out" onConfirm={signOut} onClose={() => setConfirming(false)} loading={loading} />
  </div>;
}
