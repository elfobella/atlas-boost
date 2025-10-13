"use client"

import { Cookie, Settings, Shield, BarChart3 } from 'lucide-react';

export default function CookiesPage() {

  const cookieTypes = [
    {
      icon: <Shield className="h-6 w-6 text-primary" />,
      title: "Gerekli Çerezler",
      description: "Web sitesinin temel işlevselliği için zorunlu çerezler",
      examples: ["Oturum yönetimi", "Güvenlik", "Form verileri"],
      required: true
    },
    {
      icon: <Settings className="h-6 w-6 text-primary" />,
      title: "Fonksiyonel Çerezler",
      description: "Kullanıcı tercihlerini hatırlayan çerezler",
      examples: ["Dil seçimi", "Tema tercihi", "Bildirim ayarları"],
      required: false
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-primary" />,
      title: "Analitik Çerezler",
      description: "Web sitesi kullanımını analiz eden çerezler",
      examples: ["Sayfa görüntülemeleri", "Kullanıcı davranışları", "Performans metrikleri"],
      required: false
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-6">
            <Cookie className="h-12 w-12 text-primary mr-4" />
            <h1 className="text-4xl md:text-6xl font-bold text-foreground">
              Çerez Politikası
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Web sitemizde çerezlerin nasıl kullanıldığını öğrenin
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Son güncelleme: {new Date().toLocaleDateString('tr-TR')}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Introduction */}
          <div className="bg-card border border-border rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Çerez Nedir?
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Çerezler, web sitelerini ziyaret ettiğinizde tarayıcınızda saklanan küçük metin dosyalarıdır. 
              Bu dosyalar web sitesinin daha iyi çalışmasını sağlar ve kullanıcı deneyimini geliştirir. 
              AtlastBoost web sitesinde çerezleri şeffaf bir şekilde kullanırız.
            </p>
          </div>

          {/* Cookie Types */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground mb-6">Çerez Türleri</h2>
            {cookieTypes.map((cookie, index) => (
              <div key={index} className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-start mb-4">
                  {cookie.icon}
                  <div className="ml-3 flex-1">
                    <h3 className="text-xl font-semibold text-foreground">
                      {cookie.title}
                    </h3>
                    <p className="text-muted-foreground mt-1">
                      {cookie.description}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    cookie.required 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {cookie.required ? 'Zorunlu' : 'Opsiyonel'}
                  </span>
                </div>
                
                <div className="mt-4">
                  <h4 className="font-medium text-foreground mb-2">Örnekler:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {cookie.examples.map((example, exampleIndex) => (
                      <li key={exampleIndex} className="text-sm text-muted-foreground">
                        {example}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Cookie Management */}
          <div className="bg-card border border-border rounded-lg p-8 mt-8">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Çerez Ayarlarını Yönetme
            </h3>
            <div className="space-y-4 text-muted-foreground">
              <p>
                <strong className="text-foreground">Tarayıcı Ayarları:</strong> Çoğu tarayıcı çerezleri yönetmenize 
                olanak tanır. Tarayıcınızın ayarlar menüsünden çerez tercihlerinizi değiştirebilirsiniz.
              </p>
              <p>
                <strong className="text-foreground">Çerez Silme:</strong> Mevcut çerezleri tarayıcınızın 
                &quot;Gizlilik ve Güvenlik&quot; bölümünden silebilirsiniz.
              </p>
              <p>
                <strong className="text-foreground">Otomatik Silme:</strong> Tarayıcınızı kapatıp açtığınızda 
                bazı çerezler otomatik olarak silinir (oturum çerezleri).
              </p>
            </div>
          </div>

          {/* Third Party Cookies */}
          <div className="bg-card border border-border rounded-lg p-8 mt-8">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Üçüncü Taraf Çerezler
            </h3>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Web sitemizde aşağıdaki üçüncü taraf servisleri kullanılmaktadır:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong className="text-foreground">Stripe:</strong> Ödeme işlemleri için güvenlik çerezleri</li>
                <li><strong className="text-foreground">Google Analytics:</strong> Web sitesi analizi için çerezler</li>
                <li><strong className="text-foreground">Pusher:</strong> Gerçek zamanlı bildirimler için çerezler</li>
              </ul>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-8 mt-8 text-center">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Çerezler Hakkında Sorularınız mı var?
            </h3>
            <p className="text-muted-foreground mb-6">
              Çerez politikası hakkında daha fazla bilgi almak için bizimle iletişime geçin
            </p>
            <a
              href="/contact"
              className="bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors"
            >
              İletişime Geçin
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
