# Dark Mode Implementation Guide

Bu proje modern ve kapsamlı bir dark mode sistemi ile kurulmuştur.

## 🚀 Kullanılan Teknolojiler

- **next-themes**: Theme yönetimi için
- **lucide-react**: Modern iconlar için
- **Tailwind CSS**: Styling için
- **CSS Custom Properties**: Dinamik renk sistemi için

## 📁 Dosya Yapısı

```
src/
├── components/
│   ├── theme-provider.tsx    # Theme provider wrapper
│   └── theme-toggle.tsx      # Dark/Light mode toggle button
├── app/
│   ├── layout.tsx           # Theme provider entegrasyonu
│   ├── globals.css          # CSS custom properties
│   ├── page.tsx             # Ana sayfa
│   └── demo/
│       └── page.tsx         # Demo sayfası
```

## 🎨 Renk Sistemi

### Light Mode Renkleri
- **Background**: Beyaz (#ffffff)
- **Foreground**: Koyu gri (#171717)
- **Primary**: Koyu mavi (#0f172a)
- **Secondary**: Açık gri (#f1f5f9)
- **Muted**: Çok açık gri (#f8fafc)

### Dark Mode Renkleri
- **Background**: Çok koyu gri (#0a0a0a)
- **Foreground**: Açık gri (#ededed)
- **Primary**: Beyaz (#ffffff)
- **Secondary**: Koyu gri (#1e293b)
- **Muted**: Orta gri (#334155)

## 🛠️ Kullanım

### 1. Theme Toggle Button Ekleme

```tsx
import { ThemeToggle } from "@/components/theme-toggle";

export default function MyPage() {
  return (
    <div>
      <ThemeToggle />
      {/* Diğer içerik */}
    </div>
  );
}
```

### 2. Renk Sınıfları Kullanma

```tsx
// Arka plan renkleri
<div className="bg-background">Ana arka plan</div>
<div className="bg-card">Kart arka planı</div>
<div className="bg-primary">Birincil renk</div>
<div className="bg-secondary">İkincil renk</div>
<div className="bg-muted">Sessiz renk</div>

// Metin renkleri
<p className="text-foreground">Ana metin</p>
<p className="text-primary">Birincil metin</p>
<p className="text-secondary">İkincil metin</p>
<p className="text-muted">Sessiz metin</p>

// Kenarlık renkleri
<div className="border border-border">Kenarlık</div>
<input className="border border-input" />
```

### 3. Yeni Sayfa Oluşturma

```tsx
export default function NewPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="bg-card border-b border-border">
        <ThemeToggle />
      </header>
      
      <main className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-primary mb-6">
          Sayfa Başlığı
        </h1>
        
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-foreground">
            Kart içeriği
          </p>
        </div>
      </main>
    </div>
  );
}
```

## 🎯 Özellikler

- ✅ **Otomatik Sistem Tema Algılama**: Kullanıcının sistem temasını algılar
- ✅ **Smooth Geçişler**: Tema değişimlerinde yumuşak animasyonlar
- ✅ **Hydration Safe**: Next.js SSR ile uyumlu
- ✅ **Accessible**: Screen reader desteği
- ✅ **Modern Icons**: Lucide React ile güzel iconlar
- ✅ **Responsive**: Tüm cihazlarda çalışır
- ✅ **Customizable**: Kolayca özelleştirilebilir

## 🔧 Özelleştirme

### Yeni Renk Ekleme

`src/app/globals.css` dosyasında:

```css
:root {
  --my-custom-color: 200 100% 50%;
}

.dark {
  --my-custom-color: 200 100% 70%;
}

@theme inline {
  --color-my-custom: hsl(var(--my-custom-color));
}
```

Kullanım:
```tsx
<div className="bg-my-custom text-white">
  Özel renk
</div>
```

### Tema Ayarları

`src/app/layout.tsx` dosyasında ThemeProvider props'ları:

```tsx
<ThemeProvider
  attribute="class"           // CSS class kullan
  defaultTheme="system"       // Varsayılan tema
  enableSystem               // Sistem temasını etkinleştir
  disableTransitionOnChange  // Geçiş animasyonlarını devre dışı bırak
>
```

## 📱 Demo

`/demo` sayfasını ziyaret ederek tüm renk kombinasyonlarını ve kullanım örneklerini görebilirsiniz.

## 🚀 Gelecek Geliştirmeler

- [ ] Tema seçici dropdown
- [ ] Özel tema renkleri
- [ ] Animasyon ayarları
- [ ] Tema kaydetme (localStorage)
- [ ] Daha fazla renk varyasyonu

---

**Not**: Bu sistem tüm gelecek sayfalar için hazır ve kullanıma hazırdır. Sadece Tailwind CSS sınıflarını kullanarak tutarlı bir dark mode deneyimi sağlayabilirsiniz.
