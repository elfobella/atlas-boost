"use client"

import { useTranslations } from 'next-intl';
import { CheckCircle, Clock, Shield, Trophy } from 'lucide-react';

export default function ServicesPage() {
  const t = useTranslations('services');

  const services = [
    {
      icon: <Trophy className="h-8 w-8 text-primary" />,
      title: "Rank Boost",
      description: "Hedef rankınıza hızlı ve güvenli bir şekilde ulaşın",
      features: ["Profesyonel boosterlar", "Güvenli işlem", "Hızlı teslimat"]
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: "Account Protection",
      description: "Hesabınızın güvenliği bizim önceliğimiz",
      features: ["VPN kullanımı", "Güvenli bağlantı", "Hesap koruması"]
    },
    {
      icon: <Clock className="h-8 w-8 text-primary" />,
      title: "24/7 Support",
      description: "Her zaman yanınızdayız",
      features: ["Canlı destek", "Hızlı yanıt", "Uzman ekip"]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            {t('title')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div key={index} className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                {service.icon}
                <h3 className="text-xl font-semibold text-foreground ml-3">
                  {service.title}
                </h3>
              </div>
              <p className="text-muted-foreground mb-4">
                {service.description}
              </p>
              <ul className="space-y-2">
                {service.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center text-sm text-foreground">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary/5 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            {t('ctaTitle')}
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t('ctaDescription')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/games/rank-selector"
              className="bg-primary text-primary-foreground px-8 py-3 rounded-md hover:bg-primary/90 transition-colors"
            >
              {t('getStarted')}
            </a>
            <a
              href="/contact"
              className="border border-primary text-primary px-8 py-3 rounded-md hover:bg-primary/10 transition-colors"
            >
              {t('contactUs')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
