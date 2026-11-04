import { DEFAULT_TRIP, TRIP_STATUS } from '../../constants/trips.js';
import { packageEndDate, validateEnquiry } from '../../features/packages/packageModel.js';
import { destinationById } from '../../features/home/data/destinations.js';
import { normalizeTrip, validateTrip } from '../../features/trips/tripModel.js';
import { TripRequestError } from './mockErrors.js';
import { createPartnerRepository } from './partnerRepository.js';
export { TripRequestError } from './mockErrors.js';
// Only an in-memory API simulation. The real API must independently enforce these rules.
export function createTripRepository(seed = [], { defaultPartnerIds = [], getPackage, resolvePartnerIds } = {}) {
  const records = new Map(seed.map(trip => [trip.id, structuredClone(trip)]));
  const authorize = user => { if (!user) throw new TripRequestError(401, 'SESSION_EXPIRED'); if (user.role !== 'CUSTOMER') throw new TripRequestError(403, 'FORBIDDEN'); };
  const owned = (user, id) => { authorize(user); const trip = records.get(id); if (!trip || trip.customerId !== user.id) throw new TripRequestError(404, 'TRIP_NOT_FOUND'); return trip; };
  return {
    partner: createPartnerRepository(records),
    list(user) { authorize(user); return structuredClone([...records.values()].filter(trip => trip.customerId === user.id).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))); },
    get(user, id) { return structuredClone(owned(user, id)); },
    enquire(user, packageId, input) {
      authorize(user);
      const fields = validateEnquiry(input);
      if (Object.keys(fields).length) throw new TripRequestError(422, 'INVALID_INPUT', fields);
      const item = getPackage?.(packageId);
      if (!item) throw new TripRequestError(404, 'PACKAGE_NOT_FOUND');
      const now = new Date().toISOString();
      const adults = Number(input.adults);
      const selection = { id: item.id, title: item.title, plannerId: item.plannerId, plannerName: item.planner.businessName, pricePerPerson: item.price, estimatedTotal: item.price * adults, days: item.days, pickupCity: item.pickupCity };
      const trip = { ...DEFAULT_TRIP, id: crypto.randomUUID(), customerId: user.id, destination: destinationById(item.destinationId).name, departureCity: String(input.departureCity).trim(), startDate: input.startDate, endDate: packageEndDate(input.startDate, item.days), adults, children: 0, budget: selection.estimatedTotal, tripType: 'Other', notes: String(input.notes || '').trim(), status: TRIP_STATUS.PLANNERS_ASSIGNED, assignedPartnerIds: [item.plannerId], packageSelection: selection, createdAt: now, updatedAt: now, quotes: [], isSample: true, timeline: [{ id: crypto.randomUUID(), title: 'Package enquiry submitted', detail: `${item.title} · ${item.planner.businessName}. Dates and final price await confirmation.`, at: now }] };
      records.set(trip.id, trip);
      return structuredClone(trip);
    },
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
      const trip = { ...existing, ...values, id: existing?.id || crypto.randomUUID(), customerId: user.id, status: payload.status, assignedPartnerIds: submitted ? [...(resolvePartnerIds?.(values.destination) || defaultPartnerIds)] : [], createdAt: existing?.createdAt || now, updatedAt: now, quotes: [], timeline: [...(existing?.timeline || []), event] };
      records.set(trip.id, trip);
      return structuredClone(trip);
    },
  };
}
