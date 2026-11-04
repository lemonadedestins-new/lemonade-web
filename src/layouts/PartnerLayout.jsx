import { LayoutDashboard, MapPinned, FileText, Building2, Settings, Package } from 'lucide-react';
import WorkspaceLayout from './WorkspaceLayout';
import { ROUTES } from '../constants/routes';
import '../features/partner/partner.css';
const navigation = [
  { to: ROUTES.PARTNER, label: 'Overview', icon: LayoutDashboard },
  { to: ROUTES.PARTNER_PACKAGES, label: 'My packages', icon: Package },
  { to: ROUTES.LEADS, label: 'Travel enquiries', icon: MapPinned },
  { to: ROUTES.QUOTES, label: 'My quotes', icon: FileText },
  { to: ROUTES.PARTNER_PROFILE, label: 'Business profile', icon: Building2 },
  { to: ROUTES.PARTNER_SETTINGS, label: 'Settings', icon: Settings },
];
export default function PartnerLayout() {
  return <WorkspaceLayout partner navigation={navigation} home={ROUTES.PARTNER} action={{ to: '/partner/packages/new', label: 'Add a package' }} note={{ title: 'Your expertise. Their next chapter.', description: 'Publish your journeys and connect with travelers who discover them.', link: 'Create your next package' }} />;
}
