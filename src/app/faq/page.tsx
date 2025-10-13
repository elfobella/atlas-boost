"use client"

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

export default function FAQPage() {
  const t = useTranslations('faq');
  const [openItems, setOpenItems] = useState<number[]>([]);

  const faqs = [
    {
      question: "Boost hizmeti nasıl çalışır?",
      answer: "Profesyonel boosterlarımız sizin hesabınızda oyun oynayarak hedef rankınıza ulaşır. Tüm işlemler VPN kullanılarak güvenli bir şekilde gerçekleştirilir."
    },
    {
      question: "Hesabım güvende mi?",
      answer: "Evet, tüm boost işlemlerimiz VPN kullanılarak gerçekleştirilir ve hesap bilgileriniz şifrelenmiş olarak saklanır. Boost işlemi sırasında hesabınızın güvenliği bizim önceliğimizdir."
    },
    {
      question: "Ne kadar sürede tamamlanır?",
      answer: "Boost süresi hedef rankınıza ve mevcut durumunuza bağlıdır. Genellikle 2-6 gün arasında tamamlanır. Detaylı süre tahmini sipariş verirken gösterilir."
    },
    {
      question: "İade alabilir miyim?",
      answer: "24 saat içinde iade talebinde bulunabilirsiniz. Ancak boost işlemi başladıktan sonra iade yapılmaz. İade işlemi 3-5 iş günü içinde tamamlanır."
    },
    {
      question: "Hangi oyunları destekliyorsunuz?",
      answer: "Şu anda League of Legends ve Valorant oyunları için boost hizmeti sunuyoruz. Gelecekte daha fazla oyun eklemeyi planlıyoruz."
    },
    {
      question: "Boost işlemi sırasında ne yapabilirim?",
      answer: "Boost işlemi devam ederken hesabınıza giriş yapmamanızı öneriyoruz. Bu, işlemin hızını artırır ve güvenliği sağlar. İlerleme durumunu dashboard'dan takip edebilirsiniz."
    },
    {
      question: "Booster kimliği gizli mi?",
      answer: "Evet, booster kimlikleri gizli tutulur. Sadece booster'ın oyundaki ismini görebilirsiniz. Bu, hem sizin hem booster'ın güvenliği için önemlidir."
    },
    {
      question: "Nasıl iletişim kurabilirim?",
      answer: "24/7 canlı destek hizmetimiz mevcuttur. Ayrıca email yoluyla da bizimle iletişime geçebilirsiniz. Tüm sorularınız 24 saat içinde yanıtlanır."
    },
    {
      question: "Ödeme güvenli mi?",
      answer: "Tüm ödemeler Stripe güvenli ödeme sistemi üzerinden işlenir. Kredi kartı bilgileriniz saklanmaz ve güvenli bir şekilde işlenir."
    },
    {
      question: "Boost sonrası ne olur?",
      answer: "Boost tamamlandıktan sonra hesabınızın kontrolü size geri verilir. Hedef rankınıza ulaştığınızı onaylayabilir ve booster'ı değerlendirebilirsiniz."
    }
  ];

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(item => item !== index)
        : [...prev, index]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-6">
            <HelpCircle className="h-12 w-12 text-primary mr-4" />
            <h1 className="text-4xl md:text-6xl font-bold text-foreground">
              {t('title')}
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-card border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-foreground pr-4">
                    {faq.question}
                  </h3>
                  {openItems.includes(index) ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  )}
                </button>
                
                {openItems.includes(index) && (
                  <div className="px-6 pb-6">
                    <p className="text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contact Section */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-8 mt-12 text-center">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              {t('stillHaveQuestions')}
            </h3>
            <p className="text-muted-foreground mb-6">
              {t('stillHaveQuestionsDescription')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors"
              >
                {t('contactSupport')}
              </a>
              <a
                href="/dashboard"
                className="border border-primary text-primary px-6 py-3 rounded-md hover:bg-primary/10 transition-colors"
              >
                {t('viewOrders')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
