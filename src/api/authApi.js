import { axiosClient, refreshAccessToken } from './axiosClient';

const publicRequest = { skipAuth: true, skipAuthRefresh: true };
export const authApi = {
  register: async payload => (await axiosClient.post('/auth/register', payload, publicRequest)).data,
  login: async payload => (await axiosClient.post('/auth/login', payload, publicRequest)).data,
  logout: async () => (await axiosClient.post('/auth/logout', {}, { skipAuthRefresh: true })).data,
  refresh: refreshAccessToken,
  forgotPassword: async email => (await axiosClient.post('/auth/forgot-password', { email }, publicRequest)).data,
  me: async () => (await axiosClient.get('/auth/me')).data.user,
};
