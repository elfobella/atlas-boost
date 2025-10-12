# 🐛 Bildirim Sistemi Debug Rehberi

Bu rehber, bildirim sistemindeki sorunları tespit etmenize ve çözmenize yardımcı olacaktır.

## 🔍 Yapılan İyileştirmeler

### 1. Sipariş Oluşturma Bildirimi
✅ **Düzeltildi**: `/api/orders` POST endpoint'ine bildirim gönderme özelliği eklendi.

**Değişiklik**: Artık sipariş oluşturulduğunda otomatik olarak `notifyOrderCreated` çağrılıyor.

### 2. Booster Atama Bildirimi
✅ **İyileştirildi**: Booster atama işleminde daha detaylı loglar eklendi.

**Özellikler**:
- Hem müşteriye hem booster'a bildirim gönderiliyor
- Hata durumunda detaylı log kayıtları
- Bildirim gönderimi başarısız olsa bile atama işlemi tamamlanıyor

### 3. Detaylı Loglama
✅ **Eklendi**: Tüm bildirim akışında detaylı console logları.

**Log Noktaları**:
- Bildirim gönderilirken
- Kullanıcı tercihleri yüklenirken
- Aktif kanallar belirlenirken
- Veritabanına kaydedilirken
- Pusher'a broadcast edilirken
- Client tarafında Pusher bağlantısı kurulurken

## 🧪 Test Etme Adımları

### Adım 1: Environment Variables Kontrolü

```bash
# .env dosyasını kontrol edin
cat .env | grep PUSHER
```

Şunları görmelisiniz:
```
PUSHER_APP_ID="2062700"
PUSHER_KEY="b09d323450614c77a1df"
PUSHER_SECRET="343971ae9f222ca7b202"
PUSHER_CLUSTER="eu"
NEXT_PUBLIC_PUSHER_KEY="b09d323450614c77a1df"
NEXT_PUBLIC_PUSHER_CLUSTER="eu"
```

### Adım 2: Uygulamayı Başlatın

```bash
npm run dev
```

Terminal'de şu logları göreceksiniz:
- `✓ Ready in...`
- Environment variable'lar yüklendi

### Adım 3: Debug Endpoint'ini Kontrol Edin

Tarayıcınızda giriş yapın ve şu URL'e gidin:
```
http://localhost:3000/api/debug-notifications
```

**Beklenen Çıktı**:
```json
{
  "config": {
    "pusher": {
      "configured": true,
      "appId": "✓",
      "key": "✓",
      "secret": "✓",
      "publicKey": "✓"
    }
  },
  "preferences": {
    "inAppEnabled": true,
    "emailEnabled": true,
    "pushEnabled": true
  }
}
```

❌ **Problem**: Eğer herhangi bir `✗` görüyorsanız, `.env` dosyanızı kontrol edin.

### Adım 4: Test Bildirimi Gönderin

```
http://localhost:3000/api/test-notification
```

**Beklenen Sonuç**:
1. Tarayıcı console'unda Pusher logları görünmeli
2. Bildirim dropdown'ında yeni bildirim görünmeli
3. Server console'unda bildirim gönderim logları görünmeli

### Adım 5: Terminal Loglarını İzleyin

Uygulamanın çalıştığı terminal'de şu logları arayın:

#### Sipariş oluşturulduğunda:
```
📧 Sending order created notification to user: [user-id]
📬 NotificationService: Sending notification
✓ User preferences loaded
✓ Active channels determined: ["in_app", "email"]
💾 Saving notification to database...
📡 Broadcasting to Pusher
✅ Pusher broadcast successful
```

#### Booster atandığında:
```
📧 Sending booster assignment notifications...
  - Order ID: [order-id]
  - Customer ID: [customer-id]
  - Booster ID: [booster-id]
🎯 notifyBoosterAssigned called
📧 Sending notification to customer
📧 Sending notification to booster
✅ Booster notifications completed
✅ Notifications sent successfully
```

### Adım 6: Browser Console'u Kontrol Edin

Tarayıcınızın Developer Tools'unu açın (F12) ve Console sekmesine gidin.

**Beklenen Loglar**:
```
🔌 Initializing Pusher: { userId: "...", hasKey: true, hasCluster: true }
📡 Subscribed to channel: user-[userId]
✅ Pusher subscription succeeded
✅ Pusher initialized successfully
```

Bildirim geldiğinde:
```
📬 Received notification from Pusher: { id: "...", title: "...", ... }
```

## ⚠️ Yaygın Sorunlar ve Çözümleri

### Problem 1: Pusher "Not Configured" Hatası

**Belirtiler**:
- Browser console'da: `❌ Pusher credentials not configured!`
- Server console'da Pusher hataları

**Çözüm**:
1. `.env` dosyasını kontrol edin
2. `NEXT_PUBLIC_` prefix'li değişkenlerin doğru olduğundan emin olun
3. Uygulamayı yeniden başlatın (önemli!)

```bash
# Uygulamayı durdurun (Ctrl+C)
# Yeniden başlatın
npm run dev
```

### Problem 2: Bildirimler Veritabanında Oluşuyor Ama Görünmüyor

**Belirtiler**:
- Veritabanında bildirimler var
- Ancak UI'da görünmüyor

**Çözüm**:
1. Browser'ı yenileyin (F5)
2. Pusher bağlantısını kontrol edin
3. Network sekmesinde Pusher WebSocket bağlantısını kontrol edin

### Problem 3: Booster Bildirimi Gitmiyor

**Belirtiler**:
- Müşteri bildirimi geliyor
- Booster bildirimi gelmiyor

**Olası Nedenler**:
1. Booster hesabı giriş yapmamış
2. Booster'ın bildirim tercihleri kapalı
3. Booster'ın Pusher bağlantısı kurulmamış

**Çözüm**:
1. Booster hesabıyla giriş yapın
2. `/dashboard/settings/notifications` sayfasını ziyaret edin
3. Tüm bildirim tercihlerinin açık olduğundan emin olun

### Problem 4: "Quiet Hours" Nedeniyle Bildirim Gitmiyor

**Belirtiler**:
- Console'da "Quiet hours active" mesajı
- Bazı bildirimler gelmiyor

**Çözüm**:
- Bildirim tercihlerinde "Sessiz Saatler" özelliğini kapatın
- Veya priority'yi `HIGH` veya `URGENT` yapın (kod seviyesinde)

## 📝 Test Scripti Kullanımı

Veritabanı seviyesinde bildirimleri test etmek için:

```bash
node scripts/test-notifications.js
```

Bu script:
1. ✅ Test kullanıcılarını bulur
2. ✅ Bildirim tercihlerini kontrol eder
3. ✅ Test siparişi oluşturur
4. ✅ Booster atar
5. ✅ Bildirimleri kontrol eder
6. ✅ Detaylı rapor verir

## 🔧 Manuel Test

### 1. Sipariş Bildirimi Testi

```bash
# Yeni sipariş oluşturun
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -b "cookie-from-browser" \
  -d '{
    "game": "lol",
    "currentRank": "GOLD",
    "currentDivision": "IV",
    "targetRank": "PLATINUM",
    "targetDivision": "IV",
    "currency": "TRY"
  }'
```

### 2. Booster Atama Testi

```bash
# Admin olarak giriş yapın ve:
curl -X POST http://localhost:3000/api/orders/[order-id]/assign \
  -H "Content-Type: application/json" \
  -b "cookie-from-browser" \
  -d '{
    "boosterId": "[booster-id]"
  }'
```

## 🎯 Pusher Dashboard'u Kullanma

1. https://dashboard.pusher.com adresine gidin
2. App'inizi seçin
3. "Debug Console" sekmesine gidin
4. Canlı olarak event'leri izleyin

**Göreceğiniz Event'ler**:
- Channel: `user-[userId]`
- Event: `notification`
- Data: Bildirim içeriği

## 📊 Veritabanı Kontrolü

```bash
# SQLite veritabanını kontrol edin
sqlite3 prisma/dev.db

# Bildirimleri listele
SELECT id, type, title, userId, read, createdAt FROM Notification ORDER BY createdAt DESC LIMIT 10;

# Kullanıcı tercihlerini kontrol et
SELECT * FROM NotificationPreference;

# Çıkış
.exit
```

## 🚀 Production'da Dikkat Edilecekler

1. **HTTPS Kullanımı**: Pusher production'da HTTPS gerektirir
2. **Environment Variables**: Production'da doğru credentials kullanın
3. **CORS**: API endpoint'lerinde CORS ayarlarını kontrol edin
4. **Rate Limiting**: Bildirim spam'ini önlemek için rate limiting ekleyin

## 📞 Hala Sorun mu Var?

1. Tüm console loglarını kontrol edin (hem browser hem server)
2. Network sekmesinde başarısız request'leri arayın
3. Pusher Dashboard'da Debug Console'u kontrol edin
4. `.env` dosyasının güncel olduğundan emin olun
5. Uygulamayı yeniden başlatın

## ✅ Başarılı Bir Kurulum

Doğru çalışan bir sistemde:
- ✅ Sipariş oluşturulduğunda anında bildirim gelir
- ✅ Booster atandığında hem müşteri hem booster bildirim alır
- ✅ Bildirimler real-time olarak görünür (sayfa yenilemeden)
- ✅ Console'da hata mesajı olmaz
- ✅ Pusher Dashboard'da event'ler görünür

---

**Son Güncelleme**: Pusher credentials eklendikten sonra
**Durum**: ✅ Sistem yapılandırıldı ve test edilmeye hazır

