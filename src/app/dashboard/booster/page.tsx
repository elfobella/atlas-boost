/* eslint-disable react/no-unescaped-entities */
'use client'

import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Gamepad2, LogOut, Star, Clock, Shield, Eye, DollarSign, ShoppingBag, Briefcase, Search, SlidersHorizontal, X } from 'lucide-react'
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
  boosterEarnings: number;
  estimatedHours?: number;
  currency: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface BoosterStats {
  totalJobs: number;
  activeJobs: number;
  completedJobs: number;
  totalEarnings: number;
  averageRating: number;
}

type TabType = 'available' | 'my-orders'
type SortOption = 'date-desc' | 'date-asc' | 'price-desc' | 'price-asc' | 'earnings-desc' | 'earnings-asc'

export default function BoosterDashboardPage() {
  const { data: session, status } = useSession()
  const t = useTranslations('dashboard')
  const [activeTab, setActiveTab] = useState<TabType>('my-orders')
  const [myOrders, setMyOrders] = useState<Order[]>([])
  const [availableOrders, setAvailableOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<BoosterStats>({
    totalJobs: 0,
    activeJobs: 0,
    completedJobs: 0,
    totalEarnings: 0,
    averageRating: 0
  })
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState<string | null>(null)
  
  // Filters & Sorting
  const [gameFilter, setGameFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<SortOption>('date-desc')
  const [searchTerm, setSearchTerm] = useState('')

  // Filtreleme ve sıralama fonksiyonları
  const applyFiltersAndSort = (orders: Order[]) => {
    let filtered = [...orders]

    // Oyun filtresi
    if (gameFilter !== 'all') {
      filtered = filtered.filter(o => o.game === gameFilter)
    }

    // Durum filtresi
    if (statusFilter !== 'all') {
      filtered = filtered.filter(o => o.orderStatus === statusFilter)
    }

    // Arama (müşteri email veya rank)
    if (searchTerm) {
      filtered = filtered.filter(o => 
        o.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.currentRank?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.targetRank?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Sıralama
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'date-asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'price-desc':
          return b.price - a.price
        case 'price-asc':
          return a.price - b.price
        case 'earnings-desc':
          return (b.boosterEarnings || 0) - (a.boosterEarnings || 0)
        case 'earnings-asc':
          return (a.boosterEarnings || 0) - (b.boosterEarnings || 0)
        default:
          return 0
      }
    })

    return filtered
  }

  const filteredMyOrders = applyFiltersAndSort(myOrders)
  const filteredAvailableOrders = applyFiltersAndSort(availableOrders)

  // Booster kontrolü
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'BOOSTER') {
      window.location.href = '/dashboard'
    }
  }, [status, session])

  // Sipariş verilerini çek
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'BOOSTER') {
      fetchMyOrders()
      fetchAvailableOrders()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session?.user?.role])

  const fetchMyOrders = async () => {
    try {
      // Booster'a atanmış siparişler
      const response = await fetch('/api/orders?limit=50')
      if (response.ok) {
        const data = await response.json()
        setMyOrders(data.orders)
        
        // İstatistikleri hesapla
        const totalJobs = data.pagination.total
        const activeJobs = data.orders.filter((order: Order) => 
          ['ASSIGNED', 'IN_PROGRESS'].includes(order.orderStatus)
        ).length
        const completedJobs = data.orders.filter((order: Order) => 
          order.orderStatus === 'COMPLETED'
        ).length
        const totalEarnings = data.orders
          .filter((order: Order) => order.orderStatus === 'COMPLETED')
          .reduce((sum: number, order: Order) => sum + (order.boosterEarnings || 0), 0)
        
        setStats({
          totalJobs,
          activeJobs,
          completedJobs,
          totalEarnings,
          averageRating: session?.user?.rating || 0
        })
      }
    } catch (error) {
      console.error('Error fetching my orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableOrders = async () => {
    try {
      // Tüm boosterlara açık siparişler (PAID durumunda)
      const response = await fetch('/api/orders/available')
      if (response.ok) {
        const data = await response.json()
        setAvailableOrders(data.orders)
      }
    } catch (error) {
      console.error('Error fetching available orders:', error)
    }
  }

  const claimOrder = async (orderId: string) => {
    if (claiming) return
    
    setClaiming(orderId)
    try {
      const response = await fetch(`/api/orders/${orderId}/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        // Başarılı - verileri yenile
        await fetchMyOrders()
        await fetchAvailableOrders()
        setActiveTab('my-orders') // Siparişlerim sekmesine geç
      } else {
        const error = await response.json()
        alert(error.error || 'Sipariş alınırken hata oluştu')
      }
    } catch (error) {
      console.error('Error claiming order:', error)
      alert('Sipariş alınırken hata oluştu')
    } finally {
      setClaiming(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ASSIGNED': return 'text-purple-600 bg-purple-100'
      case 'IN_PROGRESS': return 'text-green-600 bg-green-100'
      case 'COMPLETED': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ASSIGNED': return 'Atandı'
      case 'IN_PROGRESS': return 'Devam Ediyor'
      case 'COMPLETED': return 'Tamamlandı'
      default: return status
    }
  }

  const updateOrderProgress = async (orderId: string, progress: number, notes?: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          progress,
          notes,
          orderStatus: progress === 100 ? 'COMPLETED' : 'IN_PROGRESS'
        })
      })

      if (response.ok) {
        fetchMyOrders() // Verileri yenile
      }
    } catch (error) {
      console.error('Error updating order:', error)
    }
  }

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

  if (session?.user?.role !== 'BOOSTER') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Erişim Reddedildi</h1>
          <p className="text-muted-foreground mb-6">Bu sayfaya sadece boosterlar erişebilir.</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Ana Dashboard
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
                <h1 className="text-2xl font-bold text-foreground">Booster Dashboard</h1>
                <p className="text-muted-foreground">Hoş geldin, {session?.user?.name || session?.user?.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Rating</p>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="font-medium">{session?.user?.rating || 0}</span>
                </div>
              </div>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Toplam İş</p>
                    <p className="text-2xl font-bold text-foreground">{stats.totalJobs}</p>
                  </div>
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Star className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Aktif İş</p>
                    <p className="text-2xl font-bold text-foreground">{stats.activeJobs}</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                    <Clock className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Tamamlanan</p>
                    <p className="text-2xl font-bold text-foreground">{stats.completedJobs}</p>
                  </div>
                  <div className="h-12 w-12 bg-green-500/10 rounded-full flex items-center justify-center">
                    <Shield className="h-6 w-6 text-green-500" />
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Toplam Kazanç</p>
                    <p className="text-2xl font-bold text-foreground">{stats.totalEarnings.toFixed(0)}₺</p>
                  </div>
                  <div className="h-12 w-12 bg-yellow-500/10 rounded-full flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-yellow-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-6">Hızlı İşlemler</h2>
            <div className="space-y-4">
              <Link
                href="/dashboard/booster/profile"
                className="block w-full bg-primary text-primary-foreground px-4 py-3 rounded-md hover:bg-primary/90 transition-colors text-center"
              >
                Profil Ayarları
              </Link>
              
              <Link
                href="/dashboard/booster/earnings"
                className="block w-full border border-border text-foreground px-4 py-3 rounded-md hover:bg-accent transition-colors text-center"
              >
                Kazanç Raporu
              </Link>
              
              <button
                onClick={() => {
                  fetchMyOrders()
                  fetchAvailableOrders()
                }}
                className="block w-full border border-border text-foreground px-4 py-3 rounded-md hover:bg-accent transition-colors text-center"
              >
                Verileri Yenile
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-8">
          <div className="border-b border-border mb-6">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('my-orders')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'my-orders'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Briefcase className="h-4 w-4" />
                  <span>Atanan İşlerim</span>
                  {myOrders.length > 0 && (
                    <span className="ml-2 bg-primary text-primary-foreground px-2 py-0.5 rounded-full text-xs">
                      {myOrders.length}
                    </span>
                  )}
                </div>
              </button>
              <button
                onClick={() => setActiveTab('available')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'available'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <ShoppingBag className="h-4 w-4" />
                  <span>Müsait Siparişler</span>
                  {availableOrders.length > 0 && (
                    <span className="ml-2 bg-muted text-muted-foreground px-2 py-0.5 rounded-full text-xs">
                      {availableOrders.length}
                    </span>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="mt-6 p-4 bg-card border border-border rounded-lg">
            <div className="flex items-center gap-2 mb-4">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">Filtrele ve Sırala</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Arama */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Müşteri veya rank ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-8 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Oyun Filtresi */}
              <select
                value={gameFilter}
                onChange={(e) => setGameFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">Tüm Oyunlar</option>
                <option value="lol">League of Legends</option>
                <option value="valorant">Valorant</option>
              </select>

              {/* Durum Filtresi */}
              {activeTab === 'my-orders' && (
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="all">Tüm Durumlar</option>
                  <option value="ASSIGNED">Atandı</option>
                  <option value="IN_PROGRESS">Devam Ediyor</option>
                  <option value="COMPLETED">Tamamlandı</option>
                </select>
              )}

              {/* Sıralama */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="date-desc">🕒 En Yeni</option>
                <option value="date-asc">🕒 En Eski</option>
                <option value="price-desc">💰 En Pahalı</option>
                <option value="price-asc">💰 En Ucuz</option>
                {activeTab === 'my-orders' && (
                  <>
                    <option value="earnings-desc">💵 Kazanç (Yüksek)</option>
                    <option value="earnings-asc">💵 Kazanç (Düşük)</option>
                  </>
                )}
              </select>
            </div>

            {/* Active Filters Info */}
            {(gameFilter !== 'all' || statusFilter !== 'all' || searchTerm) && (
              <div className="mt-3 flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">Aktif filtreler:</span>
                {gameFilter !== 'all' && (
                  <span className="px-2 py-1 bg-primary/10 text-primary rounded-md">
                    {gameFilter === 'lol' ? 'LoL' : 'Valorant'}
                  </span>
                )}
                {statusFilter !== 'all' && (
                  <span className="px-2 py-1 bg-primary/10 text-primary rounded-md">
                    {statusFilter}
                  </span>
                )}
                {searchTerm && (
                  <span className="px-2 py-1 bg-primary/10 text-primary rounded-md">
                    "{searchTerm}"
                  </span>
                )}
                <button
                  onClick={() => {
                    setGameFilter('all')
                    setStatusFilter('all')
                    setSearchTerm('')
                  }}
                  className="text-primary hover:text-primary/80 underline"
                >
                  Filtreleri Temizle
                </button>
              </div>
            )}
          </div>

          {/* Available Orders Tab */}
          {activeTab === 'available' && (
            <div>
              <div className="mt-6 mb-4 p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                <p className="text-sm text-foreground">
                  <strong>🛍️ Müsait Siparişler:</strong> Ödeme yapılmış ve booster bekleyen siparişler. İstediğiniz siparişi alabilirsiniz.
                </p>
              </div>
              <div className="bg-card border border-border rounded-lg">
              {filteredAvailableOrders.length === 0 ? (
                <div className="p-6">
                  <div className="text-center text-muted-foreground">
                    <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="font-medium">
                      {availableOrders.length === 0 
                        ? 'Şu an alınabilecek sipariş yok' 
                        : 'Filtre sonucu gösterilecek sipariş yok'}
                    </p>
                    <p className="text-sm mt-2">
                      {availableOrders.length === 0
                        ? 'Ödeme yapılan siparişler burada görünecek.'
                        : 'Farklı filtreler deneyin.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-border bg-muted/30">
                      <tr>
                        <th className="text-left p-4 font-medium text-foreground text-sm">Oyun</th>
                        <th className="text-left p-4 font-medium text-foreground text-sm">Rank</th>
                        <th className="text-left p-4 font-medium text-foreground text-sm">Müşteri</th>
                        <th className="text-left p-4 font-medium text-foreground text-sm">Ücret</th>
                        <th className="text-left p-4 font-medium text-foreground text-sm">Kazanç</th>
                        <th className="text-left p-4 font-medium text-foreground text-sm">Tarih</th>
                        <th className="text-left p-4 font-medium text-foreground text-sm">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAvailableOrders.map((order) => (
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
                            <div className="text-sm">
                              <div className="font-medium">{order.user.name}</div>
                              <div className="text-muted-foreground text-xs">{order.user.email}</div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-sm font-semibold">
                              {order.price}{order.currency === 'USD' ? '$' : '₺'}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-sm">
                              <div className="font-bold text-green-600">
                                {(order.price * 0.7).toFixed(2)}{order.currency === 'USD' ? '$' : '₺'}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                (%70)
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-xs text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString('tr-TR', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => claimOrder(order.id)}
                              disabled={claiming === order.id}
                              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {claiming === order.id ? 'Alınıyor...' : 'Siparişi Al'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            </div>
          )}

          {/* My Orders Tab */}
          {activeTab === 'my-orders' && (
            <div>
              <div className="mt-6 mb-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <p className="text-sm text-foreground">
                  <strong>📋 Atanan İşlerim:</strong> Size atanan ve üzerinde çalıştığınız siparişler burada görünür.
                </p>
              </div>
              <div className="bg-card border border-border rounded-lg">
              {filteredMyOrders.length === 0 ? (
                <div className="p-6">
                  <div className="text-center text-muted-foreground">
                    <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="font-medium">Size atanan iş yok</p>
                    <p className="text-sm mt-2">Müsait siparişler sekmesinden iş alabilir veya otomatik atama bekleyebilirsiniz.</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-border">
                      <tr>
                        <th className="text-left p-4 font-medium text-foreground">Oyun</th>
                        <th className="text-left p-4 font-medium text-foreground">Rank</th>
                        <th className="text-left p-4 font-medium text-foreground">Müşteri</th>
                        <th className="text-left p-4 font-medium text-foreground">Kazanç</th>
                        <th className="text-left p-4 font-medium text-foreground">Durum</th>
                        <th className="text-left p-4 font-medium text-foreground">İlerleme</th>
                        <th className="text-left p-4 font-medium text-foreground">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myOrders.map((order) => (
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
                            <div className="text-sm">
                              <div className="font-medium">{order.user.name}</div>
                              <div className="text-muted-foreground text-xs">{order.user.email}</div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="font-medium text-green-600">{order.boosterEarnings}₺</span>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                              {getStatusText(order.orderStatus)}
                            </span>
                          </td>
                          <td className="p-4">
                            {order.orderStatus === 'IN_PROGRESS' && (
                              <div className="flex items-center space-x-2">
                                <div className="w-full bg-gray-200 rounded-full h-2 min-w-[80px]">
                                  <div 
                                    className="bg-primary h-2 rounded-full transition-all duration-300" 
                                    style={{ width: `${order.progress}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">{order.progress}%</span>
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              <Link
                                href={`/dashboard/booster/orders/${order.id}`}
                                className="inline-flex items-center px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10 rounded"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                Detay
                              </Link>
                              {order.orderStatus === 'ASSIGNED' && (
                                <button
                                  onClick={() => updateOrderProgress(order.id, 0, 'İşe başladım')}
                                  className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-600 hover:bg-green-50 rounded"
                                >
                                  Başlat
                                </button>
                              )}
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
          )}
        </div>
      </div>
    </div>
  )
}
