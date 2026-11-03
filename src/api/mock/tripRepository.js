import { TRIP_STATUS } from '../../constants/trips.js';
import { normalizeTrip, validateTrip } from '../../features/trips/tripModel.js';
import { TripRequestError } from './mockErrors.js';
import { createPartnerRepository } from './partnerRepository.js';
export { TripRequestError } from './mockErrors.js';
// Only an in-memory API simulation. The real API must independently enforce these rules.
export function createTripRepository(seed = [], { defaultPartnerIds = [] } = {}) {
  const records = new Map(seed.map(trip => [trip.id, structuredClone(trip)]));
  const authorize = user => { if (!user) throw new TripRequestError(401, 'SESSION_EXPIRED'); if (user.role !== 'CUSTOMER') throw new TripRequestError(403, 'FORBIDDEN'); };
  const owned = (user, id) => { authorize(user); const trip = records.get(id); if (!trip || trip.customerId !== user.id) throw new TripRequestError(404, 'TRIP_NOT_FOUND'); return trip; };
  return {
    partner: createPartnerRepository(records),
    list(user) { authorize(user); return structuredClone([...records.values()].filter(trip => trip.customerId === user.id).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))); },
    get(user, id) { return structuredClone(owned(user, id)); },
    save(user, payload, id) {
      authorize(user);
      const existing = id ? owned(user, id) : null;
      if (existing && existing.status !== TRIP_STATUS.DRAFT) throw new TripRequestError(409, 'TRIP_NOT_EDITABLE');
      if (![TRIP_STATUS.DRAFT, TRIP_STATUS.SUBMITTED].includes(payload.status)) throw new TripRequestError(422, 'INVALID_STATUS');
      const values = normalizeTrip(payload);
      const fields = validateTrip(values, { draft: payload.status === TRIP_STATUS.DRAFT });
      if (Object.keys(fields).length) throw new TripRequestError(422, 'INVALID_INPUT', fields);
      const now = new Date().toISOString();
      const submitted = payload.status === TRIP_STATUS.SUBMITTED;
      const event = { id: crypto.randomUUID(), title: submitted ? 'Trip request submitted' : 'Draft saved', detail: submitted ? 'Your travel brief is ready for planner matching.' : 'Your ideas are saved. You can pick up where you left off.', at: now };
      const trip = { ...existing, ...values, id: existing?.id || crypto.randomUUID(), customerId: user.id, status: payload.status, assignedPartnerIds: submitted ? [...defaultPartnerIds] : [], createdAt: existing?.createdAt || now, updatedAt: now, quotes: [], timeline: [...(existing?.timeline || []), event] };
      records.set(trip.id, trip);
      return structuredClone(trip);
    },
  };
}
