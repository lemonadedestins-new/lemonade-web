import { create } from 'zustand';
import { partnerApi } from '../../../api/partnerApi';
import { quoteApi } from '../../../api/quoteApi';
import { getErrorMessage } from '../../../api/errors';
import { useAuthStore } from '../../auth/store/authStore';

let generation = 0;
let pending;
const empty = { leads: [], quotes: [], loaded: false, loading: false, error: null, formDrafts: {} };
export const usePartnerStore = create((set, get) => ({
  ...empty,
  rememberDraft: (id, values) => set(state => ({ formDrafts: { ...state.formDrafts, [id]: values } })),
  clearDraft: id => set(state => { const drafts = { ...state.formDrafts }; delete drafts[id]; return { formDrafts: drafts }; }),
  load: (force = false) => {
    if (pending) return pending;
    if (get().loaded && !force) return Promise.resolve();
    const version = generation;
    set({ loading: true, error: null });
    pending = Promise.all([partnerApi.leads(), quoteApi.list()]).then(([leads, quotes]) => {
      if (version === generation) set({ leads, quotes, loaded: true, loading: false });
    }).catch(error => { if (version === generation) set({ loading: false, error: getErrorMessage(error) }); }).finally(() => { if (version === generation) pending = null; });
    return pending;
  },
  saveQuote: async (leadId, payload, id) => {
    const version = generation;
    const quote = id ? await quoteApi.update(id, payload) : await quoteApi.create(leadId, payload);
    if (version !== generation) throw new Error('Session changed');
    set(state => ({ loaded: false, quotes: [quote, ...state.quotes.filter(item => item.id !== quote.id)] }));
    return quote;
  },
  withdrawQuote: async id => {
    const version = generation;
    const quote = await quoteApi.withdraw(id);
    if (version !== generation) throw new Error('Session changed');
    set(state => ({ loaded: false, quotes: state.quotes.map(item => item.id === id ? quote : item) }));
    return quote;
  },
}));
useAuthStore.subscribe((state, previous) => {
  if (state.user?.id !== previous.user?.id) { generation += 1; pending = null; usePartnerStore.setState(empty); }
});
