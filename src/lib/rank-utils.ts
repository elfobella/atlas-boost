// Rank validation ve hesaplama utility'leri

export interface RankInfo {
  rank: string;
  division?: string;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  price?: number;
  estimatedTime?: string;
  suggestions?: RankSuggestion[];
}

export interface RankSuggestion {
  rank: string;
  division?: string | number;
  type: 'SAME_RANK_UP' | 'NEXT_RANK' | 'MULTI_RANK_UP';
  price: number;
  estimatedTime: string;
  priority: number;
}

// League of Legends rank konfigürasyonu
const LoL_RANKS = {
  'Iron': { value: 1, divisions: ['IV', 'III', 'II', 'I'] },
  'Bronze': { value: 2, divisions: ['IV', 'III', 'II', 'I'] },
  'Silver': { value: 3, divisions: ['IV', 'III', 'II', 'I'] },
  'Gold': { value: 4, divisions: ['IV', 'III', 'II', 'I'] },
  'Platinum': { value: 5, divisions: ['IV', 'III', 'II', 'I'] },
  'Diamond': { value: 6, divisions: ['IV', 'III', 'II', 'I'] },
  'Master': { value: 7, divisions: [] },
  'Grandmaster': { value: 8, divisions: [] },
  'Challenger': { value: 9, divisions: [] }
};

// Valorant rank konfigürasyonu
const Valorant_RANKS = {
  'Iron': { value: 1, divisions: [1, 2, 3] },
  'Bronze': { value: 2, divisions: [1, 2, 3] },
  'Silver': { value: 3, divisions: [1, 2, 3] },
  'Gold': { value: 4, divisions: [1, 2, 3] },
  'Platinum': { value: 5, divisions: [1, 2, 3] },
  'Diamond': { value: 6, divisions: [1, 2, 3] },
  'Ascendant': { value: 7, divisions: [1, 2, 3] },
  'Immortal': { value: 8, divisions: [1, 2, 3] },
  'Radiant': { value: 9, divisions: [] }
};

// Division değerleri
const LoL_DIVISIONS = {
  'IV': 4,  // En düşük
  'III': 3,
  'II': 2,
  'I': 1    // En yüksek
};

const Valorant_DIVISIONS = {
  1: 1,  // En düşük
  2: 2,  // Orta
  3: 3   // En yüksek
};

// Rank değeri hesaplama
export function calculateRankValue(game: 'lol' | 'valorant', rank: string, division?: string | number): number {
  const ranks = game === 'lol' ? LoL_RANKS : Valorant_RANKS;
  const rankInfo = ranks[rank as keyof typeof ranks];
  
  if (!rankInfo) return 0;
  
  const rankValue = rankInfo.value;
  
  if (division !== undefined) {
    if (game === 'lol') {
      const divisionValue = LoL_DIVISIONS[division as keyof typeof LoL_DIVISIONS];
      return rankValue * 10 + (5 - divisionValue); // Daha yüksek division = daha yüksek değer
    } else {
      const divisionValue = Valorant_DIVISIONS[division as keyof typeof Valorant_DIVISIONS];
      return rankValue * 10 + divisionValue;
    }
  }
  
  return rankValue * 10; // Division olmayan ranklar
}

// Rank validation
export function validateRankBoost(
  game: 'lol' | 'valorant',
  currentRank: string,
  currentDivision: string | number | undefined,
  targetRank: string,
  targetDivision: string | number | undefined
): ValidationResult {
  const currentValue = calculateRankValue(game, currentRank, currentDivision);
  const targetValue = calculateRankValue(game, targetRank, targetDivision);
  
  // Aynı rank ve division kontrolü
  if (currentValue === targetValue) {
    return { valid: false, error: 'SAME_RANK_DIVISION' };
  }
  
  // Aşağı doğru hareket kontrolü
  if (currentValue > targetValue) {
    return { valid: false, error: 'DOWNWARD_MOVEMENT' };
  }
  
  // Çok uzak atlama kontrolü (maksimum 4 rank)
  const rankDifference = Math.floor(targetValue / 10) - Math.floor(currentValue / 10);
  if (rankDifference > 4) {
    return { valid: false, error: 'TOO_FAR_JUMP' };
  }
  
  // Geçerli ise fiyat ve süre hesapla
  const price = calculateBoostPrice(game, currentRank, currentDivision, targetRank, targetDivision);
  const estimatedTime = calculateEstimatedTime(game, currentValue, targetValue);
  
  return { 
    valid: true, 
    price, 
    estimatedTime 
  };
}

