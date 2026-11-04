import { Outlet, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Sparkles } from 'lucide-react';
import Logo from '../components/common/Logo';
import { HERO_IMAGE } from '../features/home/data/destinations';
import { apiConfig } from '../api/config';
import '../features/auth/auth.css';

export default function AuthLayout() {
  return <><a className="skip-link" href="#main-content">Skip to content</a><div className="auth-layout"><aside className="auth-story"><img src={HERO_IMAGE} alt="Tea plantations on a green hillside in Munnar" className="auth-backdrop" /><div className="auth-story-content"><Logo light /><div className="auth-story-copy"><span className="auth-story-kicker"><Sparkles size={17} /> YOUR NEXT CHAPTER STARTS HERE</span><h2>Somewhere new.<br />Something you.</h2><p>The best journeys aren’t just about where you go. They’re about how they make you feel.</p><span className="auth-location"><MapPin size={16} /> Munnar, Kerala</span></div><p className="auth-story-bottom">A little less planning. A lot more living.</p></div></aside><div className="auth-main"><header className="auth-topbar"><Link to="/" className="text-link"><ArrowLeft size={17} /> Back to home</Link>{apiConfig.useMock && <span className="preview-badge">Interactive preview</span>}</header><div className="auth-mobile-logo"><Logo /></div><main id="main-content" className="auth-content" tabIndex={-1}><Outlet /></main><footer className="auth-footer"><span>© {new Date().getFullYear()} Lemonade Destinations</span><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link></footer></div></div></>;
}
