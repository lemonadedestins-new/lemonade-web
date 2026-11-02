import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const titles = { '/': 'Travel your way', '/explore': 'Explore destinations', '/login': 'Welcome back', '/register': 'Create your account', '/forgot-password': 'Reset your password', '/about': 'Our story', '/contact': 'Help & contact', '/privacy': 'Privacy', '/terms': 'Terms of use', '/customer/dashboard': 'Welcome aboard', '/partner/dashboard': 'Welcome, travel partner' };
export default function RouteEffects() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    document.title = `${titles[pathname] || 'Page not found'} · Lemonade Destinations`;
    const frame = requestAnimationFrame(() => {
      if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
      else window.scrollTo({ top: 0, behavior: 'instant' });
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash]);
  return null;
}
