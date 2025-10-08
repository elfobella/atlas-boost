// Boost fiyatlandırma sistemi

export interface RankInfo {
  name: string;
  tier: number; // 1-8 (Iron=1, Bronze=2, Silver=3, Gold=4, Platinum=5, Diamond=6, Master=7, Challenger=8)
  division?: number; // 1-4 (I=1, II=2, III=3, IV=4)
}

// League of Legends rank bilgileri
const LOL_RANKS: Record<string, RankInfo> = {
  'Iron IV': { name: 'Iron IV', tier: 1, division: 4 },
  'Iron III': { name: 'Iron III', tier: 1, division: 3 },
  'Iron II': { name: 'Iron II', tier: 1, division: 2 },
  'Iron I': { name: 'Iron I', tier: 1, division: 1 },
  
  'Bronze IV': { name: 'Bronze IV', tier: 2, division: 4 },
  'Bronze III': { name: 'Bronze III', tier: 2, division: 3 },
  'Bronze II': { name: 'Bronze II', tier: 2, division: 2 },
  'Bronze I': { name: 'Bronze I', tier: 2, division: 1 },
  
  'Silver IV': { name: 'Silver IV', tier: 3, division: 4 },
  'Silver III': { name: 'Silver III', tier: 3, division: 3 },
  'Silver II': { name: 'Silver II', tier: 3, division: 2 },
  'Silver I': { name: 'Silver I', tier: 3, division: 1 },
  
  'Gold IV': { name: 'Gold IV', tier: 4, division: 4 },
  'Gold III': { name: 'Gold III', tier: 4, division: 3 },
  'Gold II': { name: 'Gold II', tier: 4, division: 2 },
  'Gold I': { name: 'Gold I', tier: 4, division: 1 },
  
  'Platinum IV': { name: 'Platinum IV', tier: 5, division: 4 },
  'Platinum III': { name: 'Platinum III', tier: 5, division: 3 },
  'Platinum II': { name: 'Platinum II', tier: 5, division: 2 },
  'Platinum I': { name: 'Platinum I', tier: 5, division: 1 },
  
  'Diamond IV': { name: 'Diamond IV', tier: 6, division: 4 },
  'Diamond III': { name: 'Diamond III', tier: 6, division: 3 },
  'Diamond II': { name: 'Diamond II', tier: 6, division: 2 },
  'Diamond I': { name: 'Diamond I', tier: 6, division: 1 },
  
  'Master': { name: 'Master', tier: 7 },
  'Grandmaster': { name: 'Grandmaster', tier: 8 },
  'Challenger': { name: 'Challenger', tier: 9 }
}

// Valorant rank bilgileri
const VALORANT_RANKS: Record<string, RankInfo> = {
  'Iron 1': { name: 'Iron 1', tier: 1, division: 1 },
  'Iron 2': { name: 'Iron 2', tier: 1, division: 2 },
  'Iron 3': { name: 'Iron 3', tier: 1, division: 3 },
  
  'Bronze 1': { name: 'Bronze 1', tier: 2, division: 1 },
  'Bronze 2': { name: 'Bronze 2', tier: 2, division: 2 },
  'Bronze 3': { name: 'Bronze 3', tier: 2, division: 3 },
  
  'Silver 1': { name: 'Silver 1', tier: 3, division: 1 },
  'Silver 2': { name: 'Silver 2', tier: 3, division: 2 },
  'Silver 3': { name: 'Silver 3', tier: 3, division: 3 },
  
  'Gold 1': { name: 'Gold 1', tier: 4, division: 1 },
  'Gold 2': { name: 'Gold 2', tier: 4, division: 2 },
  'Gold 3': { name: 'Gold 3', tier: 4, division: 3 },
  
  'Platinum 1': { name: 'Platinum 1', tier: 5, division: 1 },
  'Platinum 2': { name: 'Platinum 2', tier: 5, division: 2 },
  'Platinum 3': { name: 'Platinum 3', tier: 5, division: 3 },
  
  'Diamond 1': { name: 'Diamond 1', tier: 6, division: 1 },
  'Diamond 2': { name: 'Diamond 2', tier: 6, division: 2 },
  'Diamond 3': { name: 'Diamond 3', tier: 6, division: 3 },
  
  'Ascendant 1': { name: 'Ascendant 1', tier: 7, division: 1 },
  'Ascendant 2': { name: 'Ascendant 2', tier: 7, division: 2 },
  'Ascendant 3': { name: 'Ascendant 3', tier: 7, division: 3 },
  
  'Immortal 1': { name: 'Immortal 1', tier: 8, division: 1 },
  'Immortal 2': { name: 'Immortal 2', tier: 8, division: 2 },
  'Immortal 3': { name: 'Immortal 3', tier: 8, division: 3 },
  
  'Radiant': { name: 'Radiant', tier: 9 }
}

