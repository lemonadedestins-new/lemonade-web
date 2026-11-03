import { axiosClient } from './axiosClient';
export const quoteApi = {
  list: async signal => (await axiosClient.get('/partner/quotes', { signal })).data.quotes,
  get: async (id, signal) => (await axiosClient.get(`/partner/quotes/${encodeURIComponent(id)}`, { signal })).data.quote,
  create: async (leadId, payload) => (await axiosClient.post(`/partner/leads/${encodeURIComponent(leadId)}/quotes`, payload)).data.quote,
  update: async (id, payload) => (await axiosClient.patch(`/partner/quotes/${encodeURIComponent(id)}`, payload)).data.quote,
  withdraw: async id => (await axiosClient.post(`/partner/quotes/${encodeURIComponent(id)}/withdraw`)).data.quote,
};
