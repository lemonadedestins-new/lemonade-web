import test from 'node:test';
import assert from 'node:assert/strict';
import { createTripRepository, TripRequestError } from '../src/api/mock/tripRepository.js';
import { createSampleTrips } from '../src/api/mock/tripSeed.js';
import { createPartnerSeeds } from '../src/api/mock/partnerSeed.js';
import { createPartnerRepository } from '../src/api/mock/partnerRepository.js';
import { DEFAULT_TRIP } from '../src/constants/trips.js';
import { normalizeQuote, quoteStatus, validateQuote } from '../src/features/quotes/quoteModel.js';
import { normalizePartnerProfile, validatePartnerSettings } from '../src/features/partner/partnerModel.js';

const customer = { id: 'traveler', role: 'CUSTOMER' };
const partner = { id: 'planner', role: 'BUSINESS_OWNER', name: 'Test Planner', businessName: 'Test Journeys' };
const another = { ...partner, id: 'other-planner' };
const demo = { ...partner, id: 'demo-partner' };
const tripInput = { ...DEFAULT_TRIP, destination: 'Munnar', departureCity: 'Chennai', startDate: '2099-06-15', endDate: '2099-06-17', budget: 90000, tripType: 'Family', status: 'SUBMITTED' };
const quoteInput = { title: 'Three days of Munnar', price: 84000, days: 3, nights: 2, accommodation: 'Two nights at a boutique hotel in Ubud', transportation: 'Private transfers throughout the trip', meals: 'Breakfast daily', activities: 'Rice terrace walk and a local cooking class', inclusions: ['Hotel stays', 'Transfers and activities', 'Applicable taxes'], exclusions: ['Flights', 'Travel insurance'], terms: 'Subject to availability. Cancellation terms to be confirmed before booking.', validUntil: '2099-06-10', notes: '', itinerary: [1, 2, 3].map(day => ({ day, title: `Day ${day} in Munnar`, description: 'A relaxed day with local sightseeing and time to explore.' })), status: 'SUBMITTED' };
function fixture() { const repository = createTripRepository([], { defaultPartnerIds: [partner.id] }); return { repository, trip: repository.save(customer, tripInput) }; }
const rejects = (action, status, code) => assert.throws(action, error => error instanceof TripRequestError && error.status === status && error.code === code);

