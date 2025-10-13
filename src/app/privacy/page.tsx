"use client"

import { Shield, Eye, Lock, Database, UserCheck } from 'lucide-react';

export default function PrivacyPage() {

  const sections = [
    {
      icon: <Eye className="h-6 w-6 text-primary" />,
      title: "Veri Toplama",
      content: "Hizmetlerimizi sunmak için gerekli minimum düzeyde kişisel veri topluyoruz. Bu veriler email, isim ve oyun hesap bilgilerinizi içerir."
    },
    {
      icon: <Lock className="h-6 w-6 text-primary" />,
      title: "Veri Güvenliği",
      content: "Tüm verileriniz SSL şifreleme ile korunur ve güvenli sunucularda saklanır. Üçüncü taraflarla asla paylaşılmaz."
    },
    {
      icon: <Database className="h-6 w-6 text-primary" />,
      title: "Veri Saklama",
      content: "Verileriniz sadece hizmet vermek için gerekli olduğu süre boyunca saklanır. Hesabınızı sildiğinizde tüm verileriniz kalıcı olarak silinir."
    },
    {
      icon: <UserCheck className="h-6 w-6 text-primary" />,
      title: "Haklarınız",
      content: "KVKK kapsamında verilerinize erişim, düzeltme, silme ve taşınabilirlik haklarınız bulunmaktadır."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-6">
            <Shield className="h-12 w-12 text-primary mr-4" />
            <h1 className="text-4xl md:text-6xl font-bold text-foreground">
              Gizlilik Politikası
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Kişisel verilerinizin korunması bizim için çok önemli
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
              Giriş
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              AtlastBoost olarak, kişisel verilerinizin korunması bizim için çok önemlidir. Bu gizlilik politikası, 
              kişisel verilerinizi nasıl topladığımızı, kullandığımızı ve koruduğumuzu açıklar. KVKK (Kişisel Verilerin 
              Korunması Kanunu) ve GDPR (Genel Veri Koruma Tüzüğü) kapsamında haklarınızı korumaya kararlıyız.
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-8">
            {sections.map((section, index) => (
              <div key={index} className="bg-card border border-border rounded-lg p-8">
                <div className="flex items-start mb-4">
                  {section.icon}
                  <h3 className="text-xl font-semibold text-foreground ml-3">
                    {section.title}
                  </h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {section.content}
                </p>
              </div>
            ))}
          </div>

          {/* Detailed Privacy Policy */}
          <div className="bg-card border border-border rounded-lg p-8 mt-8">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Detaylı Gizlilik Politikası
            </h3>
            <div className="space-y-4 text-muted-foreground">
              <p>
                <strong className="text-foreground">1. Toplanan Veriler:</strong> Email adresi, isim, oyun hesap bilgileri, 
                sipariş geçmişi ve ödeme bilgileri (Stripe üzerinden işlenir).
              </p>
              <p>
                <strong className="text-foreground">2. Veri Kullanımı:</strong> Hizmet sunumu, sipariş takibi, müşteri desteği 
                ve yasal yükümlülüklerin yerine getirilmesi için kullanılır.
              </p>
              <p>
                <strong className="text-foreground">3. Veri Paylaşımı:</strong> Kişisel verileriniz üçüncü taraflarla paylaşılmaz. 
                Sadece yasal zorunluluklar durumunda yetkili makamlara bildirilir.
              </p>
              <p>
                <strong className="text-foreground">4. Çerezler:</strong> Web sitesi işlevselliği için gerekli çerezler kullanılır. 
                Çerez ayarlarınızı tarayıcınızdan yönetebilirsiniz.
              </p>
              <p>
                <strong className="text-foreground">5. Veri Güvenliği:</strong> SSL şifreleme, güvenli sunucular ve düzenli 
                güvenlik güncellemeleri ile verileriniz korunur.
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-8 mt-8 text-center">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Sorularınız mı var?
            </h3>
            <p className="text-muted-foreground mb-6">
              Gizlilik politikası hakkında sorularınız varsa bizimle iletişime geçin
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
