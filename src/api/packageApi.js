import { axiosClient } from './axiosClient';
const publicOptions = signal => ({ signal, skipAuth: true, skipAuthRefresh: true });
export const packageApi = {
  list: async signal => (await axiosClient.get('/packages', publicOptions(signal))).data.packages,
  get: async (id, signal) => (await axiosClient.get(`/packages/${encodeURIComponent(id)}`, publicOptions(signal))).data.package,
  planner: async (id, signal) => (await axiosClient.get(`/planners/${encodeURIComponent(id)}`, publicOptions(signal))).data.planner,
  mine: async signal => (await axiosClient.get('/partner/packages', { signal })).data.packages,
  owned: async (id, signal) => (await axiosClient.get(`/partner/packages/${encodeURIComponent(id)}`, { signal })).data.package,
  save: async (input, id) => (await (id ? axiosClient.patch(`/partner/packages/${encodeURIComponent(id)}`, input) : axiosClient.post('/partner/packages', input))).data.package,
  enquire: async (id, input) => (await axiosClient.post(`/packages/${encodeURIComponent(id)}/enquiries`, input)).data.trip,
};
