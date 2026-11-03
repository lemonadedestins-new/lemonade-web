import { DEFAULT_QUOTE, QUOTE_STATUS } from '../../constants/quotes.js';
import { dateInput, isValidDate } from '../trips/tripModel.js';

export const toLines = value => (Array.isArray(value) ? value : String(value || '').split('\n')).map(line => String(line).trim()).filter(Boolean);
export function normalizeQuote(input = {}) {
  return Object.fromEntries(Object.entries(DEFAULT_QUOTE).map(([key, fallback]) => {
    const value = input[key] ?? fallback;
    if (['price', 'days', 'nights'].includes(key)) return [key, value === '' ? '' : Number(value)];
    if (['inclusions', 'exclusions'].includes(key)) return [key, toLines(value)];
    if (key === 'itinerary') return [key, Array.isArray(value) ? value.map((day, index) => ({ day: index + 1, title: String(day?.title || '').trim(), description: String(day?.description || '').trim() })) : []];
    return [key, String(value).trim()];
  }));
}
export function validateQuote(input, { draft = false, today = dateInput(), tripStart } = {}) {
  const value = normalizeQuote(input);
  const errors = {};
  for (const [key, label, max] of [['title', 'package title', 120], ['accommodation', 'hotel details', 2000], ['transportation', 'transportation details', 1000], ['meals', 'meal details', 1000], ['activities', 'activities', 1500], ['terms', 'terms and cancellation details', 3000]]) {
    if ((!draft || key === 'title') && value[key].length < 3) errors[key] = `Add ${label} (at least 3 characters).`;
    if (value[key].length > max) errors[key] = `Use no more than ${max} characters.`;
  }
  if ((!draft || value.price !== '') && (!Number.isFinite(value.price) || value.price < 1 || value.price > 10000000)) errors.price = 'Enter a total price between ₹1 and ₹1,00,00,000.';
  if (!Number.isInteger(value.days) || value.days < 1 || value.days > 30) errors.days = 'Choose 1 to 30 days.';
  if (!Number.isInteger(value.nights) || value.nights < 0 || value.nights > 30) errors.nights = 'Enter 0 to 30 nights.';
  else if (!draft && value.nights !== value.days - 1) errors.nights = 'Use one fewer night than days (a day trip has 0 nights).';
  if ((!draft || value.validUntil) && !isValidDate(value.validUntil)) errors.validUntil = 'Choose a valid expiry date.';
  else if (value.validUntil && value.validUntil < today) errors.validUntil = 'Expiry must be today or later.';
  else if (value.validUntil && tripStart && value.validUntil > tripStart) errors.validUntil = 'The proposal must expire on or before the trip starts.';
  for (const key of ['inclusions', 'exclusions']) {
    if (!draft && !value[key].length) errors[key] = 'Add at least one item. Use “None” if there are no exclusions.';
    if (value[key].length > 30 || value[key].some(item => item.length > 300)) errors[key] = 'Use up to 30 lines, with no more than 300 characters per line.';
  }
  if (!value.itinerary.length || value.itinerary.length > 30) errors.itinerary = 'Add between 1 and 30 itinerary days.';
  else if (!draft && value.itinerary.length !== value.days) errors.days = 'The duration must match the number of itinerary days.';
  value.itinerary.forEach((day, index) => {
    if ((!draft && day.title.length < 3) || day.title.length > 120) errors[`itinerary.${index}.title`] = 'Use a day title of 3 to 120 characters.';
    if ((!draft && day.description.length < 10) || day.description.length > 2000) errors[`itinerary.${index}.description`] = 'Describe the day in 10 to 2,000 characters.';
  });
  if (value.notes.length > 2000) errors.notes = 'Use no more than 2,000 characters.';
  return errors;
}
export function quoteStatus(quote, today = dateInput()) {
  return quote.status === QUOTE_STATUS.SUBMITTED && quote.validUntil < today ? QUOTE_STATUS.EXPIRED : quote.status;
}
export function quoteFormValues(quote) {
  const values = normalizeQuote(quote);
  return { ...values, inclusions: values.inclusions.join('\n'), exclusions: values.exclusions.join('\n') };
}
