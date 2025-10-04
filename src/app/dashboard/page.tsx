"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Settings, 
  Bell, 
  Search, 
  Plus, 
  TrendingUp, 
  Users, 
  BarChart3,
  LogOut,
  Menu
} from "lucide-react";
import { OptimizedImage, CardImage } from "@/components/ui/image";
import { ImageGallery } from "@/components/ui/image-gallery";

export default function Dashboard() {
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

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

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
                Dashboard
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </Button>
              
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
                  <p className="text-xs text-gray-500">{session.user?.email}</p>
                </div>
              </div>
              
              <Button onClick={handleSignOut} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Çıkış
              </Button>
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
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Hoş geldiniz, {session.user?.name?.split(" ")[0] || "Kullanıcı"}! 👋
          </h2>
          <p className="text-gray-600">
            Dashboard'unuza hoş geldiniz. İşte güncel durumunuz.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: "Toplam Kullanıcı",
              value: "1,234",
              change: "+12%",
              icon: Users,
              color: "from-blue-500 to-blue-600",
            },
            {
              title: "Aktif Projeler",
              value: "56",
              change: "+8%",
              icon: BarChart3,
              color: "from-green-500 to-green-600",
            },
            {
              title: "Bu Ay Gelir",
              value: "₺45,678",
              change: "+23%",
              icon: TrendingUp,
              color: "from-purple-500 to-purple-600",
            },
            {
              title: "Tamamlanan Görevler",
              value: "89",
              change: "+15%",
              icon: Plus,
              color: "from-orange-500 to-orange-600",
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  {stat.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-gray-600 text-sm">{stat.title}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg mb-8"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4">Hızlı İşlemler</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "Yeni Proje", icon: Plus, color: "bg-blue-500" },
              { title: "Rapor Oluştur", icon: BarChart3, color: "bg-green-500" },
              { title: "Kullanıcı Ekle", icon: Users, color: "bg-purple-500" },
              { title: "Ayarlar", icon: Settings, color: "bg-gray-500" },
            ].map((action, index) => (
              <motion.button
                key={action.title}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`${action.color} text-white p-4 rounded-xl hover:opacity-90 transition-all duration-200 flex flex-col items-center space-y-2`}
              >
                <action.icon className="h-6 w-6" />
                <span className="text-sm font-medium">{action.title}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg mb-8"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4">Dashboard Önizleme</h3>
          <div className="relative">
            <CardImage 
              src="/images/dashboard/dashboard-preview.svg"
              alt="Dashboard Preview"
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
        </motion.div>

        {/* Image Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg mb-8"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4">Proje Galerisi</h3>
          <ImageGallery
            images={[
              {
                src: "/images/features/feature-1.svg",
                alt: "Güvenlik Özelliği",
                title: "Güvenli Authentication",
                description: "NextAuth.js ile güvenli giriş sistemi"
              },
              {
                src: "/images/features/feature-2.svg",
                alt: "Performans Özelliği",
                title: "Hızlı Performans",
                description: "Next.js 15 ile optimize edilmiş hızlı yükleme"
              },
              {
                src: "/images/features/feature-3.svg",
                alt: "Google OAuth",
                title: "Google OAuth",
                description: "Google hesabınızla tek tıkla giriş"
              },
              {
                src: "/images/dashboard/dashboard-preview.svg",
                alt: "Dashboard Önizleme",
                title: "Modern Dashboard",
                description: "Kullanıcı dostu dashboard arayüzü"
              }
            ]}
          />
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4">Son Aktiviteler</h3>
          <div className="space-y-4">
            {[
              { action: "Yeni kullanıcı kaydı", time: "2 dakika önce", type: "success" },
              { action: "Proje güncellendi", time: "15 dakika önce", type: "info" },
              { action: "Rapor oluşturuldu", time: "1 saat önce", type: "success" },
              { action: "Sistem yedeklendi", time: "3 saat önce", type: "info" },
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === "success" ? "bg-green-500" : "bg-blue-500"
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
