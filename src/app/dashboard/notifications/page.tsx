/* eslint-disable react/no-unescaped-entities */
'use client';

import { useState } from 'react';
import { useNotifications } from '@/hooks/use-notifications';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import Link from 'next/link';
import { Bell, Trash2, Check, CheckCheck, Filter, ArrowLeft } from 'lucide-react';

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Bell className="h-12 w-12 mx-auto mb-4 text-primary animate-pulse" />
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard'a Dön
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bell className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Bildirimler
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Tüm bildirimlerinizi buradan yönetin
              </p>
            </div>
          </div>
        </div>

      {/* Filters & Actions */}
      <div className="mb-6 p-4 rounded-lg border border-border bg-card">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          {/* Filter Tabs */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                Tümü ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  filter === 'unread'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                Okunmamış ({notifications.filter(n => !n.read).length})
              </button>
            </div>
          </div>

          {/* Type Filter & Actions */}
          <div className="flex gap-2 items-center flex-wrap">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 rounded-md text-sm bg-background border border-input focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all"
            >
              <option value="all">Tüm Türler</option>
              <option value="ORDER_">📦 Sipariş</option>
              <option value="BOOST_">🎮 Booster</option>
              <option value="MESSAGE_">💬 Mesaj</option>
              <option value="SYSTEM_">⚙️ Sistem</option>
            </select>

            {notifications.some(n => !n.read) && (
              <button
                onClick={() => markAllAsRead()}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
              >
                <CheckCheck className="w-4 h-4" />
                Tümünü Okundu
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-16 rounded-lg border border-dashed border-border bg-card">
            <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-lg font-medium text-foreground mb-1">
              {filter === 'unread' ? 'Okunmamış bildirim yok' : 'Henüz bildirim yok'}
            </p>
            <p className="text-sm text-muted-foreground">
              Yeni bildirimler burada görünecek
            </p>
          </div>
        ) : (
          filteredNotifications.map(notification => (
            <div
              key={notification.id}
              className={`group relative rounded-lg border transition-all duration-200 hover:shadow-md ${
                !notification.read
                  ? 'bg-primary/5 border-l-4 border-l-primary border-t border-r border-b border-primary/20'
                  : 'bg-card border-border hover:border-primary/30'
              }`}
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-2xl">
                    {getTypeIcon(notification.type)}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Title */}
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-2 flex-1">
                        <h3 className="text-base font-semibold text-foreground">
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <span className="flex-shrink-0 w-2 h-2 bg-primary rounded-full animate-pulse" />
                        )}
                      </div>
                    </div>
                    
                    {/* Message */}
                    <p className="text-sm text-muted-foreground mb-3">
                      {notification.message}
                    </p>
                    
                    {/* Footer */}
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-muted-foreground/70">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                          locale: tr,
                        })}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md border font-medium ${getPriorityColor(notification.priority)} ${
                        notification.priority === 'URGENT' ? 'bg-red-500/10 text-red-600 dark:text-red-400' :
                        notification.priority === 'HIGH' ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400' :
                        'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      }`}>
                        {notification.priority}
                      </span>
                      {notification.actionUrl && (
                        <Link
                          href={notification.actionUrl}
                          onClick={() => markAsRead(notification.id)}
                          className="text-primary hover:text-primary/80 font-medium"
                        >
                          Görüntüle →
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-2 rounded-md hover:bg-primary/10 text-primary transition-colors"
                        title="Okundu işaretle"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-2 rounded-md hover:bg-destructive/10 text-destructive transition-colors"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      </div>
    </div>
  );
}

