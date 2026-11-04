import test from 'node:test';
import assert from 'node:assert/strict';
import { createPackageRepository } from '../src/api/mock/packageRepository.js';
import { createPackageSeeds, samplePlanners } from '../src/api/mock/packageSeed.js';
import { createTripRepository } from '../src/api/mock/tripRepository.js';
import { filterPackages, normalizePackage, validatePackage } from '../src/features/packages/packageModel.js';

const customer = { id: 'traveler', role: 'CUSTOMER' };
const planner = { ...samplePlanners[0], role: 'BUSINESS_OWNER' };
const otherPlanner = { ...samplePlanners[1], role: 'BUSINESS_OWNER' };

test('South India package catalog exposes destination and planner choices', () => {
  const repository = createPackageRepository(createPackageSeeds(), samplePlanners);
  const all = repository.list();
  assert.equal(all.length, 12);
  assert.equal(all.filter(item => item.destinationId === 'munnar').length, 3);
  assert.equal(new Set(all.filter(item => item.destinationId === 'munnar').map(item => item.planner.id)).size, 3);
  assert.equal(repository.planner('demo-partner').packages.length, 2);
  assert.equal(repository.get('munnar-tea-trails').planner.businessName, 'Green Trail Holidays');
  assert.deepEqual(filterPackages(all, { destination: 'munnar', maxPrice: '12000' }).map(item => item.id), ['munnar-tea-trails', 'munnar-scenic-escape']);
});

test('package listings are private to their planner and published catalog hides drafts', () => {
  const repository = createPackageRepository(createPackageSeeds(), samplePlanners);
  assert.deepEqual(repository.listOwned(otherPlanner).map(item => item.id), ['munnar-estate-retreat', 'alleppey-waterways']);
  assert.throws(() => repository.getOwned(otherPlanner, 'munnar-tea-trails'), error => error.status === 404 && error.code === 'PACKAGE_NOT_FOUND');
  const draft = repository.save(planner, { title: 'Munnar draft', destinationId: 'munnar', status: 'DRAFT' });
  assert.equal(repository.list().some(item => item.id === draft.id), false);
  assert.equal(repository.getOwned(planner, draft.id).status, 'DRAFT');
});

test('published package validation and customer enquiries preserve selected package details', () => {
  const seed = createPackageSeeds();
  const packages = createPackageRepository(seed, samplePlanners);
  const item = packages.get('munnar-tea-trails');
  assert.deepEqual(validatePackage(item), {});
  assert.ok(validatePackage({ ...item, price: 0 }).price);
  assert.equal(normalizePackage({ ...item, price: '9000', inclusions: 'Stay\nBreakfast' }).price, 9000);
  const trips = createTripRepository([], { getPackage: id => packages.get(id) });
  const trip = trips.enquire(customer, item.id, { startDate: '2099-06-10', adults: 2, departureCity: 'Chennai', notes: 'Vegetarian breakfast, please.' });
  assert.equal(trip.destination, 'Munnar');
  assert.equal(trip.packageSelection.title, item.title);
  assert.equal(trip.packageSelection.plannerId, item.planner.id);
  assert.equal(trip.budget, item.price * 2);
  assert.equal(trip.endDate, '2099-06-12');
  assert.equal(trip.status, 'PLANNERS_ASSIGNED');
  const lead = trips.partner.getLead(planner, trip.id);
  assert.equal(lead.packageSelection.title, item.title);
  assert.equal(lead.packageSelection.pricePerPerson, item.price);
  assert.equal(lead.customerId, undefined);
});
