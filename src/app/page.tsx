"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  Shield, 
  Zap, 
  Star, 
  Users, 
  CheckCircle,
  Sparkles
} from "lucide-react";
import { OptimizedImage, HeroImage, CardImage } from "@/components/ui/image";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-600">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center"
              >
                <span className="text-white font-bold text-lg">A</span>
              </motion.div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AtlasBoost
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/auth/signin">
                <Button variant="ghost">
                  Giriş Yap
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                  Kayıt Ol
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <HeroImage 
            src="/images/hero/hero-bg.svg" 
            alt="Hero Background" 
            className="object-cover"
          />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
                Profesyonel
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {" "}Game Boost
                </span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                League of Legends ve Valorant için profesyonel rank boost servisleri. 
                Güvenli, hızlı ve garantili boost deneyimi yaşayın.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            >
              <Link href="/auth/signup">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-lg px-8 py-4 h-auto"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Hemen Başla
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/auth/signin">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-lg px-8 py-4 h-auto border-2"
                >
                  Giriş Yap
                </Button>
              </Link>
            </motion.div>

            {/* Features Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
            >
              {[
                {
                  icon: Shield,
                  title: "100% Güvenli",
                  description: "Hesabınız tamamen güvende, garantili güvenlik",
                  color: "from-green-500 to-green-600",
                  image: "/images/features/feature-1.svg"
                },
                {
                  icon: Zap,
                  title: "Hızlı Teslimat",
                  description: "24-48 saat içinde boost tamamlanır",
                  color: "from-yellow-500 to-yellow-600",
                  image: "/images/features/feature-2.svg"
                },
                {
                  icon: Users,
                  title: "Profesyonel Oyuncular",
                  description: "Sadece en iyi oyuncularımız boost yapar",
                  color: "from-blue-500 to-blue-600",
                  image: "/images/features/feature-3.svg"
                }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="relative mb-4">
                    <CardImage 
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <div className={`absolute top-2 right-2 w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center shadow-lg`}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Neden AtlasBoost?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Profesyonel game boost servisleri ile hedeflediğiniz rank'a ulaşın
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {[
                {
                  icon: CheckCircle,
                  title: "Güvenli Boost",
                  description: "Hesabınız tamamen güvende, hiçbir risk yok"
                },
                {
                  icon: CheckCircle,
                  title: "Hızlı Teslimat",
                  description: "24-48 saat içinde boost tamamlanır"
                },
                {
                  icon: CheckCircle,
                  title: "Profesyonel Oyuncular",
                  description: "Sadece en iyi oyuncularımız boost yapar"
                },
                {
                  icon: CheckCircle,
                  title: "Garantili Sonuç",
                  description: "Hedeflediğiniz rank'a ulaşma garantisi"
                }
              ].map((feature, index) => (
                <div key={feature.title} className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <feature.icon className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-8 text-white">
                <div className="text-center">
                  <Star className="h-12 w-12 mx-auto mb-4 text-yellow-300" />
                  <h3 className="text-2xl font-bold mb-2">Premium Deneyim</h3>
                  <p className="text-blue-100 mb-6">
                    Modern teknolojilerle geliştirilmiş, kullanıcı dostu arayüz
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold">99.9%</div>
                      <div className="text-sm text-blue-100">Uptime</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">1.2s</div>
                      <div className="text-sm text-blue-100">Yükleme</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-12 text-white"
          >
            <h2 className="text-4xl font-bold mb-4">
              Hemen Başlayın!
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Modern web uygulaması deneyimini yaşamak için hemen kayıt olun.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button 
                  size="lg" 
                  className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4 h-auto"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Ücretsiz Kayıt Ol
                </Button>
              </Link>
              <Link href="/auth/signin">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-4 h-auto"
                >
                  Giriş Yap
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <h3 className="text-2xl font-bold">AtlasBoost</h3>
            </div>
            <p className="text-gray-400 mb-4">
              Modern web teknolojileri ile geliştirilmiş güvenli uygulama
            </p>
            <p className="text-gray-500 text-sm">
              © 2024 AtlasBoost. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
