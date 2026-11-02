import { create } from 'zustand';

export const useNotificationStore = create(set => ({
  notifications: [],
  notify: (message, severity = 'success') => set(state => ({ notifications: [...state.notifications.slice(-3), { id: crypto.randomUUID(), message, severity }] })),
  dismiss: id => set(state => ({ notifications: state.notifications.filter(item => item.id !== id) })),
}));
