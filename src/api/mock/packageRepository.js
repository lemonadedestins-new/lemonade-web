import { ROLES } from '../../constants/routes.js';
import { normalizePackage, validatePackage, PACKAGE_STATUSES } from '../../features/packages/packageModel.js';
import { TripRequestError } from './mockErrors.js';

export function createPackageRepository(seed = [], plannerSeed = []) {
  const records = new Map(seed.map(item => [item.id, structuredClone(item)]));
  const planners = new Map(plannerSeed.map(item => [item.id, structuredClone(item)]));
  const authorize = user => { if (!user) throw new TripRequestError(401, 'SESSION_EXPIRED'); if (user.role !== ROLES.BUSINESS_OWNER) throw new TripRequestError(403, 'FORBIDDEN'); };
  const owned = (user, id) => { authorize(user); const item = records.get(id); if (!item || item.plannerId !== user.id) throw new TripRequestError(404, 'PACKAGE_NOT_FOUND'); return item; };
  const publicPlanner = id => { const p = planners.get(id); return p && { id: p.id, businessName: p.businessName, city: p.city, description: p.description, specialties: p.specialties, languages: p.languages || [], initials: p.initials || p.businessName.slice(0, 2).toUpperCase(), color: p.color || '#dce6d4', isSample: true }; };
  const present = item => ({ ...structuredClone(item), nights: item.days - 1, planner: publicPlanner(item.plannerId), isSample: true });
  const published = () => [...records.values()].filter(item => item.status === 'PUBLISHED');
  return {
    list() { return published().map(present); },
    get(id) { const item = records.get(id); if (!item || item.status !== 'PUBLISHED') throw new TripRequestError(404, 'PACKAGE_NOT_FOUND'); return present(item); },
    planner(id) { const planner = publicPlanner(id); if (!planner || !published().some(item => item.plannerId === id)) throw new TripRequestError(404, 'PLANNER_NOT_FOUND'); return { ...planner, packages: published().filter(item => item.plannerId === id).map(present) }; },
    listOwned(user) { authorize(user); return [...records.values()].filter(item => item.plannerId === user.id).map(present); },
    getOwned(user, id) { return present(owned(user, id)); },
    syncPlanner(user) {
      authorize(user);
      planners.set(user.id, { ...planners.get(user.id), id: user.id, businessName: user.businessName || user.name, city: user.city || '', description: user.description || '', specialties: user.specialties || '' });
    },
    save(user, input, id) {
      authorize(user);
      const previous = id ? owned(user, id) : null;
      if (!PACKAGE_STATUSES.includes(input.status)) throw new TripRequestError(422, 'INVALID_STATUS');
      const values = normalizePackage(input);
      const fields = validatePackage(values, { draft: input.status !== 'PUBLISHED' });
      if (Object.keys(fields).length) throw new TripRequestError(422, 'INVALID_INPUT', fields);
      this.syncPlanner(user);
      const item = { ...values, id: previous?.id || crypto.randomUUID(), plannerId: user.id, status: input.status, updatedAt: new Date().toISOString() };
      records.set(item.id, item);
      return present(item);
    },
  };
}
