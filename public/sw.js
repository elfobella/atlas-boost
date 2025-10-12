// Service Worker for Push Notifications

self.addEventListener('push', function(event) {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: data.icon || '/images/logo.png',
      badge: data.badge || '/images/badge.png',
      data: data.data,
      vibrate: [200, 100, 200],
      actions: data.data?.url ? [
        { action: 'view', title: 'Görüntüle' },
        { action: 'close', title: 'Kapat' }
      ] : [],
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  } catch (error) {
    console.error('Push event error:', error);
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  if (event.action === 'view' && event.notification.data?.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  } else if (!event.action && event.notification.data?.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});

