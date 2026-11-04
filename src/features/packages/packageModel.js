import { destinations } from '../home/data/destinations.js';
import { dateInput, isValidDate } from '../trips/tripModel.js';

export const PACKAGE_STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];
export const packagePath = id => `/packages/${encodeURIComponent(id)}`;
export const plannerPath = id => `/planners/${encodeURIComponent(id)}`;
export const enquiryPath = id => `/customer/packages/${encodeURIComponent(id)}/enquire`;
export const packageEditPath = id => `/partner/packages/${encodeURIComponent(id)}/edit`;
export const browsePath = destination => `/explore${destination ? '?destination=' + encodeURIComponent(destination) : ''}`;
export const EMPTY_PACKAGE = { title: '', destinationId: 'munnar', summary: '', price: '', days: 3, pickupCity: '', accommodation: '', transportation: '', meals: '', inclusions: '', exclusions: '', terms: '', itinerary: [{ title: '', description: '' }, { title: '', description: '' }, { title: '', description: '' }] };
const text = value => String(value ?? '').trim();
const lines = value => (Array.isArray(value) ? value : text(value).split('\n')).map(text).filter(Boolean);
export function normalizePackage(input = {}) {
  const result = {};
  for (const key of ['title', 'destinationId', 'summary', 'pickupCity', 'accommodation', 'transportation', 'meals', 'terms']) result[key] = text(input[key]);
  result.price = input.price === '' || input.price == null ? '' : Number(input.price);
  result.days = Number(input.days ?? 3);
  result.inclusions = lines(input.inclusions); result.exclusions = lines(input.exclusions);
  result.itinerary = Array.isArray(input.itinerary) ? input.itinerary.map((day, index) => ({ day: index + 1, title: text(day.title), description: text(day.description) })) : [];
  return result;
}
export function validatePackage(input, { draft = false } = {}) {
  const value = normalizePackage(input); const errors = {};
  if (!destinations.some(item => item.id === value.destinationId)) errors.destinationId = 'Choose a supported South Indian destination.';
  for (const [key, min, max] of [['title', 3, 120], ['summary', 20, 1000], ['pickupCity', 2, 100], ['accommodation', 3, 1000], ['transportation', 3, 1000], ['meals', 3, 500], ['terms', 10, 3000]]) {
    if ((!draft || key === 'title' || value[key]) && (value[key].length < min || value[key].length > max)) errors[key] = `Use ${min}–${max} characters.`;
  }
  if ((!draft || value.price !== '') && (!Number.isFinite(value.price) || value.price < 500 || value.price > 500000)) errors.price = 'Enter a per-person price from ₹500 to ₹5,00,000.';
  if (!Number.isInteger(value.days) || value.days < 1 || value.days > 30) errors.days = 'Use 1–30 itinerary days.';
  for (const key of ['inclusions', 'exclusions']) if ((!draft && !value[key].length) || value[key].length > 30 || value[key].some(item => item.length > 300)) errors[key] = 'Add 1–30 items, up to 300 characters each.';
  if (!draft && value.itinerary.length !== value.days || value.itinerary.length > 30) errors.itinerary = 'Include one itinerary entry for each day (up to 30).';
  value.itinerary.forEach((day, index) => {
    for (const [key, min, max] of [['title', 3, 120], ['description', 10, 2000]]) if ((!draft || day[key]) && (day[key].length < min || day[key].length > max)) errors[`itinerary.${index}.${key}`] = `Use ${min}–${max} characters.`;
  });
  return errors;
}
export function filterPackages(packages, filters = {}) {
  const query = text(filters.q).toLowerCase();
  const results = packages.filter(item => {
    const destination = destinations.find(place => place.id === item.destinationId);
    return (!filters.destination || item.destinationId === filters.destination) &&
      (!filters.planner || item.planner.id === filters.planner) &&
      (!filters.maxPrice || item.price <= Number(filters.maxPrice)) &&
      (!filters.duration || (filters.duration === 'short' ? item.days <= 3 : item.days >= 4)) &&
      (!query || [item.title, item.planner.businessName, destination?.name, destination?.country, item.destinationId === 'pondicherry' ? 'puducherry' : '', item.destinationId === 'alleppey' ? 'alappuzha' : ''].join(' ').toLowerCase().includes(query));
  });
  return [...results].sort(filters.sort === 'price-desc' ? (a, b) => b.price - a.price : filters.sort === 'duration' ? (a, b) => a.days - b.days : (a, b) => a.price - b.price);
}
export function validateEnquiry(input, today = dateInput()) {
  const errors = {};
  if (!isValidDate(input.startDate) || input.startDate < today) errors.startDate = 'Choose today or a future travel date.';
  if (!Number.isInteger(Number(input.adults)) || Number(input.adults) < 2 || Number(input.adults) > 20) errors.adults = 'Enter 2–20 adults. Listed prices use twin sharing.';
  if (text(input.departureCity).length < 2 || text(input.departureCity).length > 100) errors.departureCity = 'Enter your departure city (2–100 characters).';
  if (text(input.notes).length > 1500) errors.notes = 'Keep your notes within 1,500 characters.';
  return errors;
}
export function packageEndDate(startDate, days) {
  const date = new Date(`${startDate}T12:00:00`); date.setDate(date.getDate() + days - 1); return dateInput(date);
}
