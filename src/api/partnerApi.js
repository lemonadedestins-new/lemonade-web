import { axiosClient } from './axiosClient';
export const partnerApi = {
  leads: async signal => (await axiosClient.get('/partner/leads', { signal })).data.leads,
  lead: async (id, signal) => (await axiosClient.get(`/partner/leads/${encodeURIComponent(id)}`, { signal })).data.lead,
  updateProfile: async payload => (await axiosClient.patch('/partner/profile', payload)).data.user,
  updateSettings: async payload => (await axiosClient.patch('/partner/settings', payload)).data.user,
};
