import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CircleCheck, UserRound, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../../../store/notificationStore';
import { apiConfig } from '../../../api/config';
import { getErrorMessage } from '../../../api/errors';
import { ROLE_LABELS } from '../../../constants/routes';
import Button from '../../../components/common/Button';
import { ConfirmDialog } from '../../../components/common/Feedback';
import '../auth.css';

export default function AccountReadyPage() {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const loading = useAuthStore(state => state.loading);
  const notify = useNotificationStore(state => state.notify);
  const [confirming, setConfirming] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  async function handleLogout() {
    try { await logout(); notify('You’ve been logged out. See you on the next journey.'); }
    catch (error) { notify(`You’re signed out on this page. ${getErrorMessage(error)}`, 'warning'); }
    finally { navigate('/login', { replace: true }); }
  }
  return <section className="container account-page"><div className="account-card fade-in"><CircleCheck size={39} strokeWidth={1.3} /><p className="eyebrow" style={{ marginTop: 22 }}>YOU’RE IN GOOD COMPANY</p><h1>Welcome aboard, {user.name.split(' ')[0]}.</h1><p>Your {ROLE_LABELS[user.role].toLowerCase()} account is ready.{location.state?.destination ? ` We’re glad ${location.state.destination} has caught your eye.` : ' This is the beginning of something good.'}</p><div className="account-identity"><span className="account-avatar"><UserRound size={22} /></span><div><strong>{user.name} · {ROLE_LABELS[user.role]}</strong><small>{user.email}</small></div></div><p>We’re putting the finishing touches on your planning space. In the meantime, there’s a whole world of inspiration to explore.</p>{apiConfig.useMock && <p className="account-preview-note">The travel planner workspace is coming in the next phase. Your preview account resets when this page reloads.</p>}<div className="account-actions"><Button to="/explore" arrow>Explore destinations</Button><Button variant="outline" onClick={() => setConfirming(true)}><LogOut size={16} /> Log out</Button></div></div><ConfirmDialog open={confirming} title="See you on the next journey?" message="You’ll be logged out of your account on this page." confirmLabel="Log out" onConfirm={handleLogout} onClose={() => setConfirming(false)} loading={loading} /></section>;
}
