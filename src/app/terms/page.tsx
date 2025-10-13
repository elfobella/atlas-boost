"use client"

import { useTranslations } from 'next-intl';
import { FileText, Shield, AlertTriangle, Users, CreditCard } from 'lucide-react';

export default function TermsPage() {
  const t = useTranslations('terms');

  const sections = [
    {
      icon: <Users className="h-6 w-6 text-primary" />,
      title: "Kullanım Şartları",
      content: "Hizmetlerimizi kullanarak bu şartları kabul etmiş olursunuz. Hesabınızı güvenli tutmak ve platform kurallarına uymak sizin sorumluluğunuzdadır."
    },
    {
      icon: <CreditCard className="h-6 w-6 text-primary" />,
      title: "Ödeme ve İade",
      content: "Tüm ödemeler Stripe üzerinden güvenli bir şekilde işlenir. İade politikamız 24 saat içinde geçerlidir ve belirli şartlara tabidir."
    },
    {
      icon: <Shield className="h-6 w-6 text-primary" />,
      title: "Güvenlik ve Gizlilik",
      content: "Hesap bilgileriniz şifrelenmiş olarak saklanır ve üçüncü taraflarla paylaşılmaz. VPN kullanarak boost işlemlerinizi gerçekleştiririz."
    },
    {
      icon: <AlertTriangle className="h-6 w-6 text-primary" />,
      title: "Sorumluluk Reddi",
      content: "Boost hizmetleri eğlence amaçlıdır. Oyun hesaplarınızın güvenliği için tüm önlemleri alırız, ancak oyun şirketlerinin politikaları değişebilir."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-6">
            <FileText className="h-12 w-12 text-primary mr-4" />
            <h1 className="text-4xl md:text-6xl font-bold text-foreground">
              {t('title')}
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('subtitle')}
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
              {t('introduction')}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('introductionContent')}
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

          {/* Detailed Terms */}
          <div className="bg-card border border-border rounded-lg p-8 mt-8">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              {t('detailedTerms')}
            </h3>
            <div className="space-y-4 text-muted-foreground">
              <p>
                <strong className="text-foreground">1. Hizmet Kapsamı:</strong> AtlastBoost, League of Legends ve Valorant oyunları için profesyonel boost hizmetleri sunar.
              </p>
              <p>
                <strong className="text-foreground">2. Kullanıcı Sorumlulukları:</strong> Doğru hesap bilgileri sağlamak, güvenli şifre kullanmak ve platform kurallarına uymak.
              </p>
              <p>
                <strong className="text-foreground">3. Ödeme Koşulları:</strong> Tüm ödemeler peşin alınır ve Stripe güvenli ödeme sistemi kullanılır.
              </p>
              <p>
                <strong className="text-foreground">4. İade Politikası:</strong> 24 saat içinde iade talebinde bulunabilirsiniz. Boost işlemi başladıktan sonra iade yapılmaz.
              </p>
              <p>
                <strong className="text-foreground">5. Gizlilik:</strong> Kişisel bilgileriniz KVKK kapsamında korunur ve üçüncü taraflarla paylaşılmaz.
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-8 mt-8 text-center">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              {t('questions')}
            </h3>
            <p className="text-muted-foreground mb-6">
              {t('questionsDescription')}
            </p>
            <a
              href="/contact"
              className="bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors"
            >
              {t('contactUs')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
