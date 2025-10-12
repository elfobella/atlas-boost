# ✅ Bildirim Sistemi Sorun Çözümü

## 🔧 Yapılan Düzeltmeler

### 1. Sipariş Oluşturma Bildirimi Eklendi
**Dosya**: `src/app/api/orders/route.ts`

**Sorun**: Sipariş oluşturulduğunda bildirim gönderilmiyordu.

**Çözüm**: POST endpoint'ine `notificationService.notifyOrderCreated()` çağrısı eklendi.

```typescript
// Send notification
console.log('📧 Sending order created notification to user:', session.user.id)
try {
  await notificationService.notifyOrderCreated(order.id, session.user.id)
} catch (notificationError) {
  console.error('Failed to send notification:', notificationError)
  // Don't fail the order creation if notification fails
}
```

### 2. Booster Atama Bildirimleri İyileştirildi
**Dosya**: `src/app/api/orders/[id]/assign/route.ts`

**İyileştirme**: Detaylı loglama ve hata yönetimi eklendi.

```typescript
console.log('📧 Sending booster assignment notifications...')
console.log('  - Order ID:', updatedOrder.id)
console.log('  - Customer ID:', updatedOrder.userId)
console.log('  - Booster ID:', selectedBooster.id)

try {
  await notificationService.notifyBoosterAssigned(
    updatedOrder.id,
    updatedOrder.userId,
    selectedBooster.id
  );
  console.log('✅ Notifications sent successfully')
} catch (notificationError) {
  console.error('❌ Failed to send notifications:', notificationError)
}
```

### 3. Bildirim Servisi Loglama
**Dosya**: `src/lib/notification-service.ts`

**İyileştirme**: Tüm bildirim akışında detaylı loglar eklendi:
- ✅ Bildirim gönderilirken
- ✅ Kullanıcı tercihleri yüklenirken
- ✅ Aktif kanallar belirlenirken
- ✅ Pusher'a broadcast edilirken

### 4. Client Tarafı Pusher Loglama
**Dosya**: `src/stores/notification-store.ts`

**İyileştirme**: Pusher bağlantı durumu logları eklendi:
- ✅ Bağlantı başlatılırken
- ✅ Channel'a subscribe olunurken
- ✅ Bildirim alındığında
- ✅ Bağlantı hataları

## 🧪 Test Araçları

### 1. Veritabanı Test Scripti
**Dosya**: `scripts/test-notifications.js`

Kullanım:
```bash
node scripts/test-notifications.js
```

Bu script veritabanı seviyesinde kontrol yapar ama bildirim göndermez.

### 2. Debug Rehberi
**Dosya**: `NOTIFICATION_DEBUG.md`

Tüm test adımları ve sorun çözme yöntemleri bu dosyada.

## 🚀 Test Etme (GEREKLİ ADIMLAR)

### Adım 1: Uygulamayı Başlatın

```bash
npm run dev
```

### Adım 2: İki Farklı Tarayıcı/Sekme Açın

**Sekme 1**: Müşteri hesabıyla giriş yapın
- Email: `yunusemreucr11@gmail.com`

**Sekme 2**: Booster hesabıyla giriş yapın
- Email: `booster@atlastboost.com`

### Adım 3: Browser Console'ları Açın

Her iki sekmede de F12'ye basın ve Console sekmesini açın.

**Görmek istediğiniz loglar**:
```
🔌 Initializing Pusher: { userId: "...", hasKey: true, hasCluster: true }
📡 Subscribed to channel: user-[userId]
✅ Pusher subscription succeeded
```

### Adım 4: Sipariş Oluşturma Testi

**Müşteri sekinesinde**:
1. `/games/rank-selector` sayfasına gidin
2. Bir oyun seçin (örn: League of Legends)
3. Current rank ve target rank seçin
4. "Get Boost" butonuna tıklayın
5. Stripe checkout'tan çıkın (test için ödeme yapmayın)

YA DA doğrudan API'yi test edin:

```bash
# Müşteri olarak giriş yapın ve cookie'yi alın
# Sonra bu komutu çalıştırın:

curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Cookie: [your-session-cookie]" \
  -d '{
    "game": "lol",
    "currentRank": "GOLD",
    "currentDivision": "IV",
    "targetRank": "PLATINUM",
    "targetDivision": "IV",
    "currency": "TRY"
  }'
```

**Beklenen Sonuç**:
- ✅ Müşteri sekinesinde bildirim çanında yeni bildirim
- ✅ Console'da Pusher bildirimi
- ✅ Server terminal'inde bildirim logları