test('only assigned planners can see leads; private customer and competing quote data are omitted', () => {
  const { repository, trip } = fixture();
  const lead = repository.partner.getLead(partner, trip.id);
  assert.equal(lead.destination, 'Munnar');
  assert.equal(lead.status, 'NEW');
  for (const field of ['customerId', 'assignedPartnerIds', 'quotes', 'timeline']) assert.equal(lead[field], undefined);
  assert.deepEqual(repository.partner.listLeads(another), []);
  rejects(() => repository.partner.getLead(another, trip.id), 404, 'LEAD_NOT_FOUND');
  rejects(() => repository.partner.listLeads(customer), 403, 'FORBIDDEN');
  rejects(() => repository.partner.listLeads(null), 401, 'SESSION_EXPIRED');
});
test('customer drafts never become leads, even when a seeded assignment exists', () => {
  const repository = createTripRepository(createSampleTrips());
  assert.ok(!repository.partner.listLeads(demo).some(lead => lead.id === 'coorg-dream'));
  rejects(() => repository.partner.getLead(demo, 'coorg-dream'), 404, 'LEAD_NOT_FOUND');
});
test('quote drafts stay private and can be resumed, then publish once to the same customer trip', () => {
  const { repository, trip } = fixture();
  const draft = repository.partner.saveQuote(partner, trip.id, { title: 'A new idea', status: 'DRAFT' });
  assert.equal(repository.partner.getLead(partner, trip.id).status, 'DRAFT');
  assert.deepEqual(repository.get(customer, trip.id).quotes, []);
  const quote = repository.partner.saveQuote(partner, trip.id, { ...quoteInput, partnerId: another.id, plannerName: 'Forged', id: 'forged', leadId: 'forged' }, draft.id);
  assert.equal(quote.id, draft.id);
  assert.equal(quote.partnerId, partner.id);
  assert.equal(quote.plannerName, partner.businessName);
  assert.equal(quote.leadId, trip.id);
  assert.equal(repository.partner.getLead(partner, trip.id).canQuote, false);
  const updated = repository.get(customer, trip.id);
  assert.equal(updated.status, 'QUOTES_RECEIVED');
  assert.equal(updated.quotes.length, 1);
  assert.equal(updated.quotes[0].id, quote.id);
  assert.equal(updated.timeline.at(-1).title, 'A new planner proposal');
  rejects(() => repository.partner.saveQuote(partner, trip.id, quoteInput, draft.id), 409, 'QUOTE_EXISTS');
  rejects(() => repository.partner.saveQuote(partner, trip.id, quoteInput), 409, 'QUOTE_EXISTS');
});
test('quote ownership and lead assignment are enforced on reads, edits and withdrawals', () => {
  const { repository, trip } = fixture();
  const quote = repository.partner.saveQuote(partner, trip.id, quoteInput);
  assert.deepEqual(repository.partner.listQuotes(another), []);
  rejects(() => repository.partner.getQuote(another, quote.id), 404, 'QUOTE_NOT_FOUND');
  rejects(() => repository.partner.withdrawQuote(another, quote.id), 404, 'QUOTE_NOT_FOUND');
  rejects(() => repository.partner.saveQuote(another, trip.id, quoteInput, quote.id), 404, 'LEAD_NOT_FOUND');
  rejects(() => repository.partner.getQuote(customer, quote.id), 403, 'FORBIDDEN');
});
test('withdrawal updates the customer quote list and timeline while keeping the planner record', () => {
  const { repository, trip } = fixture();
  const quote = repository.partner.saveQuote(partner, trip.id, quoteInput);
  repository.partner.withdrawQuote(partner, quote.id);
  assert.equal(repository.partner.getQuote(partner, quote.id).status, 'WITHDRAWN');
  assert.equal(repository.get(customer, trip.id).quotes.length, 0);
  assert.equal(repository.get(customer, trip.id).status, 'PLANNERS_ASSIGNED');
  assert.equal(repository.get(customer, trip.id).timeline.at(-1).title, 'Proposal withdrawn');
  rejects(() => repository.partner.withdrawQuote(partner, quote.id), 409, 'QUOTE_NOT_WITHDRAWABLE');
});
test('closed, past and planner-selected trips reject new proposals, and accepted quotes cannot be withdrawn', () => {
  for (const status of ['CLOSED', 'CANCELLED', 'PLANNER_SELECTED']) {
    const repository = createTripRepository([{ ...tripInput, id: 'closed', status, assignedPartnerIds: [partner.id], quotes: [], timeline: [] }]);
    rejects(() => repository.partner.saveQuote(partner, 'closed', quoteInput), 409, 'LEAD_CLOSED');
  }
  const past = createTripRepository([{ ...tripInput, id: 'past', startDate: '2020-01-01', assignedPartnerIds: [partner.id], quotes: [], timeline: [] }]);
  rejects(() => past.partner.saveQuote(partner, 'past', quoteInput), 409, 'LEAD_CLOSED');
  const seeded = createTripRepository(createSampleTrips());
  assert.equal(seeded.partner.getQuote(demo, 'quote-kerala').status, 'ACCEPTED');
  rejects(() => seeded.partner.withdrawQuote(demo, 'quote-kerala'), 409, 'QUOTE_NOT_WITHDRAWABLE');
});
test('quote validation covers prices, dates, duration consistency, itinerary content and bounded text', () => {
  assert.deepEqual(validateQuote(quoteInput, { tripStart: tripInput.startDate }), {});
  for (const changes of [{ title: '' }, { price: 0 }, { price: NaN }, { price: Infinity }, { price: 10000001 }, { days: 2.5 }, { nights: 3 }, { days: 4 }, { itinerary: [] }, { itinerary: [{ title: 'No', description: 'Short' }] }, { validUntil: '2020-01-01' }, { validUntil: '2099-06-20' }, { validUntil: '2099-02-30' }, { accommodation: '' }, { meals: '' }, { activities: '' }, { terms: '' }, { inclusions: [] }, { exclusions: [] }, { notes: 'x'.repeat(2001) }]) {
    assert.ok(Object.keys(validateQuote({ ...quoteInput, ...changes }, { tripStart: tripInput.startDate })).length, JSON.stringify(changes));
  }
  assert.deepEqual(validateQuote({ title: 'Just an idea' }, { draft: true }), {});
});
test('itinerary normalization renumbers removed days and converts multiline inclusions', () => {
  const quote = normalizeQuote({ ...quoteInput, price: '10000', inclusions: '  Breakfast \n\n Transfers  ', itinerary: [{ day: 1, title: 'Arrival', description: 'A warm welcome' }, { day: 3, title: 'Departure', description: 'Until next time' }] });
  assert.equal(quote.price, 10000);
  assert.deepEqual(quote.inclusions, ['Breakfast', 'Transfers']);
  assert.deepEqual(quote.itinerary.map(day => day.day), [1, 2]);
  assert.equal(quote.status, undefined);
});
test('expiration is derived without changing accepted or withdrawn quote states', () => {
  assert.equal(quoteStatus({ status: 'SUBMITTED', validUntil: '2026-11-01' }, '2026-11-02'), 'EXPIRED');
  assert.equal(quoteStatus({ status: 'SUBMITTED', validUntil: '2026-11-02' }, '2026-11-02'), 'SUBMITTED');
  assert.equal(quoteStatus({ status: 'ACCEPTED', validUntil: '2026-11-01' }, '2026-11-02'), 'ACCEPTED');
});
test('drafts become read-only when an assigned enquiry closes', () => {
  const records = new Map([['closing-trip', { ...tripInput, id: 'closing-trip', assignedPartnerIds: [partner.id], quotes: [], timeline: [] }]]);
  const repository = createPartnerRepository(records);
  const draft = repository.saveQuote(partner, 'closing-trip', { title: 'An unfinished idea', status: 'DRAFT' });
  assert.equal(draft.canEdit, true);
  records.get('closing-trip').status = 'CLOSED';
  assert.equal(repository.getQuote(partner, draft.id).canEdit, false);
  assert.equal(repository.getLead(partner, 'closing-trip').canQuote, false);
  rejects(() => repository.saveQuote(partner, 'closing-trip', quoteInput, draft.id), 409, 'LEAD_CLOSED');
});
test('responses are detached, and seeded planner data contains new, quoted and accepted work', () => {
  const repository = createTripRepository([...createSampleTrips(), ...createPartnerSeeds()]);
  const leads = repository.partner.listLeads(demo);
  assert.equal(leads.length, 5);
  assert.equal(leads.filter(lead => lead.status === 'NEW').length, 3);
  const quote = repository.partner.getQuote(demo, 'quote-valley');
  quote.itinerary[0].title = 'Changed';
  assert.notEqual(repository.partner.getQuote(demo, 'quote-valley').itinerary[0].title, 'Changed');
  assert.equal(repository.partner.listQuotes(demo).length, 2);
});
test('business profile inputs cannot alter identity or role, and settings are bounded', () => {
  const values = normalizePartnerProfile({ name: ' Maya ', businessName: ' Valley ', city: ' Kochi ', role: 'ADMIN', email: 'forged' });
  assert.equal(values.name, 'Maya');
  assert.equal(values.role, undefined);
  assert.equal(values.email, undefined);
  for (const validityDays of [0, 31, 1.5, 'abc']) assert.ok(validatePartnerSettings({ validityDays }).validityDays);
  assert.deepEqual(validatePartnerSettings({ validityDays: 7, defaultTerms: '' }), {});
});
