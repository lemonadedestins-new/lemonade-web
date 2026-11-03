import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';

test('a customer request can receive and withdraw a planner quote across authenticated sessions', async t => {
  const server = await createServer({ configFile: false, mode: 'test', server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] }, define: { 'import.meta.env.VITE_USE_MOCK_API': '"true"' } });
  t.after(() => server.close());
  const { useAuthStore: auth } = await server.ssrLoadModule('/src/features/auth/store/authStore.js');
  const { usePartnerStore: store } = await server.ssrLoadModule('/src/features/partner/store/partnerStore.js');
  const { tripApi } = await server.ssrLoadModule('/src/api/tripApi.js');
  const { partnerApi } = await server.ssrLoadModule('/src/api/partnerApi.js');
  const { quoteApi } = await server.ssrLoadModule('/src/api/quoteApi.js');
  const { safeReturnPath } = await server.ssrLoadModule('/src/utils/navigation.js');
  const login = role => auth.getState().login({ email: role === 'partner' ? 'partner@lemonade.demo' : 'customer@lemonade.demo', password: 'TravelDemo1!' });
  let trip, draft, quote;
  await t.test('customer submissions become assigned leads; drafts and other roles stay restricted', async () => {
    await login('customer');
    trip = await tripApi.create({ destination: 'Bali', departureCity: 'Chennai', startDate: '2099-06-15', endDate: '2099-06-15', adults: 2, children: 0, budget: 30000, tripType: 'Friends', status: 'SUBMITTED' });
    await assert.rejects(partnerApi.leads(), error => error.response.status === 403);
    await auth.getState().logout(); await login('partner');
    await store.getState().load();
    assert.ok(store.getState().leads.some(lead => lead.id === trip.id));
    const lead = await partnerApi.lead(trip.id);
    assert.equal(lead.customerId, undefined);
    assert.equal(lead.quotes, undefined);
    assert.equal(lead.canQuote, true);
  });
  await t.test('drafts save and resume without becoming customer-visible', async () => {
    draft = await store.getState().saveQuote(trip.id, { title: 'Bali at your pace', status: 'DRAFT' });
    store.getState().rememberDraft(trip.id, { title: 'Unfinished changes' });
    await auth.getState().logout();
    assert.deepEqual(store.getState().formDrafts, {});
    assert.deepEqual(store.getState().quotes, []);
    await login('customer');
    assert.deepEqual((await tripApi.get(trip.id)).quotes, []);
    await auth.getState().logout(); await login('partner');
    assert.equal((await partnerApi.lead(trip.id)).quote.id, draft.id);
  });
  await t.test('submitting updates the customer proposal list, status and timeline', async () => {
    quote = await store.getState().saveQuote(trip.id, { title: 'Bali at your pace', price: 28000, days: 1, nights: 0, accommodation: 'No overnight stay; day-use lounge included', transportation: 'Private car and airport transfers', meals: 'Lunch at a local restaurant', activities: 'A guided walk and cooking demonstration', inclusions: 'Private transport\nLunch and guide\nTaxes', exclusions: 'Flights\nTravel insurance', validUntil: '2099-06-10', terms: 'Availability is subject to confirmation before booking.', itinerary: [{ title: 'A taste of Bali', description: 'A relaxed day of local food, village walks and sightseeing.' }], status: 'SUBMITTED' }, draft.id);
    assert.equal(quote.id, draft.id);
    await assert.rejects(quoteApi.create(trip.id, { title: 'Duplicate', status: 'DRAFT' }), error => error.response.status === 409);
    await auth.getState().logout(); await login('customer');
    const updated = await tripApi.get(trip.id);
    assert.equal(updated.quotes[0].title, quote.title);
    assert.equal(updated.quotes[0].plannerName, 'Valley & Beyond');
    assert.equal(updated.status, 'QUOTES_RECEIVED');
    assert.equal(updated.timeline.at(-1).title, 'A new planner proposal');
  });
  await t.test('withdrawal is reflected for both roles, while accepted quotes remain protected', async () => {
    await auth.getState().logout(); await login('partner');
    await assert.rejects(quoteApi.withdraw('quote-kerala'), error => error.response.status === 409);
    await store.getState().withdrawQuote(quote.id);
    assert.equal((await quoteApi.get(quote.id)).status, 'WITHDRAWN');
    await auth.getState().logout(); await login('customer');
    assert.equal((await tripApi.get(trip.id)).quotes.length, 0);
  });
  await t.test('new partners have empty, isolated workspaces and cannot access others’ quotes', async () => {
    await auth.getState().logout();
    await auth.getState().register({ name: 'Another Planner', email: 'another-planner@example.test', password: 'TravelDemo1!', role: 'BUSINESS_OWNER' });
    await store.getState().load();
    assert.deepEqual(store.getState().leads, []);
    assert.deepEqual(store.getState().quotes, []);
    await assert.rejects(partnerApi.lead(trip.id), error => error.response.status === 404);
    await assert.rejects(quoteApi.get(quote.id), error => error.response.status === 404);
    const profile = await partnerApi.updateProfile({ name: 'Another Planner', businessName: 'New Journeys', city: 'Chennai', role: 'ADMIN' });
    assert.equal(profile.role, 'BUSINESS_OWNER');
    const updated = await partnerApi.updateSettings({ validityDays: 5, defaultTerms: 'Check availability.' });
    assert.equal(updated.partnerSettings.validityDays, 5);
    await assert.rejects(partnerApi.updateSettings({ validityDays: 100 }), error => error.response.status === 422);
  });
  await t.test('late responses do not leak previous partner data, and return paths are scoped', async () => {
    const original = partnerApi.leads;
    let resolve;
    partnerApi.leads = () => new Promise(done => { resolve = done; });
    try {
      const pending = store.getState().load(true);
      await auth.getState().logout();
      resolve([{ id: 'private-old-lead' }]);
      await pending;
      assert.deepEqual(store.getState().leads, []);
    } finally { partnerApi.leads = original; }
    for (const path of ['/partner/leads', '/partner/leads/island-honeymoon/quotes/new', '/partner/quotes/quote-valley', '/partner/settings']) assert.equal(safeReturnPath(path, 'BUSINESS_OWNER'), path);
    for (const path of ['/customer/trips', '/partner/leads/../../customer/trips', '//example.com']) assert.equal(safeReturnPath(path, 'BUSINESS_OWNER'), null);
  });
});
