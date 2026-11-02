import { ROLE_HOME, ROLES } from '../constants/routes';

export function safeReturnPath(value, role) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return null;
  const allowedPrefix = { [ROLES.CUSTOMER]: '/customer/', [ROLES.BUSINESS_OWNER]: '/partner/' }[role];
  if (!allowedPrefix || !value.startsWith(allowedPrefix)) return null;
  // Phase 1 exposes only the account entry route; later phases can expand this allowlist.
  return value.split(/[?#]/)[0] === ROLE_HOME[role] ? value : null;
}
