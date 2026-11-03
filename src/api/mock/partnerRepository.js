import { ROLES } from '../../constants/routes.js';
import { ACTIVE_STATUSES, TRIP_STATUS } from '../../constants/trips.js';
import { QUOTE_STATUS } from '../../constants/quotes.js';
import { normalizeTrip, dateInput } from '../../features/trips/tripModel.js';
import { normalizeQuote, quoteStatus, validateQuote } from '../../features/quotes/quoteModel.js';
import { TripRequestError } from './mockErrors.js';

// Shares trip records with the customer repository. Draft proposals stay private here.
export function createPartnerRepository(records) {
  const quotes = new Map();
  for (const trip of records.values()) for (const quote of trip.quotes || []) {
    if (quote.partnerId) quotes.set(quote.id, { ...structuredClone(quote), leadId: trip.id, destination: trip.destination, status: quote.id === trip.selectedQuoteId ? QUOTE_STATUS.ACCEPTED : QUOTE_STATUS.SUBMITTED, updatedAt: quote.createdAt });
  }
  const authorize = user => { if (!user) throw new TripRequestError(401, 'SESSION_EXPIRED'); if (user.role !== ROLES.BUSINESS_OWNER) throw new TripRequestError(403, 'FORBIDDEN'); };
  const assigned = (user, id) => { authorize(user); const trip = records.get(id); if (!trip || trip.status === TRIP_STATUS.DRAFT || !trip.assignedPartnerIds?.includes(user.id)) throw new TripRequestError(404, 'LEAD_NOT_FOUND'); return trip; };
  const ownedQuote = (user, id) => { authorize(user); const quote = quotes.get(id); if (!quote || quote.partnerId !== user.id) throw new TripRequestError(404, 'QUOTE_NOT_FOUND'); return quote; };
  const ownFor = (user, id) => [...quotes.values()].find(quote => quote.leadId === id && quote.partnerId === user.id);
  const isOpen = trip => ACTIVE_STATUSES.includes(trip.status) && trip.startDate >= dateInput();
  const presentQuote = quote => ({ ...structuredClone(quote), status: quoteStatus(quote), canEdit: quote.status === QUOTE_STATUS.DRAFT && isOpen(records.get(quote.leadId)) });
  function presentLead(user, trip) {
    const quote = ownFor(user, trip.id);
    return { ...normalizeTrip(trip), id: trip.id, tripStatus: trip.status, createdAt: trip.createdAt, updatedAt: trip.updatedAt, isSample: !!trip.isSample, status: !isOpen(trip) ? 'CLOSED' : !quote ? 'NEW' : quote.status === QUOTE_STATUS.DRAFT ? 'DRAFT' : 'QUOTED', canQuote: isOpen(trip) && (!quote || quote.status === QUOTE_STATUS.DRAFT), quote: quote ? presentQuote(quote) : null };
  }
  return {
    listLeads(user) { authorize(user); return [...records.values()].filter(trip => trip.status !== TRIP_STATUS.DRAFT && trip.assignedPartnerIds?.includes(user.id)).map(trip => presentLead(user, trip)).sort((a, b) => b.createdAt.localeCompare(a.createdAt)); },
    getLead(user, id) { return presentLead(user, assigned(user, id)); },
    listQuotes(user) { authorize(user); return [...quotes.values()].filter(quote => quote.partnerId === user.id).map(presentQuote).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)); },
    getQuote(user, id) { return presentQuote(ownedQuote(user, id)); },
    saveQuote(user, leadId, payload, quoteId) {
      const trip = assigned(user, leadId);
      if (!isOpen(trip)) throw new TripRequestError(409, 'LEAD_CLOSED');
      const existing = quoteId ? ownedQuote(user, quoteId) : ownFor(user, leadId);
      if (quoteId && existing.leadId !== leadId) throw new TripRequestError(404, 'QUOTE_NOT_FOUND');
      if (existing && (!quoteId || existing.status !== QUOTE_STATUS.DRAFT)) throw new TripRequestError(409, 'QUOTE_EXISTS');
      if (![QUOTE_STATUS.DRAFT, QUOTE_STATUS.SUBMITTED].includes(payload.status)) throw new TripRequestError(422, 'INVALID_STATUS');
      const values = normalizeQuote(payload);
      const fields = validateQuote(values, { draft: payload.status === QUOTE_STATUS.DRAFT, tripStart: trip.startDate });
      if (Object.keys(fields).length) throw new TripRequestError(422, 'INVALID_INPUT', fields);
      const now = new Date().toISOString();
      const quote = { ...values, id: existing?.id || crypto.randomUUID(), leadId, partnerId: user.id, plannerName: user.businessName || user.name, destination: trip.destination, status: payload.status, createdAt: existing?.createdAt || now, updatedAt: now, isSample: true };
      quotes.set(quote.id, quote);
      if (quote.status === QUOTE_STATUS.SUBMITTED) {
        trip.quotes.push(structuredClone(quote));
        trip.status = TRIP_STATUS.QUOTES_RECEIVED;
        trip.updatedAt = now;
        trip.timeline.push({ id: crypto.randomUUID(), title: 'A new planner proposal', detail: `${quote.plannerName} shared “${quote.title}”.`, at: now });
      }
      return presentQuote(quote);
    },
    withdrawQuote(user, id) {
      const quote = ownedQuote(user, id);
      if (![QUOTE_STATUS.SUBMITTED, QUOTE_STATUS.EXPIRED].includes(quoteStatus(quote))) throw new TripRequestError(409, 'QUOTE_NOT_WITHDRAWABLE');
      const trip = assigned(user, quote.leadId);
      if (trip.selectedQuoteId === id) throw new TripRequestError(409, 'QUOTE_NOT_WITHDRAWABLE');
      quote.status = QUOTE_STATUS.WITHDRAWN;
      quote.updatedAt = new Date().toISOString();
      trip.quotes = trip.quotes.filter(item => item.id !== id);
      if (trip.status === TRIP_STATUS.QUOTES_RECEIVED && !trip.quotes.length) trip.status = TRIP_STATUS.PLANNERS_ASSIGNED;
      trip.updatedAt = quote.updatedAt;
      trip.timeline.push({ id: crypto.randomUUID(), title: 'Proposal withdrawn', detail: `${quote.plannerName} withdrew “${quote.title}”.`, at: quote.updatedAt });
      return presentQuote(quote);
    },
  };
}
