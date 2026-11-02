import { axiosClient } from './axiosClient';
export const customerApi = {
  updateProfile: async payload => (await axiosClient.patch('/customer/profile', payload)).data.user,
  updatePreferences: async payload => (await axiosClient.patch('/customer/preferences', payload)).data.user,
};
