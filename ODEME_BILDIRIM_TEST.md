# 💳 Ödeme ve Bildirim Sistemi Test Rehberi

## 🎯 Sorun

- Test bildirimi çalışıyor ✅
- Ödeme alındığında bildirim düşmüyor ❌
- Booster'a bildirim gitmiyor ❌

## 🔍 Neden?

Stripe webhook'ları **sadece gerçek ödeme** veya **Stripe CLI** ile test edildiğinde tetiklenir. Normal geliştirme ortamında manuel test için özel endpoint kullanmamız gerekiyor.

## ✅ ÇÖZÜM 1: Test Endpoint'i (Önerilen)

### Adım 1: Uygulamayı Başlatın
```bash
npm run dev
```

### Adım 2: Sipariş Oluşturun

Tarayıcıda giriş yapın ve bir sipariş oluşturun:
1. `/games/rank-selector` sayfasına gidin
2. Bir oyun seçin
3. Rank seçin ve "Get Boost" butonuna tıklayın
4. **Stripe sayfasından çıkın** (ödeme yapmayın)
5. Sipariş ID'sini kopyalayın (oluşan URL'den veya dashboard'dan)

### Adım 3: Test Endpoint'ini Çağırın

```
http://localhost:3000/api/test-payment-flow?orderId=YOUR_ORDER_ID
```

**Örnek:**
```
http://localhost:3000/api/test-payment-flow?orderId=cm123abc456
```

### Beklenen Sonuç:

```json
{
  "success": true,
  "message": "Ödeme akışı başarıyla test edildi",
  "steps": [
    "✅ Sipariş PAID yapıldı",
    "✅ Müşteriye ödeme bildirimi gönderildi",
    "✅ Booster atandı: Booster Name",
    "✅ Müşteriye atama bildirimi gönderildi",
    "✅ Booster'a yeni iş bildirimi gönderildi"
  ]
}
```

### Terminal'de Göreceğiniz Loglar:

```
📦 ADIM 1: Sipariş PAID yapılıyor...
✅ Sipariş PAID yapıldı

📧 ADIM 2: Müşteriye bildirim gönderiliyor...
📬 NotificationService: Sending notification
✓ User preferences loaded
✓ Active channels determined: ["in_app", "email"]
📡 Broadcasting to Pusher
✅ Pusher broadcast successful
✅ Müşteriye ödeme bildirimi gönderildi

🔍 ADIM 3: Müsait booster aranıyor...
👤 ADIM 4: Booster atanıyor: Booster Name
✅ Booster atandı

📧 ADIM 5: Atama bildirimleri gönderiliyor...
🎯 notifyBoosterAssigned called
📧 Sending notification to customer
📧 Sending notification to booster
✅ Booster notifications completed
```

## ✅ ÇÖZÜM 2: Gerçek Stripe Test (Production-like)

### Adım 1: Stripe CLI Yükleyin

```bash
brew install stripe/stripe-cli/stripe
# veya
# https://stripe.com/docs/stripe-cli
```

### Adım 2: Stripe Login

```bash
stripe login
```

### Adım 3: Webhook'u Forward Edin

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Bu komut size bir webhook signing secret verecek:
```
> Ready! Your webhook signing secret is whsec_xxxxx
```

### Adım 4: Webhook Secret'ı .env'e Ekleyin

```env
STRIPE_WEBHOOK_SECRET="whsec_xxxxx"
```

### Adım 5: Uygulamayı Yeniden Başlatın

```bash
npm run dev
```

### Adım 6: Gerçek Test Ödemesi Yapın

1. Tarayıcıda sipariş oluşturun
2. Stripe checkout sayfasında test kartı kullanın:
   - Kart: `4242 4242 4242 4242`
   - Tarih: Gelecekteki herhangi bir tarih
   - CVC: 3 haneli herhangi bir sayı

### Beklenen Sonuç:

Terminal'de Stripe CLI'da:
```
2024-01-01 12:00:00   --> checkout.session.completed [evt_xxx]
2024-01-01 12:00:00  <--  [200] POST http://localhost:3000/api/webhooks/stripe
```

