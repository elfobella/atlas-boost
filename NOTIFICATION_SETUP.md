# 🔔 Bildirim Sistemi Kurulum Rehberi

Bu dokümantasyon, bildirim sistemini aktif hale getirmek için gerekli adımları içerir.

## 📋 Gerekli Environment Variables

Aşağıdaki environment variable'ları `.env` dosyanıza ekleyin:

### 1. Pusher (Real-time Bildirimler)
```env
PUSHER_APP_ID="your_pusher_app_id"
PUSHER_KEY="your_pusher_key"
PUSHER_SECRET="your_pusher_secret"
PUSHER_CLUSTER="eu"
NEXT_PUBLIC_PUSHER_KEY="your_pusher_key"
NEXT_PUBLIC_PUSHER_CLUSTER="eu"
```

**Pusher Hesabı Oluşturma:**
1. https://pusher.com adresine gidin
2. Ücretsiz hesap oluşturun
3. Yeni bir Channels app oluşturun
4. App Keys bölümünden credential'ları kopyalayın

### 2. Resend (Email Bildirimleri)
```env
RESEND_API_KEY="re_..."
RESEND_FROM="noreply@yourdomain.com"
```

**Resend Hesabı Oluşturma:**
1. https://resend.com adresine gidin
2. Ücretsiz hesap oluşturun
3. API Keys bölümünden yeni bir key oluşturun
4. Domain'inizi doğrulayın (veya test için resend.dev kullanın)

### 3. Web Push (Push Notifications)
```env
VAPID_EMAIL="mailto:your@email.com"
NEXT_PUBLIC_VAPID_PUBLIC_KEY="your_vapid_public_key"
VAPID_PRIVATE_KEY="your_vapid_private_key"
```

**VAPID Keys Oluşturma:**
```bash
npx web-push generate-vapid-keys
```

Yukarıdaki komutu çalıştırın ve çıktıdaki public ve private key'leri kopyalayın.

### 4. App URL
```env
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Production'da gerçek domain'inizi kullanın.

## 🚀 Kurulum Adımları

### 1. Dependencies Yükle
```bash
npm install
```

Tüm gerekli paketler zaten `package.json`'a eklendi.

### 2. Veritabanı Migration
```bash
npx prisma migrate dev
```

Migration zaten çalıştırıldı, ancak temiz bir kurulumda bu komutu çalıştırmanız gerekir.

### 3. Environment Variables'ı Ayarla
`.env` dosyanıza yukarıdaki tüm variable'ları ekleyin.

### 4. Uygulamayı Başlat
```bash
npm run dev
```

## ✅ Test Etme

### 1. Bildirim Dropdown'ı Kontrol Edin
- Giriş yapın
- Navbar'da çan simgesini görmelisiniz
- Tıklayarak bildirim dropdown'ını açabilirsiniz

### 2. Bildirim Sayfası
- `/dashboard/notifications` adresine gidin
- Tüm bildirimleri görüntüleyebilirsiniz

### 3. Bildirim Ayarları
- `/dashboard/settings/notifications` adresine gidin
- Bildirim tercihlerinizi ayarlayabilirsiniz

### 4. Test Bildirimi Oluştur
Console'da veya başka bir API endpoint'te:
```typescript
import { notificationService } from '@/lib/notification-service';

await notificationService.sendNotification({
  userId: 'user_id_here',
  type: 'SYSTEM_UPDATE',
  title: 'Test Bildirimi',
  message: 'Bu bir test bildirimidir.',
  priority: 'NORMAL',
  channels: ['in_app', 'email', 'push'],
});
```

## 🎯 Özellikler

### ✅ Aktif Özellikler
- ✅ In-app bildirimler
- ✅ Real-time bildirimler (Pusher)
- ✅ Bildirim merkezi
- ✅ Bildirim tercihleri
- ✅ Sessiz saatler
- ✅ Okundu/Okunmadı takibi
- ✅ Bildirim silme
- ✅ Toplu okundu işaretle

### 🔧 Yapılandırma Gereken Özellikler
- 📧 Email bildirimleri (Resend API key gerekli)
- 📱 Push notifications (VAPID keys gerekli)

### 📦 Otomatik Bildirimler
Aşağıdaki olaylarda otomatik bildirim gönderilir:
- Sipariş oluşturulduğunda
- Ödeme onaylandığında
- Booster atandığında
- Boost başladığında
- Boost tamamlandığında
- Sipariş iptal edildiğinde
- Ödeme başarısız olduğunda
- Ödeme iade edildiğinde

## 🐛 Troubleshooting

### Bildirimler Görünmüyor
1. Browser console'da hata var mı kontrol edin
2. Pusher credential'larının doğru olduğundan emin olun
3. `NEXT_PUBLIC_` prefix'li environment variable'ları kontrol edin

### Real-time Çalışmıyor
1. Pusher dashboard'unda Debug Console'u açın
2. Bildirim gönderildiğinde event'leri görebilmelisiniz
3. Browser Network tab'ında Pusher connection'ı kontrol edin

### Email Gönderilmiyor
1. Resend API key'in geçerli olduğundan emin olun
2. `RESEND_FROM` email adresinin doğru olduğunu kontrol edin
3. Domain doğrulaması yapıldığından emin olun

### Push Notifications Çalışmıyor
1. VAPID keys'in doğru olduğundan emin olun
2. HTTPS kullanıyor olmanız gerekir (localhost hariç)
3. Browser permission'larını kontrol edin

## 📚 Daha Fazla Bilgi

Detaylı dokümantasyon için:
- `NOTIFICATION_SYSTEM.md` - Tam sistem dokümantasyonu
- `BOOST_ORDER_SYSTEM.md` - Sipariş sistemi entegrasyonu

## 🎉 Tamamlandı!

Bildirim sistemi başarıyla kuruldu. Tüm özellikler çalışır durumda!