// Rank'ları karşılaştır ve tier farkını hesapla
function getRankDifference(game: string, currentRank: string, targetRank: string): number {
  const ranks = game === 'lol' ? LOL_RANKS : VALORANT_RANKS
  
  const current = ranks[currentRank]
  const target = ranks[targetRank]
  
  if (!current || !target) {
    return 0
  }
  
  // Tier farkı hesapla
  let tierDiff = target.tier - current.tier
  
  // Aynı tier'daysa division farkını hesapla
  if (tierDiff === 0 && current.division && target.division) {
    tierDiff = (current.division - target.division) * 0.25 // Her division 0.25 tier farkı
  }
  
  return tierDiff
}

// Fiyat hesaplama fonksiyonu
export function calculateBoostPrice(
  game: string,
  currentRank: string,
  targetRank: string,
  currentDivision?: string,
  targetDivision?: string
): number {
  // Rank'ları birleştir (division varsa)
  const fullCurrentRank = currentDivision ? `${currentRank} ${currentDivision}` : currentRank
  const fullTargetRank = targetDivision ? `${targetRank} ${targetDivision}` : targetRank
  
  const rankDiff = getRankDifference(game, fullCurrentRank, fullTargetRank)
  
  if (rankDiff <= 0) {
    return 0 // Geçersiz rank aralığı
  }
  
  // Base fiyatlar (USD)
  const basePrices = {
    lol: {
      base: 15,      // Minimum fiyat (USD)
      perTier: 8,    // Her tier için ek fiyat (USD)
      multiplier: 1.2 // Yüksek tier'lar için çarpan
    },
    valorant: {
      base: 12,
      perTier: 6,
      multiplier: 1.15
    }
  }
  
  const prices = basePrices[game as keyof typeof basePrices]
  if (!prices) return 0
  
  let price = prices.base + (rankDiff * prices.perTier)
  
  // Yüksek tier'lar için çarpan uygula
  const ranks = game === 'lol' ? LOL_RANKS : VALORANT_RANKS
  const current = ranks[fullCurrentRank]
  
  if (current && current.tier >= 6) { // Diamond+ için çarpan
    price *= prices.multiplier
  }
  
  // Minimum fiyat kontrolü
  price = Math.max(price, prices.base)
  
  // Yuvarla
  return Math.round(price)
}

// Currency conversion
export function convertPrice(priceUSD: number, currency: 'USD' | 'TRY'): number {
  const exchangeRates = {
    USD: 1,
    TRY: 35 // 1 USD = 35 TRY (güncel kur)
  }
  
  return Math.round(priceUSD * exchangeRates[currency])
}

// Fiyat hesaplama (currency ile)
export function calculateBoostPriceWithCurrency(
  game: string,
  currentRank: string,
  targetRank: string,
  currentDivision?: string,
  targetDivision?: string,
  currency: 'USD' | 'TRY' = 'USD'
): number {
  const priceUSD = calculateBoostPrice(game, currentRank, targetRank, currentDivision, targetDivision)
  return convertPrice(priceUSD, currency)
}

// Tahmini süre hesaplama (saat cinsinden)
export function calculateEstimatedHours(
  game: string,
  currentRank: string,
  targetRank: string,
  currentDivision?: string,
  targetDivision?: string
): number {
  const rankDiff = getRankDifference(game, currentRank, targetRank)
  
  if (rankDiff <= 0) return 0
  
  // Base süreler (saat)
  const baseTimes = {
    lol: {
      base: 2,        // Minimum süre
      perTier: 3,     // Her tier için ek süre
      multiplier: 1.5 // Yüksek tier'lar için çarpan
    },
    valorant: {
      base: 1.5,
      perTier: 2.5,
      multiplier: 1.3
    }
  }
  
  const times = baseTimes[game as keyof typeof baseTimes]
  if (!times) return 0
  
  let hours = times.base + (rankDiff * times.perTier)
  
  // Yüksek tier'lar için çarpan uygula
  const ranks = game === 'lol' ? LOL_RANKS : VALORANT_RANKS
  const current = ranks[currentRank]
  
  if (current && current.tier >= 6) {
    hours *= times.multiplier
  }
  
  return Math.round(hours * 10) / 10 // 1 ondalık basamak
}

// Desteklenen rank'ları getir
export function getSupportedRanks(game: string): string[] {
  const ranks = game === 'lol' ? LOL_RANKS : VALORANT_RANKS
  return Object.keys(ranks)
}

// Rank bilgilerini getir
export function getRankInfo(game: string, rank: string): RankInfo | null {
  const ranks = game === 'lol' ? LOL_RANKS : VALORANT_RANKS
  return ranks[rank] || null
}
