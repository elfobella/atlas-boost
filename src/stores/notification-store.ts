/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import Pusher from 'pusher-js';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: string;
  read: boolean;
  actionUrl?: string;
  data?: any;
  createdAt: string;
}

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  pusher: Pusher | null;
  
  // Actions
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  setUnreadCount: (count: number) => void;
  setLoading: (loading: boolean) => void;
  
  // Pusher
  initializePusher: (userId: string) => void;
  disconnectPusher: () => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: true,
  pusher: null,
  
  setNotifications: (notifications) => set({ notifications }),
  
  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
    
    // Browser notification göster
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/images/logo.png',
        badge: '/images/badge.png',
      });
    }
  },
  
  markAsRead: (id) => {
    set((state) => {
      const notification = state.notifications.find(n => n.id === id);
      if (notification && !notification.read) {
        return {
          notifications: state.notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        };
      }
      return state;
    });
  },
  
  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map(n => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },
  
  removeNotification: (id) => {
    set((state) => {
      const notification = state.notifications.find(n => n.id === id);
      return {
        notifications: state.notifications.filter(n => n.id !== id),
        unreadCount: notification && !notification.read 
          ? Math.max(0, state.unreadCount - 1)
          : state.unreadCount,
      };
    });
  },
  
  setUnreadCount: (count) => set({ unreadCount: count }),
  
  setLoading: (loading) => set({ loading }),
  
  initializePusher: (userId) => {
    if (typeof window === 'undefined') return;
    
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
    
    console.log('🔌 Initializing Pusher:', {
      userId,
      hasKey: !!pusherKey,
      hasCluster: !!pusherCluster,
      key: pusherKey ? `${pusherKey.substring(0, 10)}...` : 'missing',
      cluster: pusherCluster || 'missing',
    });
    
    if (!pusherKey || !pusherCluster) {
      console.warn('⚠️ Pusher credentials not configured - real-time notifications disabled');
      return;
    }
    
    try {
      const pusher = new Pusher(pusherKey, {
        cluster: pusherCluster,
      });
      
      const channel = pusher.subscribe(`user-${userId}`);
      console.log('📡 Subscribed to channel:', `user-${userId}`);
      
      channel.bind('notification', (data: Notification) => {
        console.log('📬 Received notification from Pusher:', data);
        get().addNotification(data);
      });
      
      channel.bind('pusher:subscription_succeeded', () => {
        console.log('✅ Pusher subscription succeeded');
      });
      
      channel.bind('pusher:subscription_error', (error: any) => {
        console.error('❌ Pusher subscription error:', error);
      });
      
      set({ pusher });
      console.log('✅ Pusher initialized successfully');
    } catch (error) {
      console.error('❌ Pusher initialization error:', error);
    }
  },
  
  disconnectPusher: () => {
    const { pusher } = get();
    if (pusher) {
      pusher.disconnect();
      set({ pusher: null });
    }
  },
}));

