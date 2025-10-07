# AtlastBoost Deployment Guide

## 📋 İçindekiler
- [Deployment Seçenekleri](#deployment-seçenekleri)
- [Vercel Deployment (Önerilen)](#vercel-deployment-önerilen)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Stripe Production Setup](#stripe-production-setup)
- [Domain Configuration](#domain-configuration)
- [Post-Deployment Checklist](#post-deployment-checklist)
- [Monitoring & Analytics](#monitoring--analytics)
- [Troubleshooting](#troubleshooting)

---

## 🚀 Deployment Seçenekleri

### 1. **Vercel** (Önerilen - En Kolay)
- Next.js için optimize edilmiş
- Otomatik CI/CD
- Ücretsiz SSL
- Edge Network
- **Önerilen:** ⭐⭐⭐⭐⭐

### 2. **Netlify**
- Kolay deployment
- Free tier mevcut
- Git integration
- **Önerilen:** ⭐⭐⭐⭐

### 3. **AWS/DigitalOcean**
- Tam kontrol
- Daha karmaşık setup
- Daha pahalı
- **Önerilen:** ⭐⭐⭐

---

## 🎯 Vercel Deployment (Önerilen)

### Adım 1: Vercel Hesabı Oluştur
1. https://vercel.com adresine git
2. "Sign Up" → GitHub ile giriş yap
3. Email doğrulaması yap

### Adım 2: Proje Import Et
1. Vercel Dashboard → "Add New" → "Project"
2. GitHub repository'nizi seçin: `atlast-boost`
3. "Import" butonuna tıklayın

### Adım 3: Build Settings
Vercel otomatik algılar ama kontrol edin:

```
Framework Preset: Next.js
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

### Adım 4: Environment Variables Ekle
Vercel Dashboard → Project Settings → Environment Variables

**Gerekli Variables:**
```env
# Stripe (Production Keys ile değiştirin!)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_key_here
STRIPE_SECRET_KEY=sk_live_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# App URL (Vercel domain'iniz)
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
STRIPE_SUCCESS_URL=https://your-domain.vercel.app/success
STRIPE_CANCEL_URL=https://your-domain.vercel.app/games/rank-selector

# Database (eğer kullanıyorsanız)
DATABASE_URL=postgresql://...

# Optional
NODE_ENV=production
```

### Adım 5: Deploy!
1. "Deploy" butonuna tıklayın
2. Build sürecini izleyin (2-3 dakika)
3. Deployment tamamlandığında URL'niz hazır!

### Adım 6: Custom Domain (Opsiyonel)
1. Vercel Dashboard → Project → Settings → Domains
2. Domain ekle (örn: `atlastboost.com`)
3. DNS kayıtlarını güncelle
4. SSL otomatik kurulur

---

## 🔐 Environment Variables

### Production Environment Variables Checklist

#### ✅ Stripe (Production)
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Nasıl Alınır:**
1. Stripe Dashboard → Developers → API keys
2. "View test mode" toggle'ı kapatın (Live mode)
3. Keys'leri kopyalayın
4. Vercel'e ekleyin

#### ✅ App URLs
```env
NEXT_PUBLIC_APP_URL=https://your-production-domain.com
STRIPE_SUCCESS_URL=https://your-production-domain.com/success
STRIPE_CANCEL_URL=https://your-production-domain.com/games/rank-selector
```

#### ✅ Database (Eğer kullanıyorsanız)
```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

**Önerilen Database Sağlayıcılar:**
- **Supabase** (PostgreSQL, ücretsiz tier)
- **PlanetScale** (MySQL, ücretsiz tier)
- **Neon** (PostgreSQL, ücretsiz tier)
- **MongoDB Atlas** (NoSQL, ücretsiz tier)

---

## 💾 Database Setup

### Opsiyonel Ama Önerilen

#### Supabase ile Kurulum (Ücretsiz)
1. https://supabase.com → Sign up
2. "New Project" oluştur
3. Database URL'i kopyala
4. Vercel'e `DATABASE_URL` ekle

#### Schema Migration
```sql
-- boost_orders tablosu
CREATE TABLE boost_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  
  -- Game & Rank Info
  game VARCHAR(20) NOT NULL,
  current_rank VARCHAR(20) NOT NULL,
  current_division VARCHAR(5),
  target_rank VARCHAR(20) NOT NULL,
  target_division VARCHAR(5),
  
  -- Pricing
  price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- Stripe
  stripe_session_id VARCHAR(255) UNIQUE,
  stripe_payment_intent_id VARCHAR(255),
  
  -- Status
  payment_status VARCHAR(50) DEFAULT 'pending',
  order_status VARCHAR(50) DEFAULT 'pending',
  
  -- Customer
  customer_email VARCHAR(255),
  customer_name VARCHAR(100),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  paid_at TIMESTAMP,
  completed_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_stripe_session ON boost_orders(stripe_session_id);
CREATE INDEX idx_payment_status ON boost_orders(payment_status);
CREATE INDEX idx_customer_email ON boost_orders(customer_email);
```

---

## 💳 Stripe Production Setup

### Adım 1: Activate Live Mode
1. Stripe Dashboard → sağ üst "Test mode" toggle
2. Toggle'ı kapatın → "Live mode"
3. Business bilgilerini tamamlayın
4. Banka hesabı ekleyin (payout için)

### Adım 2: Live API Keys
1. Developers → API keys
2. Live mode keys'i kopyalayın
3. Vercel environment variables'a ekleyin

### Adım 3: Webhook Setup (Production)
1. Stripe Dashboard → Developers → Webhooks
2. "Add endpoint"
3. **Endpoint URL**: `https://your-domain.vercel.app/api/webhooks/stripe`
4. **Select events**:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Save endpoint
6. **Signing secret** kopyala → Vercel'e ekle

### Adım 4: Test Production Webhook
```bash
# Stripe CLI ile test
stripe trigger checkout.session.completed --api-key sk_live_...
```

---

## 🌐 Domain Configuration

### Option 1: Vercel Subdomain (Ücretsiz)
- Otomatik: `your-project.vercel.app`
- SSL otomatik
- Anında hazır

### Option 2: Custom Domain
1. Domain satın alın (Namecheap, GoDaddy, vb.)
2. Vercel'de domain ekle
3. DNS kayıtları güncelle:

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

4. SSL otomatik kurulur (24 saat içinde)

---

## ✅ Post-Deployment Checklist

### Deployment Sonrası Kontroller

#### Temel Testler
- [ ] Ana sayfa açılıyor mu?
- [ ] Dark mode çalışıyor mu?
- [ ] Dil değiştirme çalışıyor mu?
- [ ] Navbar linkleri çalışıyor mu?
- [ ] Footer linkleri çalışıyor mu?

#### Rank Selector Testleri
- [ ] Oyun seçimi çalışıyor mu?
- [ ] Rank seçimi çalışıyor mu?
- [ ] Validation çalışıyor mu?
- [ ] Fiyat hesaplama doğru mu?
- [ ] Öneriler görünüyor mu?

#### Stripe Testleri (Production)
- [ ] Checkout butonu çalışıyor mu?
- [ ] Stripe Checkout sayfası açılıyor mu?
- [ ] Test kartı ile ödeme yapabildiniz mi? (**Dikkat: Live mode'da gerçek para**)
- [ ] Success page'e yönlendirme oluyor mu?
- [ ] Webhook'lar tetikleniyor mu?
- [ ] Stripe Dashboard'da payment görünüyor mu?

#### Performance
- [ ] Sayfa yükleme hızı < 3 saniye
- [ ] Lighthouse score > 90
- [ ] Mobile responsive
- [ ] Images optimize

#### SEO
- [ ] Meta tags doğru
- [ ] Open Graph tags
- [ ] Sitemap.xml
- [ ] robots.txt

---

## 📊 Monitoring & Analytics

### Vercel Analytics (Ücretsiz)
1. Vercel Dashboard → Project → Analytics
2. Otomatik aktif
3. Metrikler:
   - Page views
   - Unique visitors
   - Top pages
   - Devices
   - Locations

### Google Analytics (Opsiyonel)
```typescript
// src/lib/analytics.ts
export const GA_TRACKING_ID = 'G-XXXXXXXXXX';

// gtag.js snippet ekle
```

### Sentry (Error Tracking - Opsiyonel)
```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

---

## 🔄 CI/CD Workflow

### Otomatik Deployment (Vercel)
```
main branch → Production deployment
develop branch → Preview deployment
PR → Preview deployment
```

### Git Workflow
```bash
# Development
git checkout -b feature/new-feature
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature

# Merge to main
git checkout main
git merge feature/new-feature
git push origin main  # Otomatik production deploy!
```

---

## 🛠️ Build Optimization

### Next.js Config Optimizations
```typescript
// next.config.ts
const nextConfig: NextConfig = {
  images: {
    domains: ['your-cdn-domain.com'],
    formats: ['image/avif', 'image/webp'],
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
};
```

### Performance Tips
- ✅ Image optimization (Next.js Image component)
- ✅ Code splitting (automatic)
- ✅ Lazy loading
- ✅ Font optimization (next/font)
- ✅ CSS minification

---

## 🐛 Troubleshooting

### Yaygın Sorunlar ve Çözümler

#### 1. Build Hatası
```
Error: Module not found
```
**Çözüm:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### 2. Environment Variables Çalışmıyor
```
Error: STRIPE_SECRET_KEY is not defined
```
**Çözüm:**
- Vercel Dashboard'da variables'ları kontrol et
- Redeploy yap (Settings → Deployments → Redeploy)

#### 3. Webhook Çalışmıyor
```
Webhook signature verification failed
```
**Çözüm:**
- Stripe Dashboard'da webhook secret'i kontrol et
- Vercel'de `STRIPE_WEBHOOK_SECRET` güncelle
- Endpoint URL'i kontrol et

#### 4. Images Yüklenmiyor
```
Error: Invalid src prop
```
**Çözüm:**
- `next.config.ts`'de image domains ekle
- Public klasöründe dosya var mı kontrol et

---

## 📱 Mobile Testing

### Test Platformları
- [ ] iOS Safari
- [ ] Android Chrome
- [ ] Mobile responsive design
- [ ] Touch events
- [ ] Keyboard handling

### Tools
- Chrome DevTools → Device Mode
- BrowserStack
- Real device testing

---

## 🔒 Security Checklist

### Pre-Production
- [ ] HTTPS enabled
- [ ] Environment variables secure
- [ ] No API keys in code
- [ ] CORS configured
- [ ] Rate limiting
- [ ] Input validation
- [ ] SQL injection prevention
- [ ] XSS prevention

### Stripe Security
- [ ] Live mode keys kullanıyor
- [ ] Webhook signature verification
- [ ] Server-side fiyat hesaplama
- [ ] Metadata validation

---

## 📈 SEO Optimization

### Meta Tags
```typescript
// src/app/layout.tsx
export const metadata: Metadata = {
  title: 'AtlastBoost - Professional Game Boosting Services',
  description: 'Professional League of Legends and Valorant boosting services. Fast, safe, and reliable rank boosting by expert players.',
  keywords: ['game boosting', 'lol boost', 'valorant boost', 'rank boost', 'elo boost'],
  authors: [{ name: 'AtlastBoost' }],
  openGraph: {
    title: 'AtlastBoost - Professional Game Boosting',
    description: 'Rank up faster with our expert boosting services',
    images: ['/og-image.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AtlastBoost',
    description: 'Professional Game Boosting Services',
  }
};
```

### Sitemap
```typescript
// src/app/sitemap.ts
export default function sitemap() {
  return [
    {
      url: 'https://your-domain.com',
      lastModified: new Date(),
    },
    {
      url: 'https://your-domain.com/games/rank-selector',
      lastModified: new Date(),
    },
  ];
}
```

### Robots.txt
```typescript
// src/app/robots.ts
export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/dashboard/'],
    },
    sitemap: 'https://your-domain.com/sitemap.xml',
  };
}
```

---

## 📦 Pre-Deployment Build Test

### Local Production Build
```bash
# Build production version
npm run build

# Test production build locally
npm run start

# Test on http://localhost:3000
```

### Checklist
- [ ] Build başarılı (no errors)
- [ ] Tüm sayfalar yükleniyor
- [ ] Dark mode çalışıyor
- [ ] Çeviriler çalışıyor
- [ ] Stripe test mode çalışıyor

---

## 🌍 Multi-Region Deployment (İleri Seviye)

### Vercel Edge Network
- Otomatik global distribution
- CDN optimization
- Edge functions
- Automatic HTTPS

### Performance Optimization
```typescript
// Edge Runtime
export const runtime = 'edge';

// Revalidate
export const revalidate = 3600; // 1 saat cache
```

---

## 📊 Analytics Setup

### 1. Vercel Web Analytics
```typescript
// Otomatik - Hiçbir şey yapma!
// Vercel Dashboard → Analytics'ten görüntüle
```

### 2. Google Analytics (Opsiyonel)
```typescript
// src/app/layout.tsx
import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXXXXX');
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  );
}
```

---

## 🚨 Stripe Live Mode Activation

### Önemli: Test → Live Geçişi

#### 1. Stripe Dashboard Kontrolü
- [ ] Business info tamamlandı
- [ ] Bank account eklendi
- [ ] Identity verification tamamlandı
- [ ] Terms accepted

#### 2. API Keys Değiştir
```bash
# Test keys → Live keys
pk_test_... → pk_live_...
sk_test_... → sk_live_...
```

#### 3. Webhook Production URL
```
Development: http://localhost:3000/api/webhooks/stripe
Production: https://your-domain.com/api/webhooks/stripe
```

#### 4. İlk Gerçek Test
**DİKKAT:** Live mode'da gerçek para çekilir!
- Küçük tutar ile test yapın ($1-5)
- Test kartı ÇALIŞMAZ
- Gerçek kart kullanın
- Hemen refund yapın

---

## 📞 Support & Monitoring

### Error Tracking
```typescript
// Vercel otomatik error tracking
// Dashboard → Errors sekmesinden görüntüle
```

### Log Monitoring
```bash
# Vercel CLI ile logs
npm install -g vercel
vercel login
vercel logs
```

### Uptime Monitoring (Ücretsiz Tools)
- **UptimeRobot** - 50 monitor ücretsiz
- **Better Uptime** - 10 monitor ücretsiz
- **Pingdom** - 1 monitor ücretsiz

---

## 🎨 Custom Branding

### Favicon
```
public/
  favicon.ico (32x32)
  apple-touch-icon.png (180x180)
  android-chrome-192x192.png
  android-chrome-512x512.png
```

### OG Image
```
public/
  og-image.jpg (1200x630)
```

---

## 🔄 Continuous Deployment

### Vercel Otomatik Deploy
```
GitHub Push → Vercel Build → Live Site
```

### Build Triggers
- `main` branch push → Production
- `develop` branch push → Preview
- Pull Request → Preview deployment

### Rollback
```bash
# Vercel Dashboard → Deployments
# Previous deployment → "..." → "Promote to Production"
```

---

## 💰 Pricing & Scaling

### Vercel Free Tier
- ✅ 100 GB bandwidth/month
- ✅ Unlimited deployments
- ✅ SSL included
- ✅ Edge Network
- ✅ Preview deployments

### Pro Tier ($20/month) - Büyüdükçe
- 1 TB bandwidth
- Advanced analytics
- Team collaboration
- Password protection
- Custom domains (unlimited)

---

## 🎯 Performance Benchmarks

### Target Metrics
| Metric | Target | Tool |
|--------|--------|------|
| First Contentful Paint | < 1.5s | Lighthouse |
| Largest Contentful Paint | < 2.5s | Lighthouse |
| Time to Interactive | < 3.5s | Lighthouse |
| Cumulative Layout Shift | < 0.1 | Lighthouse |
| Total Blocking Time | < 200ms | Lighthouse |

### Lighthouse Score Goals
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 95
- SEO: > 95

---

## 📝 Pre-Launch Checklist

### 1 Hafta Önce
- [ ] Test mode'da tüm features test edildi
- [ ] Production environment variables hazır
- [ ] Database schema hazır
- [ ] Stripe live mode aktif
- [ ] Domain satın alındı (opsiyonel)

### 1 Gün Önce
- [ ] Production build test edildi
- [ ] Vercel deployment yapıldı
- [ ] Custom domain bağlandı
- [ ] SSL aktif
- [ ] Stripe webhook test edildi

### Launch Günü
- [ ] Final production test
- [ ] Gerçek ödeme testi ($1)
- [ ] Monitoring aktif
- [ ] Analytics çalışıyor
- [ ] Support hazır
- [ ] Social media duyurusu

---

## 🚀 Quick Deploy Commands

```bash
# 1. Build testi
npm run build

# 2. Git commit
git add .
git commit -m "chore: production ready deployment"
git push origin main

# 3. Vercel deploy (otomatik) veya manuel
npx vercel --prod

# 4. Deployment'i izle
# Vercel Dashboard'dan takip et
```

---

## 📧 Post-Launch

### Monitoring İlk 24 Saat
- [ ] Error rate < 1%
- [ ] Uptime > 99%
- [ ] Response time < 500ms
- [ ] Successful payments > 0

### İlk Hafta
- [ ] User feedback topla
- [ ] Bug reports kontrol et
- [ ] Performance optimize et
- [ ] SEO rankings kontrol et

---

## 🎉 Production Ready!

AtlastBoost artık production'a deploy edilmeye hazır!

### Son Kontrol
```bash
✅ Dark mode sistemi
✅ Çok dilli destek (TR/EN)
✅ Navbar & Footer
✅ Rank selection system
✅ Validation logic
✅ Stripe payment integration
✅ Success page
✅ Responsive design
✅ Error handling
```

### Deploy Komutu
```bash
git push origin main
# Vercel otomatik deploy eder!
```

### Production URL
```
https://your-project.vercel.app
# veya
https://your-custom-domain.com
```

---

**Başarılar! 🚀**

*Bu doküman AtlastBoost platformunun production deployment sürecini kapsar. Sorularınız için: support@atlastboost.com*
