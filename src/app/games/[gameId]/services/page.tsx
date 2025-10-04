"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  ArrowRight,
  TrendingUp, 
  Target,
  Star,
  Clock,
  Shield,
  Zap,
  Trophy,
  Gamepad2,
  CheckCircle
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

export default function ServicesPage({ params }: { params: Promise<{ gameId: string }> }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [selectedService, setSelectedService] = useState<ServiceData | null>(null);
  const [currentTier, setCurrentTier] = useState<string>("");
  const [currentDivision, setCurrentDivision] = useState<string>("");
  const [targetTier, setTargetTier] = useState<string>("");
  const [targetDivision, setTargetDivision] = useState<string>("");
  
  const resolvedParams = use(params);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth/signin");
    }
  }, [session, status, router]);

  useEffect(() => {
    // Game data based on gameId
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

    setGameData(games[resolvedParams.gameId] || null);
  }, [resolvedParams.gameId]);

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

  if (!session || !gameData) {
    return null;
  }

  const services: ServiceData[] = [
    {
      id: "rank-boost",
      name: "Rank Boost",
      description: "Belirli bir rank'a kadar yükselme",
      icon: TrendingUp,
      features: ["Profesyonel oyuncu", "Hızlı teslimat", "Güvenli işlem"],
      popular: true,
      estimatedTime: "1-3 gün",
      price: "₺150'den başlayan fiyatlar",
      image: gameData?.id === "league-of-legends" ? "/images/LoL.jpeg" : "/images/Valorant.jpeg",
      gradient: "from-emerald-500 to-teal-600"
    },
    {
      id: "win-boost",
      name: "Win Boost",
      description: "Belirli sayıda galibiyet garantisi",
      icon: Trophy,
      features: ["Garantili galibiyet", "Hızlı teslimat", "Güvenli işlem"],
      popular: true,
      estimatedTime: "1-2 gün",
      price: "₺50'den başlayan fiyatlar",
      image: gameData?.id === "league-of-legends" ? "/images/LoL.jpeg" : "/images/Valorant.jpeg",
      gradient: "from-yellow-500 to-orange-600"
    },
    {
      id: "placement-matches",
      name: "Placement Matches",
      description: "Sıralama maçları için boost",
      icon: Target,
      features: ["Yüksek rank", "Hızlı teslimat", "Güvenli işlem"],
      popular: false,
      estimatedTime: "2-4 gün",
      price: "₺200'den başlayan fiyatlar",
      image: gameData?.id === "league-of-legends" ? "/images/LoL.jpeg" : "/images/Valorant.jpeg",
      gradient: "from-purple-500 to-pink-600"
    },
    {
      id: "duo-boost",
      name: "Duo Boost",
      description: "Birlikte oynayarak rank yükseltme",
      icon: Gamepad2,
      features: ["Birlikte oyun", "Öğrenme fırsatı", "Güvenli işlem"],
      popular: false,
      estimatedTime: "3-7 gün",
      price: "₺100'den başlayan fiyatlar",
      image: gameData?.id === "league-of-legends" ? "/images/LoL.jpeg" : "/images/Valorant.jpeg",
      gradient: "from-blue-500 to-indigo-600"
    }
  ];

  // Rank data for League of Legends
  const lolRanks: RankData[] = [
    { id: "iron-4", name: "Iron IV", tier: "Iron", division: "IV", lp: 0, color: "bg-gray-600", icon: "⚫" },
    { id: "iron-3", name: "Iron III", tier: "Iron", division: "III", lp: 100, color: "bg-gray-600", icon: "⚫" },
    { id: "iron-2", name: "Iron II", tier: "Iron", division: "II", lp: 200, color: "bg-gray-600", icon: "⚫" },
    { id: "iron-1", name: "Iron I", tier: "Iron", division: "I", lp: 300, color: "bg-gray-600", icon: "⚫" },
    { id: "bronze-4", name: "Bronze IV", tier: "Bronze", division: "IV", lp: 400, color: "bg-orange-600", icon: "🟤" },
    { id: "bronze-3", name: "Bronze III", tier: "Bronze", division: "III", lp: 500, color: "bg-orange-600", icon: "🟤" },
    { id: "bronze-2", name: "Bronze II", tier: "Bronze", division: "II", lp: 600, color: "bg-orange-600", icon: "🟤" },
    { id: "bronze-1", name: "Bronze I", tier: "Bronze", division: "I", lp: 700, color: "bg-orange-600", icon: "🟤" },
    { id: "silver-4", name: "Silver IV", tier: "Silver", division: "IV", lp: 800, color: "bg-gray-400", icon: "⚪" },
    { id: "silver-3", name: "Silver III", tier: "Silver", division: "III", lp: 900, color: "bg-gray-400", icon: "⚪" },
    { id: "silver-2", name: "Silver II", tier: "Silver", division: "II", lp: 1000, color: "bg-gray-400", icon: "⚪" },
    { id: "silver-1", name: "Silver I", tier: "Silver", division: "I", lp: 1100, color: "bg-gray-400", icon: "⚪" },
    { id: "gold-4", name: "Gold IV", tier: "Gold", division: "IV", lp: 1200, color: "bg-yellow-500", icon: "🟡" },
    { id: "gold-3", name: "Gold III", tier: "Gold", division: "III", lp: 1300, color: "bg-yellow-500", icon: "🟡" },
    { id: "gold-2", name: "Gold II", tier: "Gold", division: "II", lp: 1400, color: "bg-yellow-500", icon: "🟡" },
    { id: "gold-1", name: "Gold I", tier: "Gold", division: "I", lp: 1500, color: "bg-yellow-500", icon: "🟡" },
    { id: "platinum-4", name: "Platinum IV", tier: "Platinum", division: "IV", lp: 1600, color: "bg-green-500", icon: "🟢" },
    { id: "platinum-3", name: "Platinum III", tier: "Platinum", division: "III", lp: 1700, color: "bg-green-500", icon: "🟢" },
    { id: "platinum-2", name: "Platinum II", tier: "Platinum", division: "II", lp: 1800, color: "bg-green-500", icon: "🟢" },
    { id: "platinum-1", name: "Platinum I", tier: "Platinum", division: "I", lp: 1900, color: "bg-green-500", icon: "🟢" },
    { id: "diamond-4", name: "Diamond IV", tier: "Diamond", division: "IV", lp: 2000, color: "bg-blue-500", icon: "🔵" },
    { id: "diamond-3", name: "Diamond III", tier: "Diamond", division: "III", lp: 2100, color: "bg-blue-500", icon: "🔵" },
    { id: "diamond-2", name: "Diamond II", tier: "Diamond", division: "II", lp: 2200, color: "bg-blue-500", icon: "🔵" },
    { id: "diamond-1", name: "Diamond I", tier: "Diamond", division: "I", lp: 2300, color: "bg-blue-500", icon: "🔵" },
    { id: "master", name: "Master", tier: "Master", division: "", lp: 2400, color: "bg-purple-600", icon: "🟣" },
    { id: "grandmaster", name: "Grandmaster", tier: "Grandmaster", division: "", lp: 2500, color: "bg-red-600", icon: "🔴" },
    { id: "challenger", name: "Challenger", tier: "Challenger", division: "", lp: 2600, color: "bg-yellow-600", icon: "⚡" }
  ];

  // Rank data for Valorant
  const valorantRanks: RankData[] = [
    { id: "iron-1", name: "Iron 1", tier: "Iron", division: "1", lp: 0, color: "bg-gray-600", icon: "⚫" },
    { id: "iron-2", name: "Iron 2", tier: "Iron", division: "2", lp: 100, color: "bg-gray-600", icon: "⚫" },
    { id: "iron-3", name: "Iron 3", tier: "Iron", division: "3", lp: 200, color: "bg-gray-600", icon: "⚫" },
    { id: "bronze-1", name: "Bronze 1", tier: "Bronze", division: "1", lp: 300, color: "bg-orange-600", icon: "🟤" },
    { id: "bronze-2", name: "Bronze 2", tier: "Bronze", division: "2", lp: 400, color: "bg-orange-600", icon: "🟤" },
    { id: "bronze-3", name: "Bronze 3", tier: "Bronze", division: "3", lp: 500, color: "bg-orange-600", icon: "🟤" },
    { id: "silver-1", name: "Silver 1", tier: "Silver", division: "1", lp: 600, color: "bg-gray-400", icon: "⚪" },
    { id: "silver-2", name: "Silver 2", tier: "Silver", division: "2", lp: 700, color: "bg-gray-400", icon: "⚪" },
    { id: "silver-3", name: "Silver 3", tier: "Silver", division: "3", lp: 800, color: "bg-gray-400", icon: "⚪" },
    { id: "gold-1", name: "Gold 1", tier: "Gold", division: "1", lp: 900, color: "bg-yellow-500", icon: "🟡" },
    { id: "gold-2", name: "Gold 2", tier: "Gold", division: "2", lp: 1000, color: "bg-yellow-500", icon: "🟡" },
    { id: "gold-3", name: "Gold 3", tier: "Gold", division: "3", lp: 1100, color: "bg-yellow-500", icon: "🟡" },
    { id: "platinum-1", name: "Platinum 1", tier: "Platinum", division: "1", lp: 1200, color: "bg-green-500", icon: "🟢" },
    { id: "platinum-2", name: "Platinum 2", tier: "Platinum", division: "2", lp: 1300, color: "bg-green-500", icon: "🟢" },
    { id: "platinum-3", name: "Platinum 3", tier: "Platinum", division: "3", lp: 1400, color: "bg-green-500", icon: "🟢" },
    { id: "diamond-1", name: "Diamond 1", tier: "Diamond", division: "1", lp: 1500, color: "bg-blue-500", icon: "🔵" },
    { id: "diamond-2", name: "Diamond 2", tier: "Diamond", division: "2", lp: 1600, color: "bg-blue-500", icon: "🔵" },
    { id: "diamond-3", name: "Diamond 3", tier: "Diamond", division: "3", lp: 1700, color: "bg-blue-500", icon: "🔵" },
    { id: "ascendant-1", name: "Ascendant 1", tier: "Ascendant", division: "1", lp: 1800, color: "bg-teal-500", icon: "🔷" },
    { id: "ascendant-2", name: "Ascendant 2", tier: "Ascendant", division: "2", lp: 1900, color: "bg-teal-500", icon: "🔷" },
    { id: "ascendant-3", name: "Ascendant 3", tier: "Ascendant", division: "3", lp: 2000, color: "bg-teal-500", icon: "🔷" },
    { id: "immortal-1", name: "Immortal 1", tier: "Immortal", division: "1", lp: 2100, color: "bg-red-600", icon: "🔴" },
    { id: "immortal-2", name: "Immortal 2", tier: "Immortal", division: "2", lp: 2200, color: "bg-red-600", icon: "🔴" },
    { id: "immortal-3", name: "Immortal 3", tier: "Immortal", division: "3", lp: 2300, color: "bg-red-600", icon: "🔴" },
    { id: "radiant", name: "Radiant", tier: "Radiant", division: "", lp: 2400, color: "bg-yellow-600", icon: "⚡" }
  ];

  // Tier lists
  const lolTiers = [
    { id: "iron", name: "Iron", color: "bg-gray-600", icon: "⚫", divisions: ["IV", "III", "II", "I"] },
    { id: "bronze", name: "Bronze", color: "bg-orange-600", icon: "🟤", divisions: ["IV", "III", "II", "I"] },
    { id: "silver", name: "Silver", color: "bg-gray-400", icon: "⚪", divisions: ["IV", "III", "II", "I"] },
    { id: "gold", name: "Gold", color: "bg-yellow-500", icon: "🟡", divisions: ["IV", "III", "II", "I"] },
    { id: "platinum", name: "Platinum", color: "bg-green-500", icon: "🟢", divisions: ["IV", "III", "II", "I"] },
    { id: "diamond", name: "Diamond", color: "bg-blue-500", icon: "🔵", divisions: ["IV", "III", "II", "I"] },
    { id: "master", name: "Master", color: "bg-purple-600", icon: "🟣", divisions: [""] },
    { id: "grandmaster", name: "Grandmaster", color: "bg-red-600", icon: "🔴", divisions: [""] },
    { id: "challenger", name: "Challenger", color: "bg-yellow-600", icon: "⚡", divisions: [""] }
  ];

  const valorantTiers = [
    { id: "iron", name: "Iron", color: "bg-gray-600", icon: "⚫", divisions: ["1", "2", "3"] },
    { id: "bronze", name: "Bronze", color: "bg-orange-600", icon: "🟤", divisions: ["1", "2", "3"] },
    { id: "silver", name: "Silver", color: "bg-gray-400", icon: "⚪", divisions: ["1", "2", "3"] },
    { id: "gold", name: "Gold", color: "bg-yellow-500", icon: "🟡", divisions: ["1", "2", "3"] },
    { id: "platinum", name: "Platinum", color: "bg-green-500", icon: "🟢", divisions: ["1", "2", "3"] },
    { id: "diamond", name: "Diamond", color: "bg-blue-500", icon: "🔵", divisions: ["1", "2", "3"] },
    { id: "ascendant", name: "Ascendant", color: "bg-teal-500", icon: "🔷", divisions: ["1", "2", "3"] },
    { id: "immortal", name: "Immortal", color: "bg-red-600", icon: "🔴", divisions: ["1", "2", "3"] },
    { id: "radiant", name: "Radiant", color: "bg-yellow-600", icon: "⚡", divisions: [""] }
  ];

  const tiers = gameData?.id === "league-of-legends" ? lolTiers : valorantTiers;

  // Helper function to get rank LP value
  const getRankLP = (tier: string, division: string) => {
    const tierIndex = tiers.findIndex(t => t.id === tier);
    if (tierIndex === -1) return 0;
    
    const tierLP = tierIndex * 400; // Base LP for each tier
    const divisionLP = division ? (tiers[tierIndex].divisions.indexOf(division) * 100) : 0;
    return tierLP + divisionLP;
  };

  const calculatePrice = () => {
    if (!currentTier || !currentDivision || !targetTier || !targetDivision) return 0;
    
    const currentLP = getRankLP(currentTier, currentDivision);
    const targetLP = getRankLP(targetTier, targetDivision);
    const lpDifference = targetLP - currentLP;
    
    const basePrice = 50; // Base price per 100 LP
    return Math.max(basePrice, Math.round((lpDifference / 100) * basePrice));
  };

  const getCurrentRankName = () => {
    if (!currentTier || !currentDivision) return "";
    const tier = tiers.find(t => t.id === currentTier);
    if (!tier) return "";
    return currentDivision ? `${tier.name} ${currentDivision}` : tier.name;
  };

  const getTargetRankName = () => {
    if (!targetTier || !targetDivision) return "";
    const tier = tiers.find(t => t.id === targetTier);
    if (!tier) return "";
    return targetDivision ? `${tier.name} ${targetDivision}` : tier.name;
  };

  const handleContinue = () => {
    if (selectedService && currentTier && currentDivision && targetTier && targetDivision) {
      const currentRankId = `${currentTier}-${currentDivision}`;
      const targetRankId = `${targetTier}-${targetDivision}`;
      router.push(`/games/${resolvedParams.gameId}/services/${selectedService.id}/checkout?current=${currentRankId}&target=${targetRankId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/games">
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
                {gameData.name} Servisleri
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
        {/* Game Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="relative max-w-md mx-auto mb-6">
            <div className="relative rounded-2xl overflow-hidden shadow-lg">
              <img 
                src={gameData.id === "league-of-legends" ? "/images/LoL.jpeg" : "/images/Valorant.jpeg"}
                alt={gameData.name}
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                <div className="text-center text-white">
                  <span className="text-4xl mb-2 block">{gameData.icon}</span>
                  <h2 className="text-3xl font-bold">{gameData.name}</h2>
                </div>
              </div>
            </div>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {gameData.name} için hangi boost servisini tercih ediyorsunuz?
          </p>
        </motion.div>

        {/* Service Selection - Minimal Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Boost Servisi Seçin</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="relative"
              >
                {service.popular && (
                  <div className="absolute -top-2 -right-2 z-10">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                      <Star className="h-3 w-3" />
                      <span>Popüler</span>
                    </div>
                  </div>
                )}
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedService(service)}
                  className={`w-full h-48 rounded-xl border-2 transition-all duration-200 overflow-hidden relative ${
                    selectedService?.id === service.id
                      ? `border-blue-500 shadow-lg`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {/* Background Image */}
                  <div className="absolute inset-0">
                    <img 
                      src={service.image} 
                      alt={service.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t ${service.gradient} opacity-70`}></div>
                  
                  {/* Content */}
                  <div className="relative z-10 h-full flex flex-col justify-between p-4 text-white">
                    {/* Top Section */}
                    <div className="flex justify-between items-start">
                      <div className={`w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center`}>
                        <service.icon className="h-4 w-4 text-white" />
                      </div>
                      {service.popular && (
                        <div className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                          <Star className="h-3 w-3" />
                          <span>Popüler</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Bottom Section */}
                    <div className="text-center">
                      <h4 className="font-bold text-white text-sm mb-1">{service.name}</h4>
                      <p className="text-xs text-white/90 mb-2">{service.estimatedTime}</p>
                      <p className="text-xs font-medium text-white">{service.price}</p>
                    </div>
                  </div>
                  
                  {selectedService?.id === service.id && (
                    <div className="absolute top-2 right-2 z-20">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  )}
                </motion.button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Rank Selection */}
        {selectedService && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-lg max-w-7xl mx-auto"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Rank Seçimi</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Current Rank */}
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-gray-900">Mevcut Rankınız</h4>
                
                {/* Current Tier Selection */}
                <div>
                  <h5 className="text-md font-medium text-gray-700 mb-3">Tier Seçin</h5>
                  <div className="grid grid-cols-3 gap-2">
                    {tiers.map((tier) => (
                      <motion.button
                        key={tier.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setCurrentTier(tier.id);
                          setCurrentDivision(""); // Reset division when tier changes
                        }}
                        className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                          currentTier === tier.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-center">
                          <span className="text-2xl">{tier.icon}</span>
                          <p className="text-sm font-medium text-gray-900 mt-1">{tier.name}</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Current Division Selection */}
                {currentTier && (
                  <div>
                    <h5 className="text-md font-medium text-gray-700 mb-3">Division Seçin</h5>
                    <div className="grid grid-cols-4 gap-2">
                      {tiers.find(t => t.id === currentTier)?.divisions.map((division) => (
                        <motion.button
                          key={division}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setCurrentDivision(division)}
                          className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                            currentDivision === division
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-center">
                            <p className="text-lg font-bold text-gray-900">{division || "N/A"}</p>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Target Rank */}
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-gray-900">Hedef Rankınız</h4>
                
                {/* Target Tier Selection */}
                <div>
                  <h5 className="text-md font-medium text-gray-700 mb-3">Tier Seçin</h5>
                  <div className="grid grid-cols-3 gap-2">
                    {tiers.map((tier) => {
                      const currentLP = getRankLP(currentTier, currentDivision);
                      const tierLP = getRankLP(tier.id, tier.divisions[0]);
                      const isDisabled = currentTier && tierLP <= currentLP;
                      
                      return (
                        <motion.button
                          key={tier.id}
                          whileHover={{ scale: isDisabled ? 1 : 1.05 }}
                          whileTap={{ scale: isDisabled ? 1 : 0.95 }}
                          onClick={() => {
                            if (!isDisabled) {
                              setTargetTier(tier.id);
                              setTargetDivision(""); // Reset division when tier changes
                            }
                          }}
                          disabled={isDisabled}
                          className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                            targetTier === tier.id
                              ? 'border-green-500 bg-green-50'
                              : isDisabled
                              ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-center">
                            <span className="text-2xl">{tier.icon}</span>
                            <p className="text-sm font-medium text-gray-900 mt-1">{tier.name}</p>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Target Division Selection */}
                {targetTier && (
                  <div>
                    <h5 className="text-md font-medium text-gray-700 mb-3">Division Seçin</h5>
                    <div className="grid grid-cols-4 gap-2">
                      {tiers.find(t => t.id === targetTier)?.divisions.map((division) => {
                        const currentLP = getRankLP(currentTier, currentDivision);
                        const divisionLP = getRankLP(targetTier, division);
                        const isDisabled = currentTier && divisionLP <= currentLP;
                        
                        return (
                          <motion.button
                            key={division}
                            whileHover={{ scale: isDisabled ? 1 : 1.05 }}
                            whileTap={{ scale: isDisabled ? 1 : 0.95 }}
                            onClick={() => {
                              if (!isDisabled) {
                                setTargetDivision(division);
                              }
                            }}
                            disabled={isDisabled}
                            className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                              targetDivision === division
                                ? 'border-green-500 bg-green-50'
                                : isDisabled
                                ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="text-center">
                              <p className="text-lg font-bold text-gray-900">{division || "N/A"}</p>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Price Summary */}
            {currentTier && currentDivision && targetTier && targetDivision && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mt-8"
              >
                <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl p-6 text-white text-center">
                  <h4 className="text-xl font-bold mb-4">Boost Özeti</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-green-100 text-sm">Servis</p>
                      <p className="font-semibold">{selectedService.name}</p>
                    </div>
                    <div>
                      <p className="text-blue-100 text-sm">Mevcut Rank</p>
                      <p className="font-semibold">{getCurrentRankName()}</p>
                    </div>
                    <div>
                      <p className="text-blue-100 text-sm">Hedef Rank</p>
                      <p className="font-semibold">{getTargetRankName()}</p>
                    </div>
                  </div>
                  <div className="text-3xl font-bold mb-4">
                    ₺{calculatePrice()}
                  </div>
                  <p className="text-green-100 mb-4">
                    Tahmini süre: {selectedService.estimatedTime}
                  </p>
                  <Button 
                    onClick={handleContinue}
                    className="bg-white text-green-600 hover:bg-gray-100 text-lg px-8 py-3"
                  >
                    Devam Et
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Why Choose Us */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-16 bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-lg"
        >
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Neden AtlasBoost Tercih Edilmeli? 🏆
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                icon: Shield,
                title: "100% Güvenli",
                description: "Hesabınız tamamen güvende",
                color: "text-green-600"
              },
              {
                icon: Clock,
                title: "Hızlı Teslimat",
                description: "24-48 saat içinde",
                color: "text-blue-600"
              },
              {
                icon: Trophy,
                title: "Garantili",
                description: "Sonuç garantisi",
                color: "text-purple-600"
              },
              {
                icon: Star,
                title: "Profesyonel",
                description: "En iyi oyuncular",
                color: "text-orange-600"
              }
            ].map((feature, index) => (
              <div key={feature.title} className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-1">{feature.title}</h4>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
