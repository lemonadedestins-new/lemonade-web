import { ROLE_HOME, ROLES } from '../constants/routes';

export function safeReturnPath(value, role) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return null;
  const allowedPrefix = { [ROLES.CUSTOMER]: '/customer/', [ROLES.BUSINESS_OWNER]: '/partner/' }[role];
  if (!allowedPrefix || !value.startsWith(allowedPrefix)) return null;
  const path = value.split(/[?#]/)[0];
  if (role === ROLES.CUSTOMER) return /^\/customer\/(dashboard|profile|settings|packages\/[a-zA-Z0-9-]+\/enquire|trips(?:\/(?:new|[a-zA-Z0-9-]+)(?:\/edit)?)?)$/.test(path) ? value : null;
  if (role === ROLES.BUSINESS_OWNER) return /^\/partner\/(dashboard|profile|settings|packages(?:\/(?:new|[a-zA-Z0-9-]+\/edit))?|leads(?:\/[a-zA-Z0-9-]+(?:\/quotes\/new)?)?|quotes(?:\/[a-zA-Z0-9-]+)?)$/.test(path) ? value : null;
  return path === ROLE_HOME[role] ? value : null;
}
