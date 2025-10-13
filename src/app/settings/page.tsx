"use client"

import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Settings as SettingsIcon, Bell, Shield, Globe, Palette } from 'lucide-react'
import Link from 'next/link'

export default function SettingsPage() {
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
          <div className="flex items-center space-x-4">
            <SettingsIcon className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Ayarlar</h1>
              <p className="text-muted-foreground">Hesap ve uygulama ayarlarınızı yönetin</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Account Settings */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Shield className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Hesap Ayarları</h2>
            </div>
            <div className="space-y-4">
              <Link
                href="/dashboard/profile"
                className="block p-4 border border-border rounded-md hover:bg-accent transition-colors"
              >
                <div className="font-medium text-foreground">Profil Bilgileri</div>
                <div className="text-sm text-muted-foreground">İsim, email ve diğer kişisel bilgilerinizi düzenleyin</div>
              </Link>
              
              <div className="p-4 border border-border rounded-md">
                <div className="font-medium text-foreground">Güvenlik</div>
                <div className="text-sm text-muted-foreground">Şifre ve güvenlik ayarlarınızı yönetin</div>
              </div>
              
              <div className="p-4 border border-border rounded-md">
                <div className="font-medium text-foreground">Hesap Türü</div>
                <div className="text-sm text-muted-foreground">Booster hesabına geçiş yapın</div>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Bell className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Bildirim Ayarları</h2>
            </div>
            <div className="space-y-4">
              <Link
                href="/dashboard/settings/notifications"
                className="block p-4 border border-border rounded-md hover:bg-accent transition-colors"
              >
                <div className="font-medium text-foreground">Bildirim Tercihleri</div>
                <div className="text-sm text-muted-foreground">Email, push ve in-app bildirimleri yönetin</div>
              </Link>
              
              <div className="p-4 border border-border rounded-md">
                <div className="font-medium text-foreground">Sessiz Saatler</div>
                <div className="text-sm text-muted-foreground">Bildirim almak istemediğiniz saatleri ayarlayın</div>
              </div>
              
              <div className="p-4 border border-border rounded-md">
                <div className="font-medium text-foreground">Email Bildirimleri</div>
                <div className="text-sm text-muted-foreground">Email bildirim türlerini seçin</div>
              </div>
            </div>
          </div>

          {/* App Settings */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Palette className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Uygulama Ayarları</h2>
            </div>
            <div className="space-y-4">
              <div className="p-4 border border-border rounded-md">
                <div className="font-medium text-foreground">Tema</div>
                <div className="text-sm text-muted-foreground">Koyu/Açık tema seçimi</div>
              </div>
              
              <div className="p-4 border border-border rounded-md">
                <div className="font-medium text-foreground">Dil</div>
                <div className="text-sm text-muted-foreground">Uygulama dilini değiştirin</div>
              </div>
              
              <div className="p-4 border border-border rounded-md">
                <div className="font-medium text-foreground">Veri Gizliliği</div>
                <div className="text-sm text-muted-foreground">Veri kullanımı ve gizlilik ayarları</div>
              </div>
            </div>
          </div>

          {/* Support & Help */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Globe className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Destek & Yardım</h2>
            </div>
            <div className="space-y-4">
              <Link
                href="/faq"
                className="block p-4 border border-border rounded-md hover:bg-accent transition-colors"
              >
                <div className="font-medium text-foreground">Sıkça Sorulan Sorular</div>
                <div className="text-sm text-muted-foreground">En çok merak edilen soruların cevapları</div>
              </Link>
              
              <Link
                href="/contact"
                className="block p-4 border border-border rounded-md hover:bg-accent transition-colors"
              >
                <div className="font-medium text-foreground">İletişim</div>
                <div className="text-sm text-muted-foreground">Destek ekibimizle iletişime geçin</div>
              </Link>
              
              <Link
                href="/terms"
                className="block p-4 border border-border rounded-md hover:bg-accent transition-colors"
              >
                <div className="font-medium text-foreground">Kullanım Koşulları</div>
                <div className="text-sm text-muted-foreground">Hizmet şartları ve koşulları</div>
              </Link>
              
              <Link
                href="/privacy"
                className="block p-4 border border-border rounded-md hover:bg-accent transition-colors"
              >
                <div className="font-medium text-foreground">Gizlilik Politikası</div>
                <div className="text-sm text-muted-foreground">Veri koruma ve gizlilik politikası</div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
