/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { prisma } from '@/lib/prisma'

export interface BoosterCandidate {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  rating: number;
  completedOrders: number;
  maxOrders: number;
  availableSlots: number;
  lastAssignedAt: Date | null;
  averageCompletionTime?: number;
}

export interface OrderInfo {
  id: string;
  game: string;
  currentRank: string;
  targetRank: string;
  price: number;
}

// Booster atama algoritması
export async function selectOptimalBooster(order: OrderInfo): Promise<BoosterCandidate | null> {
  try {
    // Müsait booster'ları getir
    const availableBoosters = await prisma.user.findMany({
      where: {
        role: 'BOOSTER',
        isAvailable: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        rating: true,
        completedOrders: true,
        maxOrders: true,
        updatedAt: true,
        boostJobs: {
          where: {
            orderStatus: {
              in: ['ASSIGNED', 'IN_PROGRESS']
            }
          },
          select: {
            id: true,
            startedAt: true,
            completedAt: true,
            actualHours: true
          }
        }
      }
    })

    if (availableBoosters.length === 0) {
      return null
    }

    // Her booster için bilgileri hazırla
    const candidates: BoosterCandidate[] = []

    for (const booster of availableBoosters) {
      // Mevcut aktif sipariş sayısını hesapla
      const activeOrdersCount = booster.boostJobs.length
      
      // Maksimum sipariş limitini kontrol et
      if (activeOrdersCount >= booster.maxOrders) {
        continue // Bu booster'a daha fazla sipariş atanamaz
      }

      // Ortalama tamamlanma süresini hesapla
      const completedJobs = booster.boostJobs.filter(job => job.completedAt && job.actualHours)
      const averageCompletionTime = completedJobs.length > 0 
        ? completedJobs.reduce((sum, job) => sum + (job.actualHours || 0), 0) / completedJobs.length
        : 24 // Varsayılan 24 saat

      // Son atama tarihini bul
      const lastAssignedAt = booster.boostJobs
        .filter(job => job.startedAt)
        .sort((a, b) => new Date(b.startedAt!).getTime() - new Date(a.startedAt!).getTime())[0]?.startedAt || null

      candidates.push({
        id: booster.id,
        name: booster.name,
        email: booster.email,
        image: booster.image,
        rating: booster.rating,
        completedOrders: booster.completedOrders,
        maxOrders: booster.maxOrders,
        availableSlots: booster.maxOrders - activeOrdersCount,
        lastAssignedAt: lastAssignedAt ? new Date(lastAssignedAt) : null,
        averageCompletionTime
      })
    }

    if (candidates.length === 0) {
      return null
    }

    // Performans skorunu hesapla ve en iyi booster'ı seç
    const scoredBoosters = candidates.map(booster => ({
      ...booster,
      score: calculatePerformanceScore(booster)
    }))

    // En yüksek skorlu booster'ı seç
    const selectedBooster = scoredBoosters.sort((a, b) => b.score - a.score)[0]

    return selectedBooster
  } catch (error) {
    console.error('Error selecting optimal booster:', error)
    return null
  }
}

// Performans skoru hesaplama (0-100 arası)
function calculatePerformanceScore(booster: BoosterCandidate): number {
  const {
    completedOrders,
    rating,
    averageCompletionTime = 24,
    lastAssignedAt,
    availableSlots
  } = booster

  // 1. Tamamlanan sipariş skoru (0-30 puan)
  const completionScore = Math.min(completedOrders * 2, 30)

  // 2. Rating skoru (0-25 puan)
  const ratingScore = rating * 5

  // 3. Hız skoru (0-20 puan) - daha hızlı tamamlayanlar daha yüksek puan
  const speedScore = Math.max(0, 20 - (averageCompletionTime - 12) * 0.5)

  // 4. Bekleme bonusu (0-15 puan) - en uzun süre bekleyenler öncelik
  const waitingBonus = calculateWaitingBonus(lastAssignedAt)

  // 5. Müsaitlik bonusu (0-10 puan) - daha fazla müsait slot olanlar
  const availabilityBonus = Math.min(availableSlots * 3, 10)

  const totalScore = completionScore + ratingScore + speedScore + waitingBonus + availabilityBonus

  return Math.round(totalScore * 100) / 100 // 2 ondalık basamak
}

// Bekleme bonusu hesaplama
function calculateWaitingBonus(lastAssignedAt: Date | null): number {
  if (!lastAssignedAt) {
    return 15 // Hiç atama yapılmamışsa maksimum bonus
  }

  const now = new Date()
  const hoursSinceLastAssignment = (now.getTime() - lastAssignedAt.getTime()) / (1000 * 60 * 60)

  // 24 saatten fazla bekleyenlere bonus
  if (hoursSinceLastAssignment >= 24) {
    return 15
  } else if (hoursSinceLastAssignment >= 12) {
    return 10
  } else if (hoursSinceLastAssignment >= 6) {
    return 5
  }

  return 0
}

// Booster uygunluğunu kontrol et
export async function isBoosterSuitable(
  boosterId: string, 
  order: OrderInfo
): Promise<boolean> {
  try {
    const booster = await prisma.user.findFirst({
      where: {
        id: boosterId,
        role: 'BOOSTER',
        isAvailable: true
      },
      select: {
        maxOrders: true,
        boostJobs: {
          where: {
            orderStatus: {
              in: ['ASSIGNED', 'IN_PROGRESS']
            }
          }
        }
      }
    })

    if (!booster) {
      return false
    }

    // Aktif sipariş sayısını kontrol et
    const activeOrdersCount = booster.boostJobs.length
    if (activeOrdersCount >= booster.maxOrders) {
      return false
    }

    // TODO: Oyun ve rank uygunluğu kontrolü eklenebilir
    // Şu an için tüm booster'lar tüm oyunlarda çalışabiliyor kabul ediyoruz

    return true
  } catch (error) {
    console.error('Error checking booster suitability:', error)
    return false
  }
}

// Müsait booster'ları listele
export async function getAvailableBoosters(game?: string): Promise<BoosterCandidate[]> {
  try {
    const whereClause: any = {
      role: 'BOOSTER',
      isAvailable: true
    }

    const boosters = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        rating: true,
        completedOrders: true,
        maxOrders: true,
        updatedAt: true,
        boostJobs: {
          where: {
            orderStatus: {
              in: ['ASSIGNED', 'IN_PROGRESS']
            }
          }
        }
      }
    })

    return boosters.map(booster => ({
      id: booster.id,
      name: booster.name,
      email: booster.email,
      image: booster.image,
      rating: booster.rating,
      completedOrders: booster.completedOrders,
      maxOrders: booster.maxOrders,
      availableSlots: booster.maxOrders - booster.boostJobs.length,
      lastAssignedAt: null, // Bu detay için ayrı sorgu gerekebilir
      averageCompletionTime: 24 // Varsayılan değer
    })).filter(booster => booster.availableSlots > 0)
  } catch (error) {
    console.error('Error fetching available boosters:', error)
    return []
  }
}
