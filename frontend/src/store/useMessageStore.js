import { create } from 'zustand'

export const useMessageStore = create((set, get) => ({
  channelUnreadMap: {},
  totalUnread: 0,
  notifications: [], // Array of notification objects with user info and message preview

  incrementChannelUnread: (channelId, amount = 1) => {
    const current = get().channelUnreadMap[channelId] || 0;
    const updated = { ...get().channelUnreadMap, [channelId]: current + amount };
    const totalUnread = Object.values(updated).reduce((a, b) => a + b, 0);
    set({ channelUnreadMap: updated, totalUnread });
  },

  resetChannelUnread: (channelId) => {
    const updated = { ...get().channelUnreadMap, [channelId]: 0 };
    const totalUnread = Object.values(updated).reduce((a, b) => a + b, 0);
    set({ channelUnreadMap: updated, totalUnread });
  },

  setUnreadFromServer: (channelIdToCount) => {
    const totalUnread = Object.values(channelIdToCount || {}).reduce((a, b) => a + b, 0);
    set({ channelUnreadMap: channelIdToCount || {}, totalUnread });
  },

  addNotification: (notification) => {
    const currentNotifications = get().notifications;
    // Add new notification at the beginning
    const updatedNotifications = [notification, ...currentNotifications];
    // Keep only last 50 notifications
    const trimmedNotifications = updatedNotifications.slice(0, 50);
    set({ notifications: trimmedNotifications });
  },

  clearNotifications: () => set({ notifications: [] }),

  clearNotificationsBySender: (senderId) => {
    const filtered = (get().notifications || []).filter(n => n.senderId !== senderId);
    set({ notifications: filtered });
  },

  clearAllUnread: () => set({ channelUnreadMap: {}, totalUnread: 0 }),
}));


