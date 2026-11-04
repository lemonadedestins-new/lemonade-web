import { useEffect, useState } from 'react';
import { packageApi } from '../../../api/packageApi';
import { getErrorMessage } from '../../../api/errors';
import { useAuthStore } from '../../auth/store/authStore';
export function usePackages(kind = 'list', id) {
  const userId = useAuthStore(state => state.user?.id);
  const [attempt, setAttempt] = useState(0);
  const key = `${kind}:${id || ''}:${userId || ''}:${attempt}`;
  const [result, setResult] = useState({ key: '', data: null, loading: true, error: null });
  useEffect(() => {
    const controller = new AbortController();
    const request = ['list', 'mine'].includes(kind) ? packageApi[kind](controller.signal) : packageApi[kind](id, controller.signal);
    request.then(data => { if (!controller.signal.aborted) setResult({ key, data, loading: false, error: null }); }).catch(error => { if (!controller.signal.aborted) setResult({ key, data: null, loading: false, error: getErrorMessage(error) }); });
    return () => controller.abort();
  }, [kind, id, key]);
  return { ...(result.key === key ? result : { data: null, loading: true, error: null }), retry: () => setAttempt(value => value + 1) };
}
