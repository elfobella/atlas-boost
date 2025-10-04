"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, use } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  ArrowRight,
  CreditCard,
  Shield,
  Clock,
  CheckCircle,
  Star,
  AlertCircle
} from "lucide-react";
import Link from "next/link";

interface GameData {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  color: string;
}

interface ServiceData {
  id: string;
  name: string;
  description: string;
  icon: any;
  features: string[];
  popular: boolean;
  estimatedTime: string;
  price: string;
  image: string;
  gradient: string;
}

interface RankData {
  id: string;
  name: string;
  tier: string;
  division: string;
  lp: number;
  color: string;
  icon: string;
}

export default function CheckoutPage({ params }: { params: Promise<{ gameId: string; serviceId: string }> }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [serviceData, setServiceData] = useState<ServiceData | null>(null);
  const [currentRank, setCurrentRank] = useState<RankData | null>(null);
  const [targetRank, setTargetRank] = useState<RankData | null>(null);
  const [loading, setLoading] = useState(false);
  
  const resolvedParams = use(params);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth/signin");
    }
  }, [session, status, router]);

  useEffect(() => {
    // Game data
    const games: Record<string, GameData> = {
      "league-of-legends": {
        id: "league-of-legends",
        name: "League of Legends",
        shortName: "LoL",
        icon: "🎮",
        color: "from-blue-500 to-blue-700"
      },
      "valorant": {
        id: "valorant",
        name: "Valorant",
        shortName: "VAL",
        icon: "🎯",
        color: "from-red-500 to-red-700"
      }
    };

    // Service data
    const services: Record<string, ServiceData> = {
      "rank-boost": {
        id: "rank-boost",
        name: "Rank Boost",
        description: "Belirli bir rank'a kadar yükselme",
        icon: "📈",
        features: ["Profesyonel oyuncu", "Hızlı teslimat", "Güvenli işlem"],
        popular: true,
        estimatedTime: "1-3 gün",
        price: "₺150'den başlayan fiyatlar",
        image: games[resolvedParams.gameId]?.id === "league-of-legends" ? "/images/LoL.jpeg" : "/images/Valorant.jpeg",
        gradient: "from-emerald-500 to-teal-600"
      },
      "win-boost": {
        id: "win-boost",
        name: "Win Boost",
        description: "Belirli sayıda galibiyet garantisi",
        icon: "🏆",
        features: ["Garantili galibiyet", "Hızlı teslimat", "Güvenli işlem"],
        popular: true,
        estimatedTime: "1-2 gün",
        price: "₺50'den başlayan fiyatlar",
        image: games[resolvedParams.gameId]?.id === "league-of-legends" ? "/images/LoL.jpeg" : "/images/Valorant.jpeg",
        gradient: "from-yellow-500 to-orange-600"
      },
      "placement-matches": {
        id: "placement-matches",
        name: "Placement Matches",
        description: "Sıralama maçları için boost",
        icon: "🎯",
        features: ["Yüksek rank", "Hızlı teslimat", "Güvenli işlem"],
        popular: false,
        estimatedTime: "2-4 gün",
        price: "₺200'den başlayan fiyatlar",
        image: games[resolvedParams.gameId]?.id === "league-of-legends" ? "/images/LoL.jpeg" : "/images/Valorant.jpeg",
        gradient: "from-purple-500 to-pink-600"
      },
      "duo-boost": {
        id: "duo-boost",
        name: "Duo Boost",
        description: "Birlikte oynayarak rank yükseltme",
        icon: "👥",
        features: ["Birlikte oyun", "Öğrenme fırsatı", "Güvenli işlem"],
        popular: false,
        estimatedTime: "3-7 gün",
        price: "₺100'den başlayan fiyatlar",
        image: games[resolvedParams.gameId]?.id === "league-of-legends" ? "/images/LoL.jpeg" : "/images/Valorant.jpeg",
        gradient: "from-blue-500 to-indigo-600"
      }
    };

    setGameData(games[resolvedParams.gameId] || null);
    setServiceData(services[resolvedParams.serviceId] || null);

    // Parse rank data from URL params
    const currentRankParam = searchParams.get('current');
    const targetRankParam = searchParams.get('target');

    if (currentRankParam && targetRankParam) {
      // Create mock rank data based on params
      const currentRankData: RankData = {
        id: currentRankParam,
        name: currentRankParam.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        tier: currentRankParam.split('-')[0],
        division: currentRankParam.split('-')[1] || '',
        lp: 0,
        color: "bg-gray-600",
        icon: "⚫"
      };

      const targetRankData: RankData = {
        id: targetRankParam,
        name: targetRankParam.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        tier: targetRankParam.split('-')[0],
        division: targetRankParam.split('-')[1] || '',
        lp: 0,
        color: "bg-gray-600",
        icon: "⚫"
      };

      setCurrentRank(currentRankData);
      setTargetRank(targetRankData);
    }
  }, [resolvedParams.gameId, resolvedParams.serviceId, searchParams]);

  const calculatePrice = () => {
    if (!currentRank || !targetRank) return 150;
    
    // Simple price calculation based on rank difference
    const basePrice = 50;
    const rankDifference = Math.abs(targetRank.lp - currentRank.lp);
    return Math.max(basePrice, rankDifference + 100);
  };

  const handlePayment = async () => {
    if (!session || !gameData || !serviceData || !currentRank || !targetRank) return;

    setLoading(true);

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameId: gameData.id,
          gameName: gameData.name,
          serviceId: serviceData.id,
          serviceName: serviceData.name,
          currentRank: currentRank.name,
          targetRank: targetRank.name,
          price: calculatePrice(),
          userId: session.user?.email,
        }),
      });

      const data = await response.json();
      console.log('API Response:', data);

      if (!response.ok) {
        console.error('API Error:', data);
        console.error('Response status:', response.status);
        console.error('Response headers:', response.headers);
        setLoading(false);
        
        // Show user-friendly error message
        alert(`Ödeme işlemi başlatılamadı: ${data.error || 'Bilinmeyen hata'}`);
        return;
      }

      // Use the checkout URL directly
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('No checkout URL received:', data);
        setLoading(false);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setLoading(false);
    }
  };

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

  if (!session || !gameData || !serviceData || !currentRank || !targetRank) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href={`/games/${resolvedParams.gameId}/services`}>
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
                Ödeme
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-lg"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Sipariş Özeti</h2>
            
            {/* Game Info */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden">
                <img 
                  src={gameData.id === "league-of-legends" ? "/images/LoL.jpeg" : "/images/Valorant.jpeg"}
                  alt={gameData.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                  <span className="text-2xl">{gameData.icon}</span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{gameData.name}</h3>
                <p className="text-gray-600">Boost Servisi</p>
              </div>
            </div>

            {/* Service Details */}
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                <div>
                  <h4 className="font-semibold text-gray-900">{serviceData.name}</h4>
                  <p className="text-sm text-gray-600">{serviceData.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Tahmini Süre</p>
                  <p className="font-semibold text-gray-900">{serviceData.estimatedTime}</p>
                </div>
              </div>

              {/* Rank Details */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Mevcut Rank</span>
                  <span className="text-sm text-gray-600">Hedef Rank</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">{currentRank.name}</span>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                  <span className="font-semibold text-gray-900">{targetRank.name}</span>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-2 mb-6">
              <h4 className="font-semibold text-gray-900">Özellikler:</h4>
              {serviceData.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Payment Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-lg"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Ödeme</h2>
            
            {/* Price */}
            <div className="text-center mb-8">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                ₺{calculatePrice()}
              </div>
              <p className="text-gray-600">Tek seferlik ödeme</p>
            </div>

            {/* Security Features */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-xl">
                <Shield className="h-5 w-5 text-green-600" />
                <div>
                  <h4 className="font-semibold text-gray-900">Güvenli Ödeme</h4>
                  <p className="text-sm text-gray-600">Stripe ile 256-bit SSL şifreleme</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-xl">
                <Clock className="h-5 w-5 text-blue-600" />
                <div>
                  <h4 className="font-semibold text-gray-900">Hızlı İşlem</h4>
                  <p className="text-sm text-gray-600">Ödeme sonrası hemen başlar</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-xl">
                <Star className="h-5 w-5 text-purple-600" />
                <div>
                  <h4 className="font-semibold text-gray-900">Garanti</h4>
                  <p className="text-sm text-gray-600">Sonuç garantisi</p>
                </div>
              </div>
            </div>

            {/* Payment Button */}
            <Button 
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white text-lg py-4 h-auto"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>İşleniyor...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Güvenli Ödeme Yap</span>
                  <ArrowRight className="h-5 w-5" />
                </div>
              )}
            </Button>

            {/* Terms */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Ödeme yaparak{" "}
                <Link href="/terms" className="text-blue-600 hover:underline">
                  Kullanım Şartları
                </Link>{" "}
                ve{" "}
                <Link href="/privacy" className="text-blue-600 hover:underline">
                  Gizlilik Politikası
                </Link>{" "}
                'nı kabul etmiş olursunuz.
              </p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
