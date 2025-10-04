"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  Home,
  Trophy,
  Clock,
  Shield,
  Star
} from "lucide-react";
import Link from "next/link";

export default function SuccessPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth/signin");
    }
  }, [session, status, router]);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      // Fetch session details from Stripe
      fetch(`/api/checkout-session?session_id=${sessionId}`)
        .then(res => res.json())
        .then(data => {
          setSessionData(data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching session:', error);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-600">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center"
              >
                <span className="text-white font-bold text-lg">A</span>
              </motion.div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                AtlasBoost
              </h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
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
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-8"
          >
            <CheckCircle className="h-12 w-12 text-white" />
          </motion.div>

          {/* Success Message */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Ödeme Başarılı! 🎉
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Boost siparişiniz alındı ve işleme alınacak.
          </p>

          {/* Order Details */}
          {sessionData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-lg mb-8 text-left"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Sipariş Detayları</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                  <span className="text-gray-600">Oyun</span>
                  <span className="font-semibold text-gray-900">{sessionData.metadata?.gameName}</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                  <span className="text-gray-600">Servis</span>
                  <span className="font-semibold text-gray-900">{sessionData.metadata?.serviceName}</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                  <span className="text-gray-600">Boost</span>
                  <span className="font-semibold text-gray-900">
                    {sessionData.metadata?.currentRank} → {sessionData.metadata?.targetRank}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl">
                  <span className="text-gray-600">Tutar</span>
                  <span className="font-bold text-green-600">₺{(sessionData.amount_total / 100).toFixed(2)}</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Next Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-lg mb-8"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-6">Sıradaki Adımlar</h3>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Sipariş Onayı</h4>
                  <p className="text-sm text-gray-600">Siparişiniz 1-2 saat içinde onaylanacak</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Güvenlik Kontrolü</h4>
                  <p className="text-sm text-gray-600">Hesap bilgileriniz güvenlik kontrolünden geçecek</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Trophy className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Boost Başlangıcı</h4>
                  <p className="text-sm text-gray-600">Profesyonel oyuncumuz boost'a başlayacak</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/dashboard">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white text-lg px-8 py-4 h-auto"
              >
                <Trophy className="mr-2 h-5 w-5" />
                Dashboard'a Git
              </Button>
            </Link>
            
            <Link href="/">
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-4 h-auto border-2"
              >
                <Home className="mr-2 h-5 w-5" />
                Ana Sayfa
              </Button>
            </Link>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.0 }}
            className="mt-12 text-center"
          >
            <p className="text-gray-600 mb-2">
              Sorularınız için bizimle iletişime geçin:
            </p>
            <p className="text-blue-600 font-medium">
              support@atlasboost.com
            </p>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
