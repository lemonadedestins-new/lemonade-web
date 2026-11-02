import { create } from 'zustand';
import { authApi } from '../../../api/authApi';
import { tokenManager } from '../../../api/tokenManager';
import { configureSessionHandlers, invalidateSession } from '../../../api/axiosClient';
import { getErrorMessage } from '../../../api/errors';
import { ROLES } from '../../../constants/routes';

const signedOut = { user: null, role: null, accessToken: null, isAuthenticated: false };
let initializationPromise;
let authGeneration = 0;

function authenticatedState(user, accessToken) {
  if (!user?.id || !Object.values(ROLES).includes(user.role) || !accessToken) throw new Error('Invalid authentication response');
  return { user, role: user.role, accessToken, isAuthenticated: true, error: null, initializationError: null, loading: false, initialized: true };
}
async function authenticate(action, payload, set) {
  const generation = ++authGeneration;
  invalidateSession();
  set({ loading: true, error: null });
  try {
    const { user, accessToken } = await action(payload);
    if (generation !== authGeneration) return null;
    const state = authenticatedState(user, accessToken);
    tokenManager.set(accessToken);
    set(state);
    return user;
  } catch (error) {
    if (generation === authGeneration) set({ ...signedOut, loading: false, error: getErrorMessage(error) });
    throw error;
  }
}

export const useAuthStore = create((set, get) => ({
  ...signedOut, loading: true, initialized: false, error: null, initializationError: null,
  clearError: () => set({ error: null }),
  login: payload => authenticate(authApi.login, payload, set),
  register: payload => authenticate(authApi.register, payload, set),
  initializeAuth: () => {
    if (get().initialized && !get().initializationError) return Promise.resolve();
    if (initializationPromise) return initializationPromise;
    const generation = authGeneration;
    set({ loading: true, initializationError: null });
    initializationPromise = (async () => {
      try {
        const accessToken = await authApi.refresh();
        const user = await authApi.me();
        if (generation === authGeneration) set(authenticatedState(user, accessToken));
      } catch (error) {
        if (generation !== authGeneration) return;
        invalidateSession();
        const expired = [401, 403].includes(error.response?.status);
        set({ ...signedOut, loading: false, initialized: true, initializationError: expired ? null : getErrorMessage(error) });
      } finally { initializationPromise = null; }
    })();
    return initializationPromise;
  },
  logout: async () => {
    ++authGeneration;
    set({ loading: true, error: null });
    try { await authApi.logout(); }
    finally {
      invalidateSession();
      set({ ...signedOut, loading: false, initialized: true, error: null, initializationError: null });
    }
  },
}));

configureSessionHandlers({
  onToken: accessToken => useAuthStore.setState({ accessToken }),
  onExpired: () => {
    ++authGeneration;
    useAuthStore.setState({ ...signedOut, loading: false, initialized: true, error: 'Your session has ended. Please log in again.' });
  },
});
