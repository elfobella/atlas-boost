/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useNotificationPreferences } from '@/hooks/use-notifications';
import { toast } from 'sonner';

export default function NotificationSettingsPage() {
  const { preferences, loading, updatePreferences, isUpdating } = useNotificationPreferences();
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    if (preferences) {
      setFormData(preferences);
    }
  }, [preferences]);

  const handleSave = () => {
    if (formData) {
      updatePreferences(formData);
      toast.success('Tercihleriniz kaydedildi');
    }
  };

  if (loading || !formData) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold text-foreground mb-8">
        Bildirim Ayarları
      </h1>

      <div className="space-y-6">
        {/* Bildirim Kanalları */}
        <div className="bg-background rounded-lg p-6 border border-border">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Bildirim Kanalları
          </h2>
          
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-foreground">
                Uygulama İçi Bildirimler
              </span>
              <input
                type="checkbox"
                checked={formData.inAppEnabled}
                onChange={(e) =>
                  setFormData({ ...formData, inAppEnabled: e.target.checked })
                }
                className="w-5 h-5 rounded border-border"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-foreground">
                E-posta Bildirimleri
              </span>
              <input
                type="checkbox"
                checked={formData.emailEnabled}
                onChange={(e) =>
                  setFormData({ ...formData, emailEnabled: e.target.checked })
                }
                className="w-5 h-5 rounded border-border"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-foreground">
                Push Bildirimleri
              </span>
              <input
                type="checkbox"
                checked={formData.pushEnabled}
                onChange={(e) =>
                  setFormData({ ...formData, pushEnabled: e.target.checked })
                }
                className="w-5 h-5 rounded border-border"
              />
            </label>
          </div>
        </div>

        {/* Bildirim Türleri */}
        <div className="bg-background rounded-lg p-6 border border-border">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Bildirim Türleri
          </h2>
          
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-foreground">
                Sipariş Güncellemeleri
              </span>
              <input
                type="checkbox"
                checked={formData.orderUpdates}
                onChange={(e) =>
                  setFormData({ ...formData, orderUpdates: e.target.checked })
                }
                className="w-5 h-5 rounded border-border"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-foreground">
                Boost Güncellemeleri
              </span>
              <input
                type="checkbox"
                checked={formData.boostUpdates}
                onChange={(e) =>
                  setFormData({ ...formData, boostUpdates: e.target.checked })
                }
                className="w-5 h-5 rounded border-border"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-foreground">
                Mesajlar
              </span>
              <input
                type="checkbox"
                checked={formData.messages}
                onChange={(e) =>
                  setFormData({ ...formData, messages: e.target.checked })
                }
                className="w-5 h-5 rounded border-border"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-foreground">
                Pazarlama Bildirimleri
              </span>
              <input
                type="checkbox"
                checked={formData.marketing}
                onChange={(e) =>
                  setFormData({ ...formData, marketing: e.target.checked })
                }
                className="w-5 h-5 rounded border-border"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-foreground">
                Sistem Güncellemeleri
              </span>
              <input
                type="checkbox"
                checked={formData.systemUpdates}
                onChange={(e) =>
                  setFormData({ ...formData, systemUpdates: e.target.checked })
                }
                className="w-5 h-5 rounded border-border"
              />
            </label>
          </div>
        </div>

        {/* Sessiz Saatler */}
        <div className="bg-background rounded-lg p-6 border border-border">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Sessiz Saatler
          </h2>
          
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-foreground">
                Sessiz Saatleri Etkinleştir
              </span>
              <input
                type="checkbox"
                checked={formData.quietHoursEnabled}
                onChange={(e) =>
                  setFormData({ ...formData, quietHoursEnabled: e.target.checked })
                }
                className="w-5 h-5 rounded border-border"
              />
            </label>

            {formData.quietHoursEnabled && (
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    Başlangıç Saati
                  </label>
                  <input
                    type="time"
                    value={formData.quietHoursStart || '22:00'}
                    onChange={(e) =>
                      setFormData({ ...formData, quietHoursStart: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    Bitiş Saati
                  </label>
                  <input
                    type="time"
                    value={formData.quietHoursEnd || '08:00'}
                    onChange={(e) =>
                      setFormData({ ...formData, quietHoursEnd: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Kaydet Butonu */}
        <button
          onClick={handleSave}
          disabled={isUpdating}
          className="w-full py-3 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-lg transition-colors disabled:opacity-50"
        >
          {isUpdating ? 'Kaydediliyor...' : 'Tercihleri Kaydet'}
        </button>
      </div>
    </div>
  );
}

