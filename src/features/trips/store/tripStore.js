import { create } from 'zustand';
import { tripApi } from '../../../api/tripApi';
import { getErrorMessage } from '../../../api/errors';
import { useAuthStore } from '../../auth/store/authStore';

let generation = 0;
let pending;
const initial = { trips: [], loaded: false, loading: false, error: null, formDrafts: {} };
export const useTripStore = create((set, get) => ({
  ...initial,
  rememberDraft: (key, values) => set(state => ({ formDrafts: { ...state.formDrafts, [key]: values } })),
  clearDraft: key => set(state => { const drafts = { ...state.formDrafts }; delete drafts[key]; return { formDrafts: drafts }; }),
  loadTrips: (force = false) => {
    if (pending) return pending;
    if (get().loaded && !force) return Promise.resolve();
    const version = generation;
    set({ loading: true, error: null });
    pending = tripApi.list().then(trips => {
      if (version === generation) set({ trips, loaded: true, loading: false });
    }).catch(error => {
      if (version === generation) set({ error: getErrorMessage(error), loading: false });
    }).finally(() => { if (version === generation) pending = null; });
    return pending;
  },
  saveTrip: async (values, id) => {
    const version = generation;
    const trip = id ? await tripApi.update(id, values) : await tripApi.create(values);
    if (version !== generation) throw new Error('Session changed');
    set(state => ({ trips: [trip, ...state.trips.filter(item => item.id !== trip.id)] }));
    return trip;
  },
}));
useAuthStore.subscribe((state, previous) => {
  if (state.user?.id !== previous.user?.id) {
    generation += 1;
    pending = null;
    useTripStore.setState(initial);
  }
});