### Adım 5: Booster Atama Testi

**Admin/Booster sekinesinde**:

Önce admin olmanız gerekiyor. Eğer admin değilseniz:
```bash
# Hesabınızı admin yapın
sqlite3 prisma/dev.db "UPDATE User SET role = 'ADMIN' WHERE email = 'yunusemreucr11@gmail.com';"
```

Sonra:
1. Bir sipariş oluşturun (yukarıdaki adımlarla)
2. Sipariş statusunu PAID yapın:
```bash
sqlite3 prisma/dev.db "UPDATE 'Order' SET orderStatus = 'PAID', paymentStatus = 'SUCCEEDED' WHERE id = '[order-id]';"
```

3. Admin olarak booster atayın:
```bash
curl -X POST http://localhost:3000/api/orders/[order-id]/assign \
  -H "Content-Type: application/json" \
  -H "Cookie: [admin-session-cookie]" \
  -d '{
    "boosterId": "[booster-user-id]"
  }'
```

**Beklenen Sonuç**:
- ✅ Müşteri sekmesinde "Booster Atandı" bildirimi
- ✅ Booster sekmesinde "Yeni İş Atandı" bildirimi
- ✅ Her iki console'da da Pusher logları
- ✅ Server'da detaylı bildirim logları

### Adım 6: Test Endpoint'i (En Kolay Yöntem)

Giriş yaptıktan sonra:
```
http://localhost:3000/api/test-notification
```

Bu endpoint otomatik olarak size test bildirimi gönderir.

## 📊 Kontrol Listesi

Sisteminizin doğru çalıştığını anlamak için:

- [ ] `.env` dosyasında Pusher credentials var
- [ ] Uygulama başlatıldı (`npm run dev`)
- [ ] Kullanıcı giriş yaptı
- [ ] Browser console'da Pusher bağlantısı başarılı
- [ ] `/api/debug-notifications` endpoint'i tüm ✓ gösteriyor
- [ ] Test bildirimi geldi (`/api/test-notification`)
- [ ] Sipariş oluşturulduğunda bildirim geldi
- [ ] Booster atandığında her iki tarafa da bildirim geldi

## 🐛 Hala Sorun Varsa

### Server Terminal'inde Arayın:

```bash
# Şu logları görmüyorsanız sorun var:
📬 NotificationService: Sending notification
✓ User preferences loaded
✓ Active channels determined
📡 Broadcasting to Pusher
✅ Pusher broadcast successful
```

### Browser Console'da Arayın:

```bash
# Şu logları görmüyorsanız sorun var:
🔌 Initializing Pusher
✅ Pusher subscription succeeded
📬 Received notification from Pusher
```

### Pusher Dashboard Kontrolü:

1. https://dashboard.pusher.com
2. App'inizi seçin
3. "Debug Console" sekmesi
4. Real-time olarak event'leri izleyin

Event görmüyorsanız:
- Server'dan broadcast gönderilmiyor
- Credentials yanlış
- Network sorunu var

## 💡 Önemli Notlar

1. **Environment Variables**: `.env` dosyasını değiştirdiyseniz uygulamayı yeniden başlatın!

2. **Bildirim Tercihleri**: Kullanıcının bildirim tercihleri kapalıysa bildirim gitmez. Kontrol edin:
   - `/dashboard/settings/notifications`

3. **Pusher Free Plan**: Günlük 200,000 mesaj limiti var. Test için yeterli.

4. **Browser Notifications**: Browser notification permission istenmesi gerekiyor. Ancak bu in-app bildirimleri etkilemez.

5. **Real-time vs Database**: 
   - Bildirimler her zaman veritabanına kaydedilir
   - Pusher sadece real-time gönderim için
   - Pusher çalışmasa bile `/dashboard/notifications` sayfasında görürsünüz

## 🎯 Başarı Kriteri

✅ **Sistem Doğru Çalışıyor** demek:
- Sipariş oluşturulduğunda ANINDA bildirim gelir (sayfa yenilemeden)
- Booster atandığında HER İKİ TARAF da bildirim alır
- Console'da hiç hata yok
- Pusher Dashboard'da event'ler görünüyor

---

**Tüm değişiklikler yapıldı ve test edilmeye hazır!** 🚀

Herhangi bir sorun yaşarsanız `NOTIFICATION_DEBUG.md` dosyasını inceleyin.


