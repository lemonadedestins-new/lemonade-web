export const QUOTE_STATUS = Object.freeze({ DRAFT: 'DRAFT', SUBMITTED: 'SUBMITTED', ACCEPTED: 'ACCEPTED', EXPIRED: 'EXPIRED', WITHDRAWN: 'WITHDRAWN' });
export const QUOTE_META = {
  DRAFT: { label: 'Draft', tone: 'neutral' }, SUBMITTED: { label: 'Awaiting traveler', tone: 'blue' },
  ACCEPTED: { label: 'Accepted', tone: 'green' }, EXPIRED: { label: 'Expired', tone: 'neutral' }, WITHDRAWN: { label: 'Withdrawn', tone: 'neutral' },
};
export const LEAD_META = { NEW: { label: 'New enquiry', tone: 'gold' }, DRAFT: { label: 'Quote in progress', tone: 'blue' }, QUOTED: { label: 'Quote sent', tone: 'green' }, CLOSED: { label: 'Closed', tone: 'neutral' } };
export const DEFAULT_QUOTE = { title: '', price: '', days: 1, nights: 0, accommodation: '', transportation: '', meals: '', activities: '', inclusions: [], exclusions: [], terms: '', validUntil: '', notes: '', itinerary: [{ day: 1, title: '', description: '' }] };
export const leadPath = id => `/partner/leads/${encodeURIComponent(id)}`;
export const quotePath = id => `/partner/quotes/${encodeURIComponent(id)}`;
export const createQuotePath = id => `${leadPath(id)}/quotes/new`;
