"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Gamepad2, 
  Shield, 
  Target,
  Star,
  Clock,
  Users,
  Trophy
} from "lucide-react";
import Link from "next/link";

export default function GamesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth/signin");
    }
  }, [session, status, router]);

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

  if (!session) {
    return null;
  }

  const games = [
    {
      id: "league-of-legends",
      name: "League of Legends",
      shortName: "LoL",
      description: "Dünyanın en popüler MOBA oyunu",
      icon: "🎮",
      image: "/images/LoL.jpeg",
      color: "from-blue-500 to-blue-700",
      bgColor: "bg-blue-50",
      features: [
        "Ranked Solo/Duo",
        "Ranked Flex",
        "Normal Games",
        "ARAM Boost"
      ],
      popular: true
    },
    {
      id: "valorant",
      name: "Valorant",
      shortName: "VAL",
      description: "Riot Games'in taktiksel FPS oyunu",
      icon: "🎯",
      image: "/images/Valorant.jpeg",
      color: "from-red-500 to-red-700",
      bgColor: "bg-red-50",
      features: [
        "Competitive",
        "Unrated",
        "Spike Rush",
        "Deathmatch"
      ],
      popular: true
    }
  ];

  const handleGameSelect = (gameId: string) => {
    router.push(`/games/${gameId}/services`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center"
              >
                <span className="text-white font-bold text-lg">A</span>
              </motion.div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Oyun Seçimi
              </h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {session.user?.name?.charAt(0) || "U"}
                </span>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900">
                  {session.user?.name || "Kullanıcı"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Hangi oyunda boost almak istiyorsunuz? 🎮
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Profesyonel oyuncularımızla rankınızı yükseltin ve hedeflediğiniz seviyeye ulaşın.
          </p>
        </motion.div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {games.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              {game.popular && (
                <div className="absolute -top-3 -right-3 z-10">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                    <Star className="h-4 w-4" />
                    <span>Popüler</span>
                  </div>
                </div>
              )}
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleGameSelect(game.id)}
                className={`${game.bgColor} rounded-3xl p-8 border-2 border-transparent hover:border-gray-200 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl overflow-hidden relative`}
              >
                {/* Background Image */}
                <div className="absolute inset-0 opacity-20">
                  <img 
                    src={game.image} 
                    alt={game.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="relative z-10 text-center mb-6">
                  <div className="text-6xl mb-4">{game.icon}</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{game.name}</h3>
                  <p className="text-gray-600 mb-4">{game.description}</p>
                  <div className={`inline-block px-4 py-2 bg-gradient-to-r ${game.color} text-white rounded-full text-sm font-medium`}>
                    {game.shortName}
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <h4 className="font-semibold text-gray-900 flex items-center">
                    <Gamepad2 className="h-5 w-5 mr-2" />
                    Mevcut Servisler
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {game.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-center space-x-6 text-sm text-gray-600 mb-6">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>Hızlı</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Shield className="h-4 w-4" />
                    <span>Güvenli</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>Profesyonel</span>
                  </div>
                </div>

                <Button 
                  className={`w-full bg-gradient-to-r ${game.color} hover:opacity-90 text-lg py-3`}
                  onClick={() => handleGameSelect(game.id)}
                >
                  <Trophy className="mr-2 h-5 w-5" />
                  {game.name} Boost'u Seç
                  <Target className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-16 bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-lg"
        >
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Neden AtlasBoost? 🚀
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "100% Güvenli",
                description: "Hesabınız tamamen güvende, garantili güvenlik",
                color: "text-green-600"
              },
              {
                icon: Clock,
                title: "Hızlı Teslimat",
                description: "24-48 saat içinde boost tamamlanır",
                color: "text-blue-600"
              },
              {
                icon: Trophy,
                title: "Profesyonel Oyuncular",
                description: "Sadece en iyi oyuncularımız boost yapar",
                color: "text-purple-600"
              }
            ].map((feature, index) => (
              <div key={feature.title} className="text-center">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center`}>
                  <feature.icon className={`h-8 w-8 ${feature.color}`} />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h4>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
