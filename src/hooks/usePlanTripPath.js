import { useAuthStore } from '../features/auth/store/authStore';
import { ROLES, ROUTES, ROLE_HOME, registrationPath } from '../constants/routes';

export function usePlanTripPath(destination) {
  const role = useAuthStore(state => state.role);
  if (role === ROLES.CUSTOMER) return `${ROUTES.NEW_TRIP}${destination ? `?destination=${encodeURIComponent(destination)}` : ''}`;
  return role ? ROLE_HOME[role] : registrationPath(ROLES.CUSTOMER, destination);
}
