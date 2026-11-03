import { Compass, LayoutDashboard, Settings, Luggage, UserRound } from 'lucide-react';
import WorkspaceLayout from './WorkspaceLayout';
import { ROUTES } from '../constants/routes';
const navigation = [
  { to: ROUTES.CUSTOMER, label: 'Overview', icon: LayoutDashboard },
  { to: ROUTES.TRIPS, label: 'My trips', icon: Luggage },
  { to: ROUTES.EXPLORE, label: 'Find inspiration', icon: Compass },
  { to: ROUTES.PROFILE, label: 'My profile', icon: UserRound },
  { to: ROUTES.SETTINGS, label: 'Settings', icon: Settings },
];
export default function CustomerLayout() {
  return <WorkspaceLayout navigation={navigation} home={ROUTES.CUSTOMER} action={{ to: ROUTES.NEW_TRIP, label: 'Plan a trip' }} note={{ title: 'A trip that feels like you.', description: 'A little inspiration is all it takes to get started.', link: 'Let’s plan something' }} />;
}