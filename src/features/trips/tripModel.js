import { destinations } from '../home/data/destinations.js';
import { ACCOMMODATIONS, DEFAULT_TRIP, INTERESTS, TRANSPORT, TRIP_TYPES } from '../../constants/trips.js';

export function dateInput(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false;
  const parsed = new Date(`${value}T12:00:00`);
  return !Number.isNaN(parsed.getTime()) && dateInput(parsed) === value;
}
export function normalizeTrip(input = {}) {
  return Object.fromEntries(Object.entries(DEFAULT_TRIP).map(([key, fallback]) => {
    const value = input[key] ?? fallback;
    if (['adults', 'children', 'budget'].includes(key)) return [key, value === '' ? '' : Number(value)];
    if (key === 'interests') return [key, Array.isArray(value) ? [...new Set(value)] : []];
    return [key, String(value).trim()];
  }));
}
export function validateTrip(input, { draft = false, today = dateInput() } = {}) {
  const v = normalizeTrip(input);
  const errors = {};
  for (const [key, label, max] of [['destination', 'destination', 100], ['departureCity', 'departure city', 100]]) {
    if ((!draft || key === 'destination') && v[key].length < 2) errors[key] = `Enter your ${label} (at least 2 characters).`;
    if (v[key].length > max) errors[key] = `Keep your ${label} under ${max + 1} characters.`;
  }
  if (v.destination && !destinations.some(place => place.name.toLowerCase() === v.destination.toLowerCase())) errors.destination = 'Choose Munnar, Ooty, Coorg, Alleppey, Hampi, or Pondicherry.';
  if ((!draft || v.startDate) && !isValidDate(v.startDate)) errors.startDate = 'Choose a valid start date.';
  else if (v.startDate && v.startDate < today) errors.startDate = 'Choose today or a future date.';
  if ((!draft || v.endDate) && !isValidDate(v.endDate)) errors.endDate = 'Choose a valid end date.';
  else if (v.endDate && v.startDate && v.endDate < v.startDate) errors.endDate = 'Your trip must end on or after the start date.';
  for (const [key, min, max] of [['adults', 1, 20], ['children', 0, 20]]) {
    if ((v[key] !== '' || !draft) && (!Number.isInteger(v[key]) || v[key] < min || v[key] > max)) errors[key] = `Enter a whole number from ${min} to ${max}.`;
  }
  if ((!draft || v.budget !== '') && (!Number.isFinite(v.budget) || v.budget < 1000 || v.budget > 10000000)) errors.budget = 'Enter a total budget from ₹1,000 to ₹1,00,00,000.';
  if ((!draft || v.tripType) && !TRIP_TYPES.includes(v.tripType)) errors.tripType = 'Choose the kind of trip you have in mind.';
  if (!ACCOMMODATIONS.includes(v.accommodation)) errors.accommodation = 'Choose an accommodation preference.';
  if (!TRANSPORT.includes(v.transportation)) errors.transportation = 'Choose a transportation preference.';
  if (v.interests.some(item => !INTERESTS.includes(item))) errors.interests = 'Choose interests from the available options.';
  for (const key of ['specialRequirements', 'notes']) if (v[key].length > 1500) errors[key] = 'Keep this under 1,501 characters.';
  return errors;
}
export function formatDate(value, options = {}) {
  if (!value) return 'Not set yet';
  const date = new Date(value.length === 10 ? `${value}T12:00:00` : value);
  if (Number.isNaN(date.getTime())) return 'Not set yet';
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric', ...options }).format(date);
}
export const formatMoney = value => value === '' || value == null ? 'Not set yet' : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
export const travelerLabel = trip => `${Number(trip.adults || 0) + Number(trip.children || 0)} travelers`;
export const tripPath = id => `/customer/trips/${encodeURIComponent(id)}`;
