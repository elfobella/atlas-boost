'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Order {
  id: string;
  game: string;
  currentRank: string;
  targetRank: string;
  price: number;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
  booster?: { name: string };
  testUrl: string;
}

export default function TestNotificationsPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchOrders();
    }
  }, [status]);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/my-orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const testOrder = async (orderId: string, autoAssign: boolean = false) => {
    setTesting(true);
    setTestResult(null);
    
    try {
      const url = `/api/test-payment-flow?orderId=${orderId}${autoAssign ? '&autoAssign=true' : ''}`;
      const response = await fetch(url);
      const data = await response.json();
      setTestResult(data);
    } catch (error) {
      setTestResult({ error: 'Test failed', details: error });
    } finally {
      setTesting(false);
    }
  };

  const sendTestNotification = async () => {
    setTesting(true);
    setTestResult(null);
    
    try {
      const response = await fetch('/api/test-notification');
      const data = await response.json();
      setTestResult(data);
    } catch (error) {
      setTestResult({ error: 'Test failed', details: error });
    } finally {
      setTesting(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Yükleniyor...</p>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Giriş Yapmanız Gerekiyor</h1>
          <Link href="/auth/signin" className="text-primary hover:underline">
            Giriş Yap
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">🧪 Bildirim Test Sayfası</h1>
          <p className="text-muted-foreground">
            Ödeme ve bildirim sistemini test edin
          </p>
        </div>

        {/* Test Notification Button */}
        <div className="mb-8 p-6 border rounded-lg bg-card">
          <h2 className="text-xl font-semibold mb-4">Hızlı Test</h2>
          <button
            onClick={sendTestNotification}
            disabled={testing}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {testing ? '⏳ Test Ediliyor...' : '📧 Test Bildirimi Gönder'}
          </button>
          <p className="mt-2 text-sm text-muted-foreground">
            Size anında bir test bildirimi gönderir
          </p>
        </div>

        {/* Orders List */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Siparişleriniz</h2>
          
          {orders.length === 0 ? (
            <div className="p-6 border rounded-lg bg-card text-center">
              <p className="text-muted-foreground mb-4">
                Henüz siparişiniz yok
              </p>
              <Link 
                href="/games/rank-selector"
                className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Sipariş Oluştur
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="p-6 border rounded-lg bg-card">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {order.game.toUpperCase()} - {order.currentRank} → {order.targetRank}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        ID: <code className="text-xs bg-muted px-2 py-1 rounded">{order.id}</code>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{order.price} TL</p>
                      <span className={`inline-block px-2 py-1 rounded text-xs ${
                        order.orderStatus === 'PAID' ? 'bg-yellow-500/20 text-yellow-500' :
                        order.orderStatus === 'ASSIGNED' ? 'bg-blue-500/20 text-blue-500' :
                        order.orderStatus === 'COMPLETED' ? 'bg-green-500/20 text-green-500' :
                        'bg-gray-500/20 text-gray-500'
                      }`}>
                        {order.orderStatus}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => testOrder(order.id, false)}
                      disabled={testing}
                      className="px-4 py-2 bg-primary text-primary-foreground text-sm rounded-md hover:bg-primary/90 disabled:opacity-50"
                    >
                      {testing ? '⏳ Test Ediliyor...' : '💳 Ödeme Testi (Manuel Atama)'}
                    </button>
                    <button
                      onClick={() => testOrder(order.id, true)}
                      disabled={testing}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {testing ? '⏳ Test Ediliyor...' : '🤖 Ödeme + Otomatik Atama'}
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(order.id);
                        alert('Sipariş ID kopyalandı!');
                      }}
                      className="px-4 py-2 border text-sm rounded-md hover:bg-muted"
                    >
                      📋 ID Kopyala
                    </button>
                  </div>

                  {order.booster && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Booster: {order.booster.name}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Test Result */}
        {testResult && (
          <div className="p-6 border rounded-lg bg-card">
            <h2 className="text-xl font-semibold mb-4">
              {testResult.success ? '✅ Test Başarılı' : '❌ Test Başarısız'}
            </h2>
            
            {testResult.steps && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Adımlar:</h3>
                <ul className="space-y-1">
                  {testResult.steps.map((step: string, i: number) => (
                    <li key={i} className="text-sm">{step}</li>
                  ))}
                </ul>
              </div>
            )}

            <pre className="bg-muted p-4 rounded overflow-auto text-xs">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 p-6 border rounded-lg bg-muted/50">
          <h2 className="text-lg font-semibold mb-4">📝 Nasıl Test Edilir?</h2>
          <ol className="space-y-2 text-sm">
            <li><strong>1.</strong> "Test Bildirimi Gönder" - Basit bildirim testi</li>
            <li><strong>2.</strong> "💳 Ödeme Testi (Manuel Atama)" - Gerçek akışı simüle eder:
              <ul className="ml-4 mt-1 space-y-1 text-xs text-muted-foreground">
                <li>• Sipariş PAID yapılır</li>
                <li>• Müşteriye 2 bildirim gönderilir</li>
                <li>• Sipariş "Müsait Siparişler" listesinde görünür</li>
                <li>• Booster manuel olarak almalıdır</li>
              </ul>
            </li>
            <li><strong>3.</strong> "🤖 Ödeme + Otomatik Atama" - Test için otomatik atama:
              <ul className="ml-4 mt-1 space-y-1 text-xs text-muted-foreground">
                <li>• Yukarıdaki adımlar + otomatik booster ataması</li>
                <li>• Booster'a "Yeni İş" bildirimi gider</li>
                <li>• Sadece test amaçlı!</li>
              </ul>
            </li>
            <li><strong>4.</strong> Farklı sekmede booster olarak giriş yapıp bildirimleri kontrol edin</li>
          </ol>
          
          <div className="mt-4 flex gap-2">
            <Link 
              href="/dashboard/notifications" 
              className="text-sm text-primary hover:underline"
            >
              📬 Bildirimleri Görüntüle
            </Link>
            <span className="text-muted-foreground">|</span>
            <Link 
              href="/api/debug-notifications" 
              target="_blank"
              className="text-sm text-primary hover:underline"
            >
              🔍 Debug Bilgileri
            </Link>
            <span className="text-muted-foreground">|</span>
            <Link 
              href="/dashboard" 
              className="text-sm text-primary hover:underline"
            >
              🏠 Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


