import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const titles = { '/': 'Travel your way', '/explore': 'South India packages', '/packages': 'South India packages', '/partner/packages': 'My packages', '/partner/packages/new': 'Create a package', '/login': 'Welcome back', '/register': 'Create your account', '/forgot-password': 'Reset your password', '/about': 'Our story', '/contact': 'Help & contact', '/privacy': 'Privacy', '/terms': 'Terms of use', '/customer/dashboard': 'Welcome aboard', '/customer/trips': 'My trips', '/customer/trips/new': 'Plan a trip', '/customer/profile': 'My profile', '/customer/settings': 'Preferences', '/partner/dashboard': 'Planner overview', '/partner/leads': 'Travel enquiries', '/partner/quotes': 'My quotes', '/partner/profile': 'Business profile', '/partner/settings': 'Quote defaults' };
function pageTitle(pathname) {
  if (titles[pathname]) return titles[pathname];
  if (/^\/packages\/[^/]+$/.test(pathname)) return 'Travel package';
  if (/^\/planners\/[^/]+$/.test(pathname)) return 'Meet your planner';
  if (/^\/customer\/packages\/[^/]+\/enquire$/.test(pathname)) return 'Package enquiry';
  if (/^\/partner\/packages\/[^/]+\/edit$/.test(pathname)) return 'Edit package';
  if (/^\/partner\/leads\/[^/]+\/quotes\/new$/.test(pathname)) return 'Create a quote';
  if (/^\/partner\/leads\/[^/]+$/.test(pathname)) return 'Travel brief';
  if (/^\/partner\/quotes\/[^/]+$/.test(pathname)) return 'Your proposal';
  if (/^\/customer\/trips\/[^/]+\/edit$/.test(pathname)) return 'Edit your draft';
  if (/^\/customer\/trips\/[^/]+$/.test(pathname)) return 'Your trip';
  return 'Page not found';
}
export default function RouteEffects() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    document.title = `${pageTitle(pathname)} · Lemonade Destinations`;
    const frame = requestAnimationFrame(() => {
      if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
      else {
        window.scrollTo(0, 0);
        document.querySelector('main#main-content, main#workspace-content')?.focus({ preventScroll: true });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash]);
  return null;
}