Uygulamanızın terminalinde:
```
🎯 Stripe webhook received
📝 Webhook details: { hasBody: true, hasSignature: true }
📦 Processing webhook event: checkout.session.completed
💳 Processing checkout.session.completed
✅ Order created successfully: cm123abc456
📧 Sending order created notification...
📧 Sending payment confirmed notification...
✅ All notifications sent
```

## 🐛 Sorun Giderme

### 1. "Müsait booster bulunamadı" Hatası

**Çözüm**: Bir booster hesabı oluşturun:

```bash
# Database'de bir kullanıcıyı booster yapın
sqlite3 prisma/dev.db
```

```sql
UPDATE User SET role = 'BOOSTER', isAvailable = 1 WHERE email = 'booster@example.com';
.exit
```

Veya yeni booster oluşturun:
```bash
node scripts/create-test-booster.js
```

### 2. Bildirimler Görünmüyor

**Kontrol listesi:**
- [ ] Pusher credentials `.env` dosyasında mı?
- [ ] Browser console'da Pusher bağlantısı başarılı mı?
- [ ] Kullanıcının bildirim tercihleri açık mı?
- [ ] `/dashboard/notifications` sayfasında bildirimler var mı?

**Debug endpoint'i:**
```
http://localhost:3000/api/debug-notifications
```

### 3. Stripe Webhook Çalışmıyor

**Kontroller:**
- [ ] Stripe CLI çalışıyor mu? (`stripe listen` aktif mi?)
- [ ] STRIPE_WEBHOOK_SECRET `.env`'de mi?
- [ ] Uygulama yeniden başlatıldı mı?

**Test komutu:**
```bash
stripe trigger checkout.session.completed
```

## 📊 Bildirim Akışı

### 1. Ödeme Alındığında (checkout.session.completed)
```
Müşteri → Stripe Checkout → Webhook → Order Created → 2 Bildirim
                                                         ↓
                                            [Müşteriye] "Sipariş Oluşturuldu"
                                            [Müşteriye] "Ödeme Onaylandı"
```

### 2. Booster Atandığında (manuel veya otomatik)
```
Admin/System → Booster Assignment → 2 Bildirim
                                      ↓
                          [Müşteriye] "Booster Atandı"
                          [Booster'a] "Yeni İş Atandı"
```

## 🎯 Hızlı Test Scripti

Tüm akışı test etmek için:

```bash
# 1. Sipariş oluştur (tarayıcıdan)
# 2. Order ID'yi kopyala
# 3. Bu komutu çalıştır:

curl "http://localhost:3000/api/test-payment-flow?orderId=YOUR_ORDER_ID" \
  -H "Cookie: $(cat /tmp/session-cookie)"
```

## ✅ Başarı Kriterleri

Sistem doğru çalışıyorsa:

1. ✅ Test endpoint'i başarılı response döner
2. ✅ Terminal'de tüm loglar görünür
3. ✅ Müşteri sekmesinde 2 bildirim görünür:
   - "Ödeme Onaylandı"
   - "Booster Atandı"
4. ✅ Booster sekmesinde 1 bildirim görünür:
   - "Yeni İş Atandı"
5. ✅ Pusher Dashboard'da 3 event görünür
6. ✅ `/dashboard/notifications` sayfasında bildirimler var

## 🚀 Production'da

Production'da webhook'lar otomatik çalışır:
1. Stripe Dashboard → Webhooks → Add Endpoint
2. URL: `https://yourdomain.com/api/webhooks/stripe`
3. Events: `checkout.session.completed`, `payment_intent.succeeded`, `charge.refunded`
4. Webhook signing secret'ı `.env`'e ekleyin

---

**Not**: Şu anki sistem ödeme alındığında booster'a bildirim **göndermez** çünkü henüz booster atanmamıştır. Booster ancak manuel/otomatik atama yapıldığında bildirim alır. Bu mantıklı bir akıştır.

Eğer ödeme alındığında otomatik booster atamasını istiyorsanız, webhook handler'a otomatik atama eklenmelidir.

