import { create } from 'zustand';
import { socketEvents } from '@/lib/socket';
import { apiClient } from '@/lib/api-client';

export interface InAppNotification {
  id: string;
  title: string;
  body: string;
  template: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationState {
  notifications: InAppNotification[];
  unreadCount: number;
  isOpen: boolean;

  fetchNotifications: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  addNotification: (n: InAppNotification) => void;
  setOpen: (open: boolean) => void;
  subscribeToSocket: () => () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isOpen: false,

  fetchNotifications: async () => {
    try {
      const { data } = await apiClient.get('/notifications/in-app');
      const notifications: InAppNotification[] = data.data ?? [];
      set({
        notifications,
        unreadCount: notifications.filter((n) => !n.isRead).length,
      });
    } catch {
      // Silently fail — notifications are non-critical
    }
  },

  markRead: async (id) => {
    try {
      await apiClient.patch(`/notifications/in-app/${id}/read`);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n,
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch {}
  },

  markAllRead: async () => {
    try {
      await apiClient.patch('/notifications/in-app/read-all');
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch {}
  },

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications].slice(0, 100),
      unreadCount: state.unreadCount + 1,
    }));
  },

  setOpen: (open) => set({ isOpen: open }),

  subscribeToSocket: () => {
    const unsubNotice = socketEvents.onNotice((notice) => {
      get().addNotification({
        id: notice.id,
        title: notice.title,
        body: notice.body,
        template: 'NEW_NOTICE',
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    });

    return () => {
      unsubNotice();
    };
  },
}));