// Fiyat hesaplama
export function calculateBoostPrice(
  game: 'lol' | 'valorant',
  currentRank: string,
  currentDivision: string | number | undefined,
  targetRank: string,
  targetDivision: string | number | undefined
): number {
  const currentValue = calculateRankValue(game, currentRank, currentDivision);
  const targetValue = calculateRankValue(game, targetRank, targetDivision);
  const difference = targetValue - currentValue;
  
  // Base price per division jump
  const basePrice = 15; // USD
  const priceMultiplier = 1.2; // %20 artış her rank için
  
  const rankJumps = Math.floor(difference / 10);
  const divisionJumps = difference % 10;
  
  let totalPrice = basePrice;
  
  // Rank jump fiyatı
  totalPrice += rankJumps * basePrice * priceMultiplier;
  
  // Division jump fiyatı
  totalPrice += divisionJumps * (basePrice * 0.3);
  
  return Math.round(totalPrice);
}

// Süre hesaplama
export function calculateEstimatedTime(
  game: 'lol' | 'valorant',
  currentValue: number,
  targetValue: number
): string {
  const difference = targetValue - currentValue;
  const rankJumps = Math.floor(difference / 10);
  const divisionJumps = difference % 10;
  
  // Base time: 1-2 gün per division jump
  const baseTime = 1.5;
  const rankTimeMultiplier = 1.5;
  
  const estimatedDays = baseTime + (rankJumps * rankTimeMultiplier) + (divisionJumps * 0.5);
  
  if (estimatedDays <= 2) {
    return "1-2 gün";
  } else if (estimatedDays <= 4) {
    return "2-4 gün";
  } else if (estimatedDays <= 6) {
    return "4-6 gün";
  } else if (estimatedDays <= 8) {
    return "6-8 gün";
  } else if (estimatedDays <= 12) {
    return "8-12 gün";
  } else {
    return "12+ gün";
  }
}

// Akıllı öneriler
export function getSuggestedTargets(
  game: 'lol' | 'valorant',
  currentRank: string,
  currentDivision: string | number | undefined
): RankSuggestion[] {
  const suggestions: RankSuggestion[] = [];
  // const ranks = game === 'lol' ? LoL_RANKS : Valorant_RANKS; // Unused variable
  const currentValue = calculateRankValue(game, currentRank, currentDivision);
  
  // Aynı rank içi yukarı divisions
  if (currentDivision !== undefined) {
    const nextDivision = getNextDivision(game, currentRank, currentDivision);
    if (nextDivision) {
      const price = calculateBoostPrice(game, currentRank, currentDivision, currentRank, nextDivision);
      const estimatedTime = calculateEstimatedTime(game, currentValue, calculateRankValue(game, currentRank, nextDivision));
      
      suggestions.push({
        rank: currentRank,
        division: nextDivision,
        type: 'SAME_RANK_UP',
        price,
        estimatedTime,
        priority: 1
      });
    }
  }
  
  // Bir üst rank
  const nextRank = getNextRank(game, currentRank);
  if (nextRank) {
    const firstDivision = getFirstDivision(game, nextRank);
    if (firstDivision !== null) {
      const price = calculateBoostPrice(game, currentRank, currentDivision, nextRank, firstDivision);
      const estimatedTime = calculateEstimatedTime(game, currentValue, calculateRankValue(game, nextRank, firstDivision));
    
      suggestions.push({
        rank: nextRank,
        division: firstDivision,
        type: 'NEXT_RANK',
        price,
        estimatedTime,
        priority: 2
      });
    }
  }
  
  return suggestions.sort((a, b) => a.priority - b.priority);
}

