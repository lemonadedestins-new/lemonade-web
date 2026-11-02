export const apiConfig = Object.freeze({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  useMock: import.meta.env.VITE_USE_MOCK_API !== 'false',
  timeout: 15000,
});
