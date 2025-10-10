'use client';

import { useState } from 'react';
import { useNotifications } from '@/hooks/use-notifications';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { X, Check, CheckCheck } from 'lucide-react';

export default function NotificationsPage() {
  const { notifications, loading, markAsRead, deleteNotification, markAllAsRead } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread' && n.read) return false;
    if (typeFilter !== 'all' && !n.type.startsWith(typeFilter)) return false;
    return true;
  });

  const getTypeIcon = (type: string) => {
    if (type.startsWith('ORDER_')) return '📦';
    if (type.startsWith('BOOST_')) return '🎮';
    if (type.startsWith('MESSAGE_')) return '💬';
    return '🔔';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'border-red-500';
      case 'HIGH':
        return 'border-orange-500';
      case 'NORMAL':
        return 'border-blue-500';
      default:
        return 'border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Bildirimler
        </h1>
        <p className="text-muted-foreground">
          Tüm bildirimlerinizi buradan yönetin
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-accent text-accent-foreground hover:bg-accent/80'
            }`}
          >
            Tümü
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'unread'
                ? 'bg-primary text-primary-foreground'
                : 'bg-accent text-accent-foreground hover:bg-accent/80'
            }`}
          >
            Okunmamış
          </button>
        </div>

        <div className="flex gap-2 items-center">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 rounded-lg bg-accent text-foreground border border-border"
          >
            <option value="all">Tüm Türler</option>
            <option value="ORDER_">Sipariş Bildirimleri</option>
            <option value="BOOST_">Booster Bildirimleri</option>
            <option value="MESSAGE_">Mesaj Bildirimleri</option>
            <option value="SYSTEM_">Sistem Bildirimleri</option>
          </select>

          {notifications.some(n => !n.read) && (
            <button
              onClick={() => markAllAsRead()}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <CheckCheck className="w-4 h-4" />
              Tümünü Okundu İşaretle
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-accent rounded-lg">
            {filter === 'unread' ? 'Okunmamış bildirim yok' : 'Henüz bildirim yok'}
          </div>
        ) : (
          filteredNotifications.map(notification => (
            <div
              key={notification.id}
              className={`p-6 rounded-lg border-l-4 ${getPriorityColor(notification.priority)} ${
                !notification.read
                  ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                  : 'bg-background border border-border'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-3xl">{getTypeIcon(notification.type)}</span>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {notification.title}
                    </h3>
                    <p className="text-muted-foreground mb-3">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                          locale: tr,
                        })}
                      </span>
                      <span className="px-2 py-1 rounded bg-accent text-xs font-medium">
                        {notification.priority}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="p-2 text-primary hover:text-primary/80 transition-colors"
                      title="Okundu işaretle"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="p-2 text-destructive hover:text-destructive/80 transition-colors"
                    title="Sil"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

