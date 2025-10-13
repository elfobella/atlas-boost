"use client"

import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Gamepad2, Eye, Star, Clock, Shield, AlertCircle } from 'lucide-react'
import { useState, useEffect } from 'react'

interface Order {
  id: string;
  game: string;
  currentRank: string;
  targetRank: string;
  price: number;
  orderStatus: string;
  progress: number;
  createdAt: string;
  booster?: {
    id: string;
    name: string;
    rating: number;
  };
}

export default function OrdersPage() {
  const { data: session, status } = useSession()
  const t = useTranslations('dashboard')
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    if (status === 'authenticated') {
      fetchOrders()
    }
  }, [status])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders?limit=50')
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'text-yellow-600 bg-yellow-100'
      case 'PAID': return 'text-blue-600 bg-blue-100'
      case 'ASSIGNED': return 'text-purple-600 bg-purple-100'
      case 'IN_PROGRESS': return 'text-green-600 bg-green-100'
      case 'COMPLETED': return 'text-gray-600 bg-gray-100'
      case 'CANCELLED': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Beklemede'
      case 'PAID': return 'Ödendi'
      case 'ASSIGNED': return 'Atandı'
      case 'IN_PROGRESS': return 'Devam Ediyor'
      case 'COMPLETED': return 'Tamamlandı'
      case 'CANCELLED': return 'İptal Edildi'
      default: return status
    }
  }

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true
    return order.orderStatus === filter
  })

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Giriş Gerekli</h1>
          <p className="text-muted-foreground mb-6">Bu sayfaya erişmek için giriş yapmanız gerekiyor.</p>
          <Link
            href="/auth/signin"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Giriş Yap
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Gamepad2 className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Siparişlerim</h1>
                <p className="text-muted-foreground">Tüm siparişlerinizi görüntüleyin ve takip edin</p>
              </div>
            </div>
            <Link
              href="/games/rank-selector"
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Yeni Sipariş Ver
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'all' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Tümü ({orders.length})
            </button>
            <button
              onClick={() => setFilter('PENDING')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'PENDING' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Beklemede ({orders.filter(o => o.orderStatus === 'PENDING').length})
            </button>
            <button
              onClick={() => setFilter('IN_PROGRESS')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'IN_PROGRESS' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Devam Ediyor ({orders.filter(o => o.orderStatus === 'IN_PROGRESS').length})
            </button>
            <button
              onClick={() => setFilter('COMPLETED')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'COMPLETED' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Tamamlandı ({orders.filter(o => o.orderStatus === 'COMPLETED').length})
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-card border border-border rounded-lg">
          {filteredOrders.length === 0 ? (
            <div className="p-8 text-center">
              <Gamepad2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {filter === 'all' ? 'Henüz sipariş vermediniz' : 'Bu kategoride sipariş bulunmuyor'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {filter === 'all' 
                  ? 'İlk siparişinizi vermek için yeni sipariş butonunu kullanın.' 
                  : 'Bu durumda hiç sipariş bulunmuyor.'}
              </p>
              {filter === 'all' && (
                <Link
                  href="/games/rank-selector"
                  className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Yeni Sipariş Ver
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border">
                  <tr>
                    <th className="text-left p-4 font-medium text-foreground">Oyun</th>
                    <th className="text-left p-4 font-medium text-foreground">Rank</th>
                    <th className="text-left p-4 font-medium text-foreground">Fiyat</th>
                    <th className="text-left p-4 font-medium text-foreground">Durum</th>
                    <th className="text-left p-4 font-medium text-foreground">Booster</th>
                    <th className="text-left p-4 font-medium text-foreground">Tarih</th>
                    <th className="text-left p-4 font-medium text-foreground">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b border-border hover:bg-accent/50">
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <Gamepad2 className="h-5 w-5 text-primary" />
                          <span className="font-medium capitalize">{order.game}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          <span className="text-muted-foreground">{order.currentRank}</span>
                          <span className="mx-2">→</span>
                          <span className="font-medium">{order.targetRank}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-medium text-primary">{order.price}₺</span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                          {getStatusText(order.orderStatus)}
                        </span>
                        {order.progress > 0 && order.orderStatus === 'IN_PROGRESS' && (
                          <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-primary h-1.5 rounded-full transition-all duration-300" 
                              style={{ width: `${order.progress}%` }}
                            ></div>
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        {order.booster ? (
                          <div className="flex items-center space-x-2">
                            <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-primary">
                                {order.booster.name?.charAt(0) || 'B'}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-medium">{order.booster.name}</div>
                              <div className="flex items-center space-x-1">
                                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                <span className="text-xs text-muted-foreground">{order.booster.rating}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Atanmadı</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/dashboard/orders/${order.id}`}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10 rounded"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Detay
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
