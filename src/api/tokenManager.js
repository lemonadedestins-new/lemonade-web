// Access tokens live only in this module. The backend owns the HttpOnly refresh cookie.
let accessToken = null;
export const tokenManager = {
  get: () => accessToken,
  set: (token) => { accessToken = token; },
  clear: () => { accessToken = null; },
};
