"use client"

import { useSession } from 'next-auth/react'
import { User, Mail, Calendar, Shield, Save, Edit3 } from 'lucide-react'
import { useState, useEffect } from 'react'

interface UserProfile {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  role: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  })

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      setProfile({
        id: session.user.id,
        name: session.user.name || '',
        email: session.user.email || '',
        createdAt: new Date().toISOString(),
        role: session.user.role || 'USER'
      })
      setFormData({
        name: session.user.name || '',
        email: session.user.email || ''
      })
      setLoading(false)
    }
  }, [status, session])

  const handleSave = async () => {
    try {
      // Burada profil güncelleme API'si çağrılacak
      console.log('Updating profile:', formData)
      setEditing(false)
      // Başarı mesajı gösterilebilir
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  const getRoleText = (role: string) => {
    switch (role) {
      case 'USER': return 'Kullanıcı'
      case 'BOOSTER': return 'Booster'
      case 'ADMIN': return 'Yönetici'
      default: return role
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
          <h1 className="text-2xl font-bold text-foreground mb-4">Giriş Gerekli</h1>
          <p className="text-muted-foreground mb-6">Bu sayfaya erişmek için giriş yapmanız gerekiyor.</p>
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
              <User className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Profil Ayarları</h1>
                <p className="text-muted-foreground">Hesap bilgilerinizi görüntüleyin ve düzenleyin</p>
              </div>
            </div>
            <button
              onClick={() => setEditing(!editing)}
              className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              {editing ? <Save className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
              <span>{editing ? 'Kaydet' : 'Düzenle'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-xl font-semibold text-foreground mb-6">Temel Bilgiler</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    İsim
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">{profile?.name || 'Belirtilmemiş'}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email
                  </label>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{profile?.email}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Email adresi değiştirilemez</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Hesap Türü
                  </label>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{getRoleText(profile?.role || 'USER')}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Kayıt Tarihi
                  </label>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">
                      {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('tr-TR') : 'Bilinmiyor'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-xl font-semibold text-foreground mb-6">Güvenlik</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-border rounded-md">
                  <div>
                    <h3 className="font-medium text-foreground">Şifre Değiştir</h3>
                    <p className="text-sm text-muted-foreground">Hesabınızın güvenliği için şifrenizi güncelleyin</p>
                  </div>
                  <button className="text-primary hover:text-primary/80 font-medium">
                    Değiştir
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-md">
                  <div>
                    <h3 className="font-medium text-foreground">İki Faktörlü Doğrulama</h3>
                    <p className="text-sm text-muted-foreground">Hesabınızı ekstra güvenlik katmanı ile koruyun</p>
                  </div>
                  <button className="text-primary hover:text-primary/80 font-medium">
                    Aktif Et
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Stats */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Hesap İstatistikleri</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Toplam Sipariş</span>
                  <span className="font-medium text-foreground">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Aktif Sipariş</span>
                  <span className="font-medium text-foreground">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tamamlanan</span>
                  <span className="font-medium text-foreground">0</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Hızlı İşlemler</h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 border border-border rounded-md hover:bg-accent transition-colors">
                  <div className="font-medium text-foreground">Bildirim Ayarları</div>
                  <div className="text-sm text-muted-foreground">Bildirim tercihlerinizi yönetin</div>
                </button>
                <button className="w-full text-left p-3 border border-border rounded-md hover:bg-accent transition-colors">
                  <div className="font-medium text-foreground">Hesabı Sil</div>
                  <div className="text-sm text-muted-foreground">Hesabınızı kalıcı olarak silin</div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        {editing && (
          <div className="mt-8 flex justify-end">
            <div className="flex space-x-3">
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Değişiklikleri Kaydet
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
