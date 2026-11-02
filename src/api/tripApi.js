import { axiosClient } from './axiosClient';

export const tripApi = {
  list: async (signal) => (await axiosClient.get('/trips', { signal })).data.trips,
  get: async (id, signal) => (await axiosClient.get(`/trips/${encodeURIComponent(id)}`, { signal })).data.trip,
  create: async payload => (await axiosClient.post('/trips', payload)).data.trip,
  update: async (id, payload) => (await axiosClient.patch(`/trips/${encodeURIComponent(id)}`, payload)).data.trip,
};
