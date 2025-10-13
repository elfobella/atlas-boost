'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { X } from 'lucide-react';

export function PushSubscription() {
  const { data: session } = useSession();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
      
      // Eğer izin verilmemişse ve daha önce reddedilmemişse prompt göster
      if (Notification.permission === 'default' && session?.user) {
        setTimeout(() => setShowPrompt(true), 3000); // 3 saniye sonra göster
      }
    }
  }, [session]);

  const subscribeToPush = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      alert('Push notifications are not supported in your browser');
      return;
    }

    try {
      // Service worker'ı kaydet
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      // İzin iste
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);

      if (permissionResult !== 'granted') {
        setShowPrompt(false);
        return;
      }

      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        console.warn('VAPID public key not configured');
        return;
      }

      // Push subscription oluştur
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
      });

      // Subscription'ı sunucuya gönder
      await fetch('/api/notifications/push-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: subscription.toJSON(),
          device: 'web',
        }),
      });

      setShowPrompt(false);
    } catch (error) {
      console.error('Push subscription error:', error);
      setShowPrompt(false);
    }
  };

  if (!session || !showPrompt || permission === 'granted') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-background p-4 rounded-lg shadow-lg border border-border max-w-sm z-50">
      <button
        onClick={() => setShowPrompt(false)}
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
      >
        <X className="w-4 h-4" />
      </button>
      
      <h3 className="font-semibold text-foreground mb-2">
        🔔 Bildirimleri Aç
      </h3>
      <p className="text-sm text-muted-foreground mb-3">
        Önemli güncellemelerden haberdar olmak için bildirimleri etkinleştirin
      </p>
      <button
        onClick={subscribeToPush}
        className="w-full py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
      >
        Bildirimleri Etkinleştir
      </button>
    </div>
  );
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

