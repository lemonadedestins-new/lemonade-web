export const normalizePartnerProfile = input => Object.fromEntries(['name', 'businessName', 'city', 'specialties', 'description'].map(key => [key, String(input[key] || '').trim()]));
export function validatePartnerProfile(input) {
  const errors = {};
  for (const [key, label, min, max] of [['name', 'your name', 2, 80], ['businessName', 'your business name', 2, 100], ['city', 'your base city', 2, 100], ['specialties', 'your specialties', 0, 300], ['description', 'your business description', 0, 1500]]) {
    const length = String(input[key] || '').trim().length;
    if (length < min || length > max) errors[key] = `Enter ${label} using ${min} to ${max} characters.`;
  }
  return errors;
}
export function validatePartnerSettings(input) {
  const errors = {};
  if (!Number.isInteger(Number(input.validityDays)) || input.validityDays < 1 || input.validityDays > 30) errors.validityDays = 'Choose a validity period from 1 to 30 days.';
  if (String(input.defaultTerms || '').length > 3000) errors.defaultTerms = 'Use no more than 3,000 characters.';
  return errors;
}
