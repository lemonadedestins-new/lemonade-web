import { useEffect, useState } from 'react';
import { tripApi } from '../../../api/tripApi';
import { getErrorMessage } from '../../../api/errors';

export function useTrip(id) {
  const [state, setState] = useState({ trip: null, loading: !!id, error: null, notFound: false });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!id) { setState({ trip: null, loading: false, error: null }); return; }
    const controller = new AbortController();
    setState({ trip: null, loading: true, error: null });
    tripApi.get(id, controller.signal).then(trip => {
      if (!controller.signal.aborted) setState({ trip, loading: false, error: null });
    }).catch(error => {
      if (!controller.signal.aborted) setState({ trip: null, loading: false, error: getErrorMessage(error), notFound: error.response?.status === 404 });
    });
    return () => controller.abort();
  }, [id, attempt]);
  return { ...state, retry: () => setAttempt(value => value + 1) };
}