// Yardımcı fonksiyonlar
function getNextDivision(game: 'lol' | 'valorant', rank: string, division: string | number): string | number | null {
  const rankInfo = game === 'lol' ? LoL_RANKS[rank as keyof typeof LoL_RANKS] : Valorant_RANKS[rank as keyof typeof Valorant_RANKS];
  
  if (!rankInfo || !rankInfo.divisions.length) return null;
  
  const divisions = rankInfo.divisions;
  const currentIndex = divisions.indexOf(division as never);
  
  if (currentIndex > 0) {
    return divisions[currentIndex - 1]; // Bir üst division
  }
  
  return null;
}

function getNextRank(game: 'lol' | 'valorant', currentRank: string): string | null {
  const ranks = game === 'lol' ? LoL_RANKS : Valorant_RANKS;
  const rankEntries = Object.entries(ranks);
  const currentIndex = rankEntries.findIndex(([rank]) => rank === currentRank);
  
  if (currentIndex < rankEntries.length - 1) {
    return rankEntries[currentIndex + 1][0];
  }
  
  return null;
}

function getFirstDivision(game: 'lol' | 'valorant', rank: string): string | number | null {
  const rankInfo = game === 'lol' ? LoL_RANKS[rank as keyof typeof LoL_RANKS] : Valorant_RANKS[rank as keyof typeof Valorant_RANKS];
  
  if (!rankInfo || !rankInfo.divisions.length) return null;
  
  return rankInfo.divisions[rankInfo.divisions.length - 1]; // En düşük division
}

// Mevcut ranktan daha yüksek rankları getir
export function getAvailableRanks(game: 'lol' | 'valorant', currentRank: string): string[] {
  const ranks = game === 'lol' ? LoL_RANKS : Valorant_RANKS;
  const rankEntries = Object.entries(ranks);
  const currentIndex = rankEntries.findIndex(([rank]) => rank === currentRank);
  
  return rankEntries
    .filter((_, index) => index >= currentIndex)
    .map(([rank]) => rank);
}

// Belirli rank için divisionları getir
export function getDivisions(game: 'lol' | 'valorant', rank: string): (string | number)[] {
  const ranks = game === 'lol' ? LoL_RANKS : Valorant_RANKS;
  const rankInfo = ranks[rank as keyof typeof ranks];
  
  return rankInfo?.divisions || [];
}

// Hata mesajları
export const ERROR_MESSAGES = {
  'SAME_RANK_DIVISION': {
    tr: '🎯 Zaten bu ranktasınız! Daha yüksek bir hedef seçin.',
    en: '🎯 You are already at this rank! Choose a higher target.'
  },
  'DOWNWARD_MOVEMENT': {
    tr: '⬇️ Rank düşürme hizmeti sunmuyoruz. Yukarı doğru boost alın!',
    en: '⬇️ We don\'t offer rank down services. Boost up instead!'
  },
  'TOO_FAR_JUMP': {
    tr: '🚀 Çok büyük bir sıçrama! Önce ara hedefler belirleyin.',
    en: '🚀 That\'s too big a jump! Set intermediate goals first.'
  },
  'INVALID_RANK': {
    tr: '❌ Geçersiz rank formatı',
    en: '❌ Invalid rank format'
  },
  'INVALID_DIVISION': {
    tr: '❌ Geçersiz division formatı',
    en: '❌ Invalid division format'
  }
};

// Game bilgileri
export const GAME_INFO = {
  lol: {
    name: 'League of Legends',
    icon: '🎮',
    color: 'blue'
  },
  valorant: {
    name: 'Valorant',
    icon: '🎯',
    color: 'red'
  }
};
