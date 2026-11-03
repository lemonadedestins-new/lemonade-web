import { AxiosError } from 'axios';
import { ROLES } from '../../constants/routes';
import { createTripRepository, TripRequestError } from './tripRepository';
import { createSampleTrips } from './tripSeed';
import { ACCOMMODATIONS, TRANSPORT } from '../../constants/trips';
import { createPartnerSeeds } from './partnerSeed';
import { normalizePartnerProfile, validatePartnerProfile, validatePartnerSettings } from '../../features/partner/partnerModel';

const trips = createTripRepository([...createSampleTrips(), ...createPartnerSeeds()], { defaultPartnerIds: ['demo-partner'] });

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
    addAccount({ id: 'demo-partner', name: 'Maya Sharma', businessName: 'Valley & Beyond', city: 'Srinagar', specialties: 'Kashmir, Kerala & island escapes', description: 'Thoughtful journeys, local connections, and room to explore at your own pace.', email: 'partner@lemonade.demo', role: ROLES.BUSINESS_OWNER, partnerSettings: { validityDays: 7, defaultTerms: 'Availability is subject to confirmation. Please request cancellation terms before booking.' } }, 'TravelDemo1!'),
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
    if (!account || userId !== currentUserId) return fail(config, 401, 'SESSION_EXPIRED');
    return response(config, { user: { ...account.user } });
  }
  if (path.startsWith('/customer/')) {
    const userId = tokens.get(String(config.headers.Authorization || '').replace('Bearer ', ''));
    const account = [...accounts.values()].find(item => item.user.id === userId);
    if (!account || userId !== currentUserId) return fail(config, 401, 'SESSION_EXPIRED');
    if (account.user.role !== ROLES.CUSTOMER) return fail(config, 403, 'FORBIDDEN');
    if (path === '/customer/profile' && config.method === 'patch') {
      const name = String(data.name || '').trim();
      const homeCity = String(data.homeCity || '').trim();
      if (name.length < 2 || name.length > 80 || homeCity.length > 100) return fail(config, 422, 'INVALID_INPUT');
      account.user = { ...account.user, name, homeCity };
      return response(config, { user: { ...account.user } });
    }
    if (path === '/customer/preferences' && config.method === 'patch') {
      if (!ACCOMMODATIONS.includes(data.accommodation) || !TRANSPORT.includes(data.transportation)) return fail(config, 422, 'INVALID_INPUT');
      account.user = { ...account.user, preferences: { accommodation: data.accommodation, transportation: data.transportation } };
      return response(config, { user: { ...account.user } });
    }
  }
  if (path.startsWith('/partner/')) {
    const userId = tokens.get(String(config.headers.Authorization || '').replace('Bearer ', ''));
    const account = [...accounts.values()].find(item => item.user.id === userId);
    if (!account || userId !== currentUserId) return fail(config, 401, 'SESSION_EXPIRED');
    if (account.user.role !== ROLES.BUSINESS_OWNER) return fail(config, 403, 'FORBIDDEN');
    const user = account.user;
    try {
      if (path === '/partner/profile' && config.method === 'patch') {
        const values = normalizePartnerProfile(data);
        const fields = validatePartnerProfile(values);
        if (Object.keys(fields).length) throw new TripRequestError(422, 'INVALID_INPUT', fields);
        account.user = { ...user, ...values };
        return response(config, { user: { ...account.user } });
      }
      if (path === '/partner/settings' && config.method === 'patch') {
        const values = { validityDays: Number(data.validityDays), defaultTerms: String(data.defaultTerms || '').trim() };
        const fields = validatePartnerSettings(values);
        if (Object.keys(fields).length) throw new TripRequestError(422, 'INVALID_INPUT', fields);
        account.user = { ...user, partnerSettings: values };
        return response(config, { user: { ...account.user } });
      }
      if (path === '/partner/leads' && config.method === 'get') return response(config, { leads: trips.partner.listLeads(user) });
      if (path === '/partner/quotes' && config.method === 'get') return response(config, { quotes: trips.partner.listQuotes(user) });
      const lead = path.match(/^\/partner\/leads\/([^/]+)$/);
      if (lead && config.method === 'get') return response(config, { lead: trips.partner.getLead(user, decodeURIComponent(lead[1])) });
      const create = path.match(/^\/partner\/leads\/([^/]+)\/quotes$/);
      if (create && config.method === 'post') return response(config, { quote: trips.partner.saveQuote(user, decodeURIComponent(create[1]), data) }, 201);
      const quote = path.match(/^\/partner\/quotes\/([^/]+)$/);
      if (quote && config.method === 'get') return response(config, { quote: trips.partner.getQuote(user, decodeURIComponent(quote[1])) });
      if (quote && config.method === 'patch') {
        const existing = trips.partner.getQuote(user, decodeURIComponent(quote[1]));
        return response(config, { quote: trips.partner.saveQuote(user, existing.leadId, data, existing.id) });
      }
      const withdraw = path.match(/^\/partner\/quotes\/([^/]+)\/withdraw$/);
      if (withdraw && config.method === 'post') return response(config, { quote: trips.partner.withdrawQuote(user, decodeURIComponent(withdraw[1])) });
    } catch (error) {
      if (!(error instanceof TripRequestError)) throw error;
      throw new AxiosError('Request failed', AxiosError.ERR_BAD_REQUEST, config, {}, response(config, { code: error.code, fields: error.fields }, error.status));
    }
  }
  if (path.startsWith('/trips')) {
    const userId = tokens.get(String(config.headers.Authorization || '').replace('Bearer ', ''));
    const user = [...accounts.values()].find(item => item.user.id === userId)?.user;
    if (!user || user.id !== currentUserId) return fail(config, 401, 'SESSION_EXPIRED');
    try {
      if (path === '/trips' && config.method === 'get') return response(config, { trips: trips.list(user) });
      if (path === '/trips' && config.method === 'post') return response(config, { trip: trips.save(user, data) }, 201);
      const match = path.match(/^\/trips\/([^/]+)$/);
      if (match && config.method === 'get') return response(config, { trip: trips.get(user, decodeURIComponent(match[1])) });
      if (match && config.method === 'patch') return response(config, { trip: trips.save(user, data, decodeURIComponent(match[1])) });
    } catch (error) {
      if (!(error instanceof TripRequestError)) throw error;
      throw new AxiosError('Request failed', AxiosError.ERR_BAD_REQUEST, config, {}, response(config, { code: error.code, fields: error.fields }, error.status));
    }
  }
  return fail(config, 404, 'NOT_FOUND');
}
