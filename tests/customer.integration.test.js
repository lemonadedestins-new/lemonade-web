import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';

test('customer services and authentication boundaries integrate', async t => {
  const server = await createServer({ configFile: false, mode: 'test', server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] }, define: { 'import.meta.env.VITE_USE_MOCK_API': '"true"' } });
  t.after(() => server.close());
  const { useAuthStore: auth } = await server.ssrLoadModule('/src/features/auth/store/authStore.js');
  const { useTripStore: trips } = await server.ssrLoadModule('/src/features/trips/store/tripStore.js');
  const { tripApi } = await server.ssrLoadModule('/src/api/tripApi.js');
  const { customerApi } = await server.ssrLoadModule('/src/api/customerApi.js');
  const { safeReturnPath } = await server.ssrLoadModule('/src/utils/navigation.js');
  const sampleLogin = () => auth.getState().login({ email: 'customer@lemonade.demo', password: 'TravelDemo1!' });

  await t.test('demo login loads owner-scoped sample trips and complete quotes through Axios', async () => {
    await sampleLogin();
    await trips.getState().loadTrips();
    assert.equal(trips.getState().loaded, true);
    assert.equal(trips.getState().trips.length, 3);
    const trip = await tripApi.get('munnar-escape');
    assert.equal(trip.quotes.length, 2);
    assert.equal(trip.quotes[0].itinerary.length, 5);
    assert.equal(trip.quotes[0].plannerName, 'Green Trail Holidays');
  });
  await t.test('drafts resume and submit once, with field validation errors preserved', async () => {
    const draft = await trips.getState().saveTrip({ destination: 'Alleppey', status: 'DRAFT' });
    assert.equal((await tripApi.get(draft.id)).destination, 'Alleppey');
    await assert.rejects(tripApi.update(draft.id, { ...draft, status: 'SUBMITTED' }), error => error.response.status === 422 && !!error.response.data.fields.startDate);
    const submitted = await trips.getState().saveTrip({ ...draft, departureCity: 'Chennai', startDate: '2099-06-15', endDate: '2099-06-20', budget: 50000, tripType: 'Family', status: 'SUBMITTED' }, draft.id);
    assert.equal(submitted.status, 'SUBMITTED');
    assert.equal(trips.getState().trips.filter(item => item.id === draft.id).length, 1);
    await assert.rejects(tripApi.update(draft.id, { ...submitted, status: 'DRAFT' }), error => error.response.status === 409);
  });
  await t.test('profile and preferences update without allowing role escalation', async () => {
    await customerApi.updateProfile({ name: 'Alex Sample', homeCity: 'Chennai', role: 'ADMIN' });
    await customerApi.updatePreferences({ accommodation: 'Boutique stay', transportation: 'Private car' });
    const { authApi } = await server.ssrLoadModule('/src/api/authApi.js');
    const user = await authApi.me();
    assert.equal(user.role, 'CUSTOMER');
    assert.equal(user.homeCity, 'Chennai');
    assert.equal(user.preferences.accommodation, 'Boutique stay');
  });
  await t.test('logout clears customer caches and unfinished form values', async () => {
    trips.getState().rememberDraft('new', { destination: 'Private draft' });
    await auth.getState().logout();
    assert.deepEqual(trips.getState().trips, []);
    assert.deepEqual(trips.getState().formDrafts, {});
    assert.equal(trips.getState().loaded, false);
  });
  await t.test('new accounts start empty and cannot read another account’s trips', async () => {
    await auth.getState().register({ name: 'Test Traveler', email: 'test-traveler@example.test', password: 'TravelDemo1!', role: 'CUSTOMER' });
    await trips.getState().loadTrips();
    assert.deepEqual(trips.getState().trips, []);
    await assert.rejects(tripApi.get('munnar-escape'), error => error.response.status === 404);
    await auth.getState().logout();
  });
  await t.test('late responses cannot repopulate the store after logout', async () => {
    await sampleLogin();
    const originalList = tripApi.list;
    let resolve;
    tripApi.list = () => new Promise(done => { resolve = done; });
    try {
      const pending = trips.getState().loadTrips(true);
      await auth.getState().logout();
      resolve([{ id: 'late-private-trip' }]);
      await pending;
      assert.deepEqual(trips.getState().trips, []);
      assert.equal(trips.getState().loaded, false);
    } finally { tripApi.list = originalList; }
  });
  await t.test('partner logins cannot use customer trip or profile endpoints', async () => {
    await auth.getState().login({ email: 'partner@lemonade.demo', password: 'TravelDemo1!' });
    await assert.rejects(tripApi.list(), error => error.response.status === 403);
    await assert.rejects(customerApi.updateProfile({ name: 'Partner' }), error => error.response.status === 403);
    await auth.getState().logout();
  });
  await t.test('return paths accept customer routes and reject foreign or malformed destinations', () => {
    for (const path of ['/customer/trips', '/customer/trips/new?destination=Munnar', '/customer/trips/munnar-escape/edit', '/customer/profile']) assert.equal(safeReturnPath(path, 'CUSTOMER'), path);
    for (const path of ['//example.com', '/customer/../partner/dashboard', '/customer/trips/../../login', '/partner/dashboard', '/customer/trips\\example.com', 'https://example.com']) assert.equal(safeReturnPath(path, 'CUSTOMER'), null);
  });
});
