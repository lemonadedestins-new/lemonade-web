import test from 'node:test';
import assert from 'node:assert/strict';
import { createTripRepository, TripRequestError } from '../src/api/mock/tripRepository.js';
import { createSampleTrips } from '../src/api/mock/tripSeed.js';
import { DEFAULT_TRIP, TRIP_STATUS } from '../src/constants/trips.js';
import { dateInput, isValidDate, normalizeTrip, validateTrip } from '../src/features/trips/tripModel.js';

const customer = { id: 'customer-1', role: 'CUSTOMER' };
const other = { id: 'customer-2', role: 'CUSTOMER' };
const valid = { ...DEFAULT_TRIP, destination: 'Kashmir', departureCity: 'Chennai', startDate: '2099-06-15', endDate: '2099-06-20', tripType: 'Family', budget: 50000, status: TRIP_STATUS.SUBMITTED };
const rejects = (action, status, code) => assert.throws(action, error => error instanceof TripRequestError && error.status === status && error.code === code);

test('an incomplete draft can be saved, resumed, edited and submitted without changing its identity', () => {
  const repository = createTripRepository();
  const draft = repository.save(customer, { destination: 'Bali', status: TRIP_STATUS.DRAFT });
  assert.equal(draft.status, 'DRAFT');
  assert.equal(repository.get(customer, draft.id).destination, 'Bali');
  const updated = repository.save(customer, { ...draft, notes: 'A quiet escape', status: 'DRAFT' }, draft.id);
  assert.equal(updated.notes, 'A quiet escape');
  const submitted = repository.save(customer, valid, draft.id);
  assert.equal(submitted.id, draft.id);
  assert.equal(submitted.createdAt, draft.createdAt);
  assert.equal(submitted.status, 'SUBMITTED');
  assert.equal(submitted.timeline.at(-1).title, 'Trip request submitted');
  assert.equal(repository.list(customer).length, 1);
  rejects(() => repository.save(customer, valid, draft.id), 409, 'TRIP_NOT_EDITABLE');
});
test('trip ownership is enforced for reads and writes, including forged owner fields', () => {
  const repository = createTripRepository();
  const trip = repository.save(customer, { ...valid, customerId: other.id, id: 'forged', quotes: ['forged'] });
  assert.equal(trip.customerId, customer.id);
  assert.notEqual(trip.id, 'forged');
  assert.deepEqual(trip.quotes, []);
  assert.deepEqual(repository.list(other), []);
  rejects(() => repository.get(other, trip.id), 404, 'TRIP_NOT_FOUND');
  rejects(() => repository.save(other, valid, trip.id), 404, 'TRIP_NOT_FOUND');
});
test('anonymous, partner and administrator accounts cannot access customer trip APIs', () => {
  const repository = createTripRepository();
  rejects(() => repository.list(null), 401, 'SESSION_EXPIRED');
  for (const role of ['BUSINESS_OWNER', 'ADMIN']) {
    const user = { id: 'outsider', role };
    rejects(() => repository.list(user), 403, 'FORBIDDEN');
    rejects(() => repository.save(user, valid), 403, 'FORBIDDEN');
  }
});
test('submission rejects missing fields, invalid counts, budgets and date ordering', () => {
  const repository = createTripRepository();
  for (const changes of [{ destination: '' }, { departureCity: ' ' }, { startDate: '' }, { startDate: '2020-01-01' }, { endDate: '2099-06-10' }, { startDate: '2099-02-30' }, { adults: 0 }, { adults: 1.5 }, { children: -1 }, { children: 21 }, { budget: '' }, { budget: -100 }, { budget: Infinity }, { tripType: 'COUPLE' }, { interests: ['invalid'] }, { notes: 'a'.repeat(1501) }]) {
    rejects(() => repository.save(customer, { ...valid, ...changes }), 422, 'INVALID_INPUT');
  }
  assert.equal(repository.list(customer).length, 0);
});
test('only draft and submitted are valid customer-created statuses', () => {
  const repository = createTripRepository();
  for (const status of ['PLANNER_SELECTED', 'QUOTES_RECEIVED', 'CLOSED', null]) rejects(() => repository.save(customer, { ...valid, status }), 422, 'INVALID_STATUS');
});
test('drafts allow omitted details but reject malformed details that are present', () => {
  assert.deepEqual(validateTrip({ destination: 'Bali' }, { draft: true }), {});
  assert.ok(validateTrip({ destination: '' }, { draft: true }).destination);
  assert.ok(validateTrip({ destination: 'Bali', adults: -1 }, { draft: true }).adults);
  assert.ok(validateTrip({ destination: 'Bali', budget: 'abc' }, { draft: true }).budget);
});
test('normalization removes metadata, trims text and converts form numeric strings', () => {
  const result = normalizeTrip({ ...valid, destination: '  Bali  ', adults: '2', children: '0', budget: '50000', interests: ['Beaches', 'Beaches'] });
  assert.equal(result.destination, 'Bali');
  assert.equal(result.adults, 2);
  assert.equal(result.budget, 50000);
  assert.deepEqual(result.interests, ['Beaches']);
  assert.equal(result.status, undefined);
});
test('dates handle leap years and allow same-day trips', () => {
  assert.equal(isValidDate('2028-02-29'), true);
  assert.equal(isValidDate('2027-02-29'), false);
  assert.equal(isValidDate('2027-13-01'), false);
  assert.deepEqual(validateTrip({ ...valid, startDate: '2099-06-15', endDate: '2099-06-15' }), {});
  assert.equal(dateInput(new Date(2026, 10, 2)), '2026-11-02');
});
test('API responses are detached copies, so editing a response cannot mutate stored trips', () => {
  const repository = createTripRepository();
  const trip = repository.save(customer, valid);
  trip.destination = 'Changed';
  trip.timeline[0].title = 'Changed';
  const listed = repository.list(customer);
  listed[0].interests.push('Beaches');
  assert.equal(repository.get(customer, trip.id).destination, 'Kashmir');
  assert.equal(repository.get(customer, trip.id).timeline[0].title, 'Trip request submitted');
  assert.deepEqual(repository.get(customer, trip.id).interests, []);
});
test('sample trips provide relative upcoming dates, draft recovery and complete quotations', () => {
  const seed = createSampleTrips(new Date(2026, 10, 2));
  const repository = createTripRepository(seed);
  const demo = { id: 'demo-customer', role: 'CUSTOMER' };
  assert.equal(repository.list(demo).length, 3);
  assert.deepEqual(repository.list(customer), []);
  const kashmir = repository.get(demo, 'kashmir-escape');
  assert.equal(kashmir.startDate, '2026-12-07');
  assert.equal(kashmir.quotes.length, 2);
  for (const quote of kashmir.quotes) { assert.equal(quote.itinerary.length, quote.days); assert.ok(quote.inclusions.length); assert.ok(quote.exclusions.length); assert.ok(quote.validUntil > '2026-11-02'); }
  assert.equal(repository.get(demo, 'bali-dream').status, 'DRAFT');
});
