import { useEffect, useState } from 'react';
import { partnerApi } from '../../../api/partnerApi';
import { quoteApi } from '../../../api/quoteApi';
import { getErrorMessage } from '../../../api/errors';
import { usePartnerStore } from '../store/partnerStore';

export function usePartnerData() {
  const leads = usePartnerStore(state => state.leads);
  const quotes = usePartnerStore(state => state.quotes);
  const loaded = usePartnerStore(state => state.loaded);
  const loading = usePartnerStore(state => state.loading);
  const error = usePartnerStore(state => state.error);
  const load = usePartnerStore(state => state.load);
  useEffect(() => { void load(); }, [load]);
  return { leads, quotes, loaded, loading, error, load };
}
const readers = { lead: partnerApi.lead, quote: quoteApi.get };
export function usePartnerResource(kind, id) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setState({ data: null, loading: true, error: null });
    readers[kind](id, controller.signal).then(data => {
      if (!controller.signal.aborted) setState({ data, loading: false, error: null });
    }).catch(error => { if (!controller.signal.aborted) setState({ data: null, loading: false, error: getErrorMessage(error) }); });
    return () => controller.abort();
  }, [kind, id, attempt]);
  return { ...state, retry: () => setAttempt(value => value + 1) };
}
