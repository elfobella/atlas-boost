# 🚀 Vercel Production Deployment Rehberi

## ⚠️ ÖNEMLİ: Production'da SQLite Kullanılamaz!

Vercel serverless ortamında SQLite database dosyası **çalışmaz**. Production için PostgreSQL kullanmalısınız.

## 🔧 ÇÖZÜM 1: PostgreSQL'e Geçiş (Önerilen)

### Adım 1: Ücretsiz PostgreSQL Database Oluşturun

#### Seçenek A: Vercel Postgres (Önerilen)
```bash
# Vercel dashboard'dan:
1. Storage → Create Database
2. Postgres seçin
3. Database adı: atlast-boost-db
4. Region: Washington D.C. (iad1) - en yakın
```

#### Seçenek B: Supabase (Ücretsiz)
```bash
1. https://supabase.com → New Project
2. Database password oluşturun
3. Connection string'i kopyalayın
```

#### Seçenek C: Neon (Ücretsiz)
```bash
1. https://neon.tech → New Project
2. Connection string'i alın
```

### Adım 2: Prisma Schema'yı PostgreSQL'e Değiştirin

```prisma
// prisma/schema.prisma

datasource db {
  provider = "postgresql"  // sqlite → postgresql
  url      = env("DATABASE_URL")
}
```

### Adım 3: Vercel Environment Variables

Vercel Dashboard → Settings → Environment Variables:

```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"

# NextAuth
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="[openssl rand -base64 32 ile oluşturun]"

# Pusher
PUSHER_APP_ID="2062700"
PUSHER_KEY="b09d323450614c77a1df"
PUSHER_SECRET="343971ae9f222ca7b202"
PUSHER_CLUSTER="eu"
NEXT_PUBLIC_PUSHER_KEY="b09d323450614c77a1df"
NEXT_PUBLIC_PUSHER_CLUSTER="eu"

# Stripe
STRIPE_SECRET_KEY="sk_live_your_live_key"  # Production key kullanın!
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_your_live_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

# App URL
NEXT_PUBLIC_APP_URL="https://your-domain.vercel.app"

# Email (Opsiyonel)
RESEND_API_KEY="re_your_key"
RESEND_FROM="noreply@yourdomain.com"

# Push Notifications (Opsiyonel)
VAPID_EMAIL="mailto:your@email.com"
NEXT_PUBLIC_VAPID_PUBLIC_KEY="your_public_key"
VAPID_PRIVATE_KEY="your_private_key"
```

### Adım 4: Migration'ları Çalıştırın

```bash
# Local'de PostgreSQL ile test edin
DATABASE_URL="postgresql://..." npx prisma migrate deploy

# Vercel'de otomatik çalışır (postinstall script'i var)
```

### Adım 5: Test Verileri Oluşturun

Production database'e test verileri eklemek için:

```bash
# 1. Vercel Postgres kullanıyorsanız:
# Vercel Dashboard → Storage → [Your DB] → Query

# 2. Veya local'den bağlanın:
DATABASE_URL="production_url" node scripts/create-test-booster.js
```

## 🔧 ÇÖZÜM 2: Hızlı Test İçin Dev Database'i Kopyalayın

**Sadece test amaçlı, production için uygun değil!**

```bash
# Local database'inizi Vercel'e yükleyin (demo için)
# NOT: Her deploy'da silinir!
```

## 🎯 HIZLI ÇÖZÜM: PostgreSQL Migration

### 1. Schema Değişikliği

`prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 2. Local Test

```bash
# Vercel Postgres bağlantı string'i ile test edin
DATABASE_URL="vercel_postgres_url" npx prisma migrate deploy
```

### 3. Push

```bash
git add prisma/schema.prisma
git commit -m "feat: Switch to PostgreSQL for production"
git push origin main
```

### 4. Vercel'de Otomatik

- ✅ Environment variable (DATABASE_URL) Vercel'de otomatik inject olur
- ✅ Build sırasında migration'lar çalışır
- ✅ Database hazır!

## 📊 Production Checklist

- [ ] PostgreSQL database oluşturuldu
- [ ] DATABASE_URL Vercel'e eklendi
- [ ] Schema PostgreSQL'e değiştirildi
- [ ] Migration'lar çalıştırıldı
- [ ] En az 1 BOOSTER user oluşturuldu
- [ ] Stripe production keys eklendi
- [ ] Webhook endpoint Stripe'a tanımlandı
- [ ] Pusher credentials doğru
- [ ] NEXTAUTH_SECRET production değeri

## 🐛 Sorun Giderme

### Sipariş Dashboard'da Görünmüyor

**Olası Nedenler:**
1. ❌ Database boş (migration çalışmamış)
2. ❌ Stripe webhook çalışmıyor
3. ❌ Environment variables eksik

**Çözüm:**
```bash
# 1. Vercel logs'u kontrol edin
vercel logs [deployment-url]

# 2. Database'i kontrol edin
# Vercel Postgres Dashboard → Query:
SELECT COUNT(*) FROM "Order";

# 3. Environment variables'ı kontrol edin
# Vercel Dashboard → Settings → Environment Variables
```

### Migration Hatası

```bash
# Vercel build logs'da:
Error: Migration failed

# Çözüm:
# Local'de test edin:
DATABASE_URL="production_url" npx prisma migrate deploy
```

## 🎯 Hemen Yapılacaklar

1. **PostgreSQL Database Oluşturun** (Vercel Postgres önerilen)
2. **prisma/schema.prisma** - provider'ı `postgresql` yapın
3. **Vercel Environment Variables** - DATABASE_URL ekleyin
4. **Git push** - Vercel otomatik deploy edecek
5. **Test user oluşturun** - Production database'e

---

**Production'a geçmek için yukarıdaki adımları takip edin!** 🚀

## 💡 Hızlı Başlangıç

En hızlı yol **Vercel Postgres**:
1. Vercel Dashboard → Storage → Create Database → Postgres
2. DATABASE_URL otomatik inject olur
3. Schema'yı değiştir → Push
4. ✅ Hazır!

