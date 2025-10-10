import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useNotificationStore } from '@/stores/notification-store';

interface NotificationResponse {
  notifications: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  unreadCount: number;
}

export function useNotifications(options?: { unreadOnly?: boolean; type?: string }) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const store = useNotificationStore();

  // Fetch notifications
  const query = useQuery({
    queryKey: ['notifications', options],
    queryFn: async (): Promise<NotificationResponse> => {
      const params = new URLSearchParams();
      if (options?.unreadOnly) params.set('unreadOnly', 'true');
      if (options?.type) params.set('type', options.type);
      params.set('limit', '50');

      const response = await fetch(`/api/notifications?${params}`);
      if (!response.ok) throw new Error('Failed to fetch notifications');
      return response.json();
    },
    enabled: !!session?.user?.id,
    refetchOnWindowFocus: false,
  });

  // Sync with store
  useEffect(() => {
    if (query.data) {
      store.setNotifications(query.data.notifications);
      store.setUnreadCount(query.data.unreadCount);
      store.setLoading(query.isLoading);
    }
  }, [query.data, query.isLoading]);

  // Initialize Pusher
  useEffect(() => {
    if (session?.user?.id) {
      store.initializePusher(session.user.id);
    }
    return () => {
      store.disconnectPusher();
    };
  }, [session?.user?.id]);

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
      });
      if (!response.ok) throw new Error('Failed to mark as read');
      return response.json();
    },
    onSuccess: (_, id) => {
      store.markAsRead(id);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/notifications/read-all', {
        method: 'PUT',
      });
      if (!response.ok) throw new Error('Failed to mark all as read');
      return response.json();
    },
    onSuccess: () => {
      store.markAllAsRead();
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete notification');
      return response.json();
    },
    onSuccess: (_, id) => {
      store.removeNotification(id);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return {
    notifications: store.notifications,
    unreadCount: store.unreadCount,
    loading: store.loading,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    deleteNotification: deleteNotificationMutation.mutate,
    refetch: query.refetch,
  };
}

// Notification preferences hook
export function useNotificationPreferences() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['notificationPreferences'],
    queryFn: async () => {
      const response = await fetch('/api/notifications/preferences');
      if (!response.ok) throw new Error('Failed to fetch preferences');
      return response.json();
    },
    enabled: !!session?.user?.id,
  });

  const updateMutation = useMutation({
    mutationFn: async (preferences: any) => {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });
      if (!response.ok) throw new Error('Failed to update preferences');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationPreferences'] });
    },
  });

  return {
    preferences: query.data,
    loading: query.isLoading,
    updatePreferences: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
}

