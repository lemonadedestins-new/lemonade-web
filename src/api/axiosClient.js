import axios from 'axios';
import { apiConfig } from './config';
import { tokenManager } from './tokenManager';

const clientConfig = { baseURL: apiConfig.baseURL, timeout: apiConfig.timeout, withCredentials: true, headers: { 'Content-Type': 'application/json' } };
if (apiConfig.useMock) {
  // Lazy import keeps the mock implementation out of the live request path.
  clientConfig.adapter = async config => (await import('./mock/mockAdapter')).mockAdapter(config);
}
export const axiosClient = axios.create(clientConfig);
const refreshClient = axios.create(clientConfig);
let refreshPromise = null;
let sessionGeneration = 0;
let sessionHandlers = { onToken: () => {}, onExpired: () => {} };

export function configureSessionHandlers(handlers) { sessionHandlers = handlers; }
export function invalidateSession() {
  sessionGeneration += 1;
  tokenManager.clear();
  refreshPromise = null;
}
export function refreshAccessToken() {
  if (!refreshPromise) {
    const generation = sessionGeneration;
    const current = refreshClient.post('/auth/refresh').then(({ data }) => {
      if (generation !== sessionGeneration) throw new axios.CanceledError('Session changed');
      if (typeof data.accessToken !== 'string' || !data.accessToken) throw new Error('Invalid authentication response');
      tokenManager.set(data.accessToken);
      sessionHandlers.onToken(data.accessToken);
      return data.accessToken;
    }).finally(() => { if (refreshPromise === current) refreshPromise = null; });
    refreshPromise = current;
  }
  return refreshPromise;
}

axiosClient.interceptors.request.use(config => {
  const token = tokenManager.get();
  if (token && !config.skipAuth) config.headers.Authorization = `Bearer ${token}`;
  config.sessionGeneration = sessionGeneration;
  return config;
});
axiosClient.interceptors.response.use(response => response, async error => {
  const original = error.config;
  if (error.response?.status !== 401 || !original || original.skipAuthRefresh) throw error;
  if (original.sessionGeneration !== sessionGeneration) throw error;
  if (original._retry) {
    invalidateSession();
    sessionHandlers.onExpired();
    throw error;
  }
  original._retry = true;
  try {
    const currentToken = tokenManager.get();
    const token = currentToken && original.headers.Authorization !== `Bearer ${currentToken}` ? currentToken : await refreshAccessToken();
    original.headers.Authorization = `Bearer ${token}`;
    return await axiosClient(original);
  } catch (refreshError) {
    if (refreshError.response?.status === 401 || refreshError.response?.status === 403) {
      invalidateSession();
      sessionHandlers.onExpired();
    }
    throw refreshError;
  }
});
