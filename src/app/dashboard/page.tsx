'use client'

import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Gamepad2, LogOut, Star, Clock, Shield } from 'lucide-react'
import { signOut } from 'next-auth/react'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const t = useTranslations('dashboard')

  if (status === 'loading') {
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
                    <p className="text-2xl font-bold text-foreground">0</p>
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
                    <p className="text-2xl font-bold text-foreground">0</p>
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
                    <p className="text-2xl font-bold text-foreground">0</p>
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
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-center text-muted-foreground">
              <Gamepad2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{t('noOrdersYet')}</p>
              <p className="text-sm mt-2">{t('noOrdersDesc')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
