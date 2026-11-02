import { AxiosError } from 'axios';
import { ROLES } from '../../constants/routes';

// Deliberately ephemeral: mock accounts, password digests, and sessions reset on reload.
// This is a simulation, never a production identity store or authorization boundary.
const accounts = new Map();
const tokens = new Map();
let currentUserId = null;
let seedPromise;
const delay = () => new Promise(resolve => setTimeout(resolve, import.meta.env.MODE === 'test' ? 0 : 450));
const digest = async (password, salt) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${salt}:${password}`))), value => value.toString(16).padStart(2, '0')).join('');

async function addAccount(user, password) {
  const salt = crypto.randomUUID();
  accounts.set(user.email, { user, salt, digest: await digest(password, salt) });
}
async function seed() {
  if (!seedPromise) seedPromise = Promise.all([
    addAccount({ id: 'demo-customer', name: 'Alex Morgan', email: 'customer@lemonade.demo', role: ROLES.CUSTOMER }, 'TravelDemo1!'),
    addAccount({ id: 'demo-partner', name: 'Maya Sharma', email: 'partner@lemonade.demo', role: ROLES.BUSINESS_OWNER }, 'TravelDemo1!'),
  ]);
  return seedPromise;
}
function session(user) {
  const accessToken = `mock-${crypto.randomUUID()}`;
  tokens.set(accessToken, user.id);
  currentUserId = user.id;
  return { user: { ...user }, accessToken };
}
function response(config, data, status = 200) { return { data, status, statusText: 'OK', headers: {}, config, request: {} }; }
function fail(config, status, code) { throw new AxiosError('Request failed', AxiosError.ERR_BAD_REQUEST, config, {}, response(config, { code }, status)); }

export async function mockAdapter(config) {
  await seed();
  await delay();
  if (config.signal?.aborted) throw new AxiosError('Cancelled', 'ERR_CANCELED', config);
  const path = config.url;
  const data = typeof config.data === 'string' ? JSON.parse(config.data) : config.data || {};
  const email = String(data.email || '').trim().toLowerCase();
  if (path === '/auth/login' && config.method === 'post') {
    const account = accounts.get(email);
    if (!account || await digest(String(data.password || ''), account.salt) !== account.digest) return fail(config, 401, 'INVALID_CREDENTIALS');
    return response(config, session(account.user));
  }
  if (path === '/auth/register' && config.method === 'post') {
    if (!String(data.name || '').trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || String(data.password || '').length < 8 || ![ROLES.CUSTOMER, ROLES.BUSINESS_OWNER].includes(data.role)) return fail(config, 422, 'INVALID_INPUT');
    if (accounts.has(email)) return fail(config, 409, 'EMAIL_EXISTS');
    const user = { id: crypto.randomUUID(), name: data.name.trim(), email, role: data.role };
    await addAccount(user, data.password);
    return response(config, session(user), 201);
  }
  if (path === '/auth/refresh' && config.method === 'post') {
    const account = [...accounts.values()].find(item => item.user.id === currentUserId);
    if (!account) return fail(config, 401, 'SESSION_EXPIRED');
    return response(config, session(account.user));
  }
  if (path === '/auth/logout' && config.method === 'post') {
    currentUserId = null;
    tokens.clear();
    return response(config, { success: true });
  }
  if (path === '/auth/forgot-password' && config.method === 'post') {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail(config, 422, 'INVALID_INPUT');
    return response(config, { success: true });
  }
  if (path === '/auth/me' && config.method === 'get') {
    const userId = tokens.get(String(config.headers.Authorization || '').replace('Bearer ', ''));
    const account = [...accounts.values()].find(item => item.user.id === userId);
    if (!account || !currentUserId) return fail(config, 401, 'SESSION_EXPIRED');
    return response(config, { user: { ...account.user } });
  }
  return fail(config, 404, 'NOT_FOUND');
}
