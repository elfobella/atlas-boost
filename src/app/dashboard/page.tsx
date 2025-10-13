'use client'

import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Gamepad2, LogOut, Star, Clock, Shield, Eye } from 'lucide-react'
import { signOut } from 'next-auth/react'
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

interface OrderStats {
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const t = useTranslations('dashboard')
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<OrderStats>({
    totalOrders: 0,
    activeOrders: 0,
    completedOrders: 0
  })
  const [loading, setLoading] = useState(true)

  // Sipariş verilerini çek
  useEffect(() => {
    if (status === 'authenticated') {
      fetchOrders()
    }
  }, [status])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders?limit=10')
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders)
        
        // İstatistikleri hesapla
        const totalOrders = data.pagination.total
        const activeOrders = data.orders.filter((order: Order) => 
          ['PENDING', 'PAID', 'ASSIGNED', 'IN_PROGRESS'].includes(order.orderStatus)
        ).length
        const completedOrders = data.orders.filter((order: Order) => 
          order.orderStatus === 'COMPLETED'
        ).length
        
        setStats({
          totalOrders,
          activeOrders,
          completedOrders
        })
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

  // Role-based routing
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'BOOSTER') {
      window.location.href = '/dashboard/booster'
    }
  }, [status, session])

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
          <h1 className="text-2xl font-bold text-foreground mb-4">{t('signInRequired')}</h1>
          <p className="text-muted-foreground mb-6">{t('signInRequiredDesc')}</p>
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
                <h1 className="text-2xl font-bold text-foreground">Kontrol Paneli</h1>
                <p className="text-muted-foreground">{t('welcome')}, {session?.user?.name || session?.user?.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => signOut()}
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>{t('signOut')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stats Cards */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-foreground mb-6">İstatistikleriniz</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('totalOrders')}</p>
                    <p className="text-2xl font-bold text-foreground">{stats.totalOrders}</p>
                  </div>
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Star className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('activeOrders')}</p>
                    <p className="text-2xl font-bold text-foreground">{stats.activeOrders}</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                    <Clock className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('completed')}</p>
                    <p className="text-2xl font-bold text-foreground">{stats.completedOrders}</p>
                  </div>
                  <div className="h-12 w-12 bg-green-500/10 rounded-full flex items-center justify-center">
                    <Shield className="h-6 w-6 text-green-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-6">{t('quickActions')}</h2>
            <div className="space-y-4">
              <Link
                href="/games/rank-selector"
                className="block w-full bg-primary text-primary-foreground px-4 py-3 rounded-md hover:bg-primary/90 transition-colors text-center"
              >
{t('newOrder')}
              </Link>
              
              <Link
                href="/dashboard/orders"
                className="block w-full border border-border text-foreground px-4 py-3 rounded-md hover:bg-accent transition-colors text-center"
              >
{t('myOrders')}
              </Link>
              
              <Link
                href="/dashboard/profile"
                className="block w-full border border-border text-foreground px-4 py-3 rounded-md hover:bg-accent transition-colors text-center"
              >
{t('profileSettings')}
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-foreground mb-6">{t('recentOrders')}</h2>
          <div className="bg-card border border-border rounded-lg">
            {orders.length === 0 ? (
              <div className="p-6">
                <div className="text-center text-muted-foreground">
                  <Gamepad2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{t('noOrdersYet')}</p>
                  <p className="text-sm mt-2">{t('noOrdersDesc')}</p>
                </div>
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
                      <th className="text-left p-4 font-medium text-foreground">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
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
                            <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
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
    </div>
  )
}
