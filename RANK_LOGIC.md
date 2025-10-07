# Rank Logic ve Validation Sistemi

## 📋 İçindekiler
- [Genel Kurallar](#genel-kurallar)
- [League of Legends Rank Logic](#league-of-legends-rank-logic)
- [Valorant Rank Logic](#valorant-rank-logic)
- [Validation Kuralları](#validation-kuralları)
- [Hata Mesajları](#hata-mesajları)
- [Örnek Senaryolar](#örnek-senaryolar)
- [API Endpoint Örnekleri](#api-endpoint-örnekleri)

---

## 🎯 Genel Kurallar

### Temel Prensipler
1. **Yukarı Doğru Hareket**: Müşteri sadece mevcut rankından daha yüksek ranklara boost alabilir
2. **Aynı Rank İçinde**: Aynı rank içinde yukarı doğru division değişimi mümkün
3. **Mantıklı Hedefler**: Hedef rank, mevcut ranktan mantıklı bir mesafede olmalı
4. **Maximum Jump**: Tek seferde maksimum 3-4 rank atlama önerilir

### Yasak Durumlar
- ❌ Aşağı doğru rank değişimi
- ❌ Aynı rank ve aynı division (değişiklik yok)
- ❌ Çok uzak rank atlamaları (Iron → Challenger gibi)
- ❌ Geçersiz rank kombinasyonları

---

## 🎮 League of Legends Rank Logic

### Rank Hiyerarşisi ve Sayısal Değerler

```javascript
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
```

### Division Logic
```javascript
const LoL_DIVISIONS = {
  'IV': 4,  // En düşük
  'III': 3,
  'II': 2,
  'I': 1    // En yüksek
};
```

### Validation Kuralları

#### ✅ Geçerli Durumlar
| Mevcut Rank | Geçerli Hedef Rankler | Açıklama |
|-------------|----------------------|----------|
| Iron IV | Iron III, Iron II, Iron I, Bronze IV+ | Aynı rank içi yukarı, üst rank |
| Bronze I | Silver IV+ | Bir üst ranka geçiş |
| Gold III | Gold II, Gold I, Platinum IV+ | Aynı rank içi yukarı, üst rank |
| Diamond I | Master | Master rankına geçiş |

#### ❌ Geçersiz Durumlar
| Mevcut Rank | Geçersiz Hedef | Sebep |
|-------------|----------------|-------|
| Gold III | Gold IV | Aşağı doğru hareket |
| Gold II | Gold II | Aynı konum |
| Silver I | Iron I | Aşağı doğru rank |
| Iron IV | Challenger | Çok uzak atlama |

### Rank Hesaplama Fonksiyonu
```javascript
function calculateRankValue(rank, division = null) {
  const rankValue = LoL_RANKS[rank].value;
  
  if (division) {
    const divisionValue = LoL_DIVISIONS[division];
    return rankValue * 10 + (5 - divisionValue); // Daha yüksek division = daha yüksek değer
  }
  
  return rankValue * 10; // Division olmayan ranklar (Master, GM, Challenger)
}

// Örnek: Gold III = 4 * 10 + (5 - 3) = 42
// Gold II = 4 * 10 + (5 - 2) = 43 (daha yüksek)
```

---

## 🎯 Valorant Rank Logic

### Rank Hiyerarşisi ve Sayısal Değerler

```javascript
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
```

### Division Logic
```javascript
const Valorant_DIVISIONS = {
  1: 1,  // En düşük
  2: 2,  // Orta
  3: 3   // En yüksek
};
```

### Validation Kuralları

#### ✅ Geçerli Durumlar
| Mevcut Rank | Geçerli Hedef Rankler | Açıklama |
|-------------|----------------------|----------|
| Iron 1 | Iron 2, Iron 3, Bronze 1+ | Aynı rank içi yukarı, üst rank |
| Bronze 3 | Silver 1+ | Bir üst ranka geçiş |
| Gold 2 | Gold 3, Platinum 1+ | Aynı rank içi yukarı, üst rank |
| Immortal 3 | Radiant | En üst ranka geçiş |

#### ❌ Geçersiz Durumlar
| Mevcut Rank | Geçersiz Hedef | Sebep |
|-------------|----------------|-------|
| Gold 2 | Gold 1 | Aşağı doğru hareket |
| Silver 3 | Silver 3 | Aynı konum |
| Platinum 1 | Iron 3 | Aşağı doğru rank |
| Iron 1 | Radiant | Çok uzak atlama |

### Rank Hesaplama Fonksiyonu
```javascript
function calculateRankValue(rank, division = null) {
  const rankValue = Valorant_RANKS[rank].value;
  
  if (division) {
    return rankValue * 10 + division; // Division 1-3 arası
  }
  
  return rankValue * 10; // Division olmayan ranklar (Radiant)
}

// Örnek: Gold 2 = 4 * 10 + 2 = 42
// Gold 3 = 4 * 10 + 3 = 43 (daha yüksek)
```

---

## 🔍 Validation Kuralları

### 1. **Temel Validation**
```javascript
function validateRankBoost(currentRank, currentDivision, targetRank, targetDivision) {
  const currentValue = calculateRankValue(currentRank, currentDivision);
  const targetValue = calculateRankValue(targetRank, targetDivision);
  
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
  
  return { valid: true };
}
```

### 2. **Akıllı Öneriler**
```javascript
function getSuggestedTargets(currentRank, currentDivision) {
  const suggestions = [];
  const currentValue = calculateRankValue(currentRank, currentDivision);
  
  // Aynı rank içi yukarı divisions
  if (currentDivision) {
    const nextDivision = getNextDivision(currentRank, currentDivision);
    if (nextDivision) {
      suggestions.push({
        rank: currentRank,
        division: nextDivision,
        type: 'SAME_RANK_UP',
        priority: 1
      });
    }
  }
  
  // Bir üst rank
  const nextRank = getNextRank(currentRank);
  if (nextRank) {
    suggestions.push({
      rank: nextRank,
      division: getFirstDivision(nextRank),
      type: 'NEXT_RANK',
      priority: 2
    });
  }
  
  return suggestions.sort((a, b) => a.priority - b.priority);
}
```

### 3. **Fiyat Hesaplama Logic**
```javascript
function calculateBoostPrice(currentRank, currentDivision, targetRank, targetDivision) {
  const validation = validateRankBoost(currentRank, currentDivision, targetRank, targetDivision);
  
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  const currentValue = calculateRankValue(currentRank, currentDivision);
  const targetValue = calculateRankValue(targetRank, targetDivision);
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
```

---

## 🚨 Hata Mesajları

### Hata Kodları ve Açıklamaları

| Hata Kodu | Türkçe Mesaj | İngilizce Mesaj | Çözüm |
|-----------|--------------|-----------------|-------|
| `SAME_RANK_DIVISION` | "Mevcut rankınızla aynı hedef seçtiniz" | "You selected the same rank as current" | Farklı bir hedef seçin |
| `DOWNWARD_MOVEMENT` | "Hedef rank mevcut rankınızdan düşük olamaz" | "Target rank cannot be lower than current" | Daha yüksek rank seçin |
| `TOO_FAR_JUMP` | "Çok uzak bir rank atlaması seçtiniz" | "You selected too far a rank jump" | Daha yakın hedef seçin |
| `INVALID_RANK` | "Geçersiz rank formatı" | "Invalid rank format" | Doğru format kullanın |
| `INVALID_DIVISION` | "Geçersiz division formatı" | "Invalid division format" | Doğru division seçin |

### Kullanıcı Dostu Mesajlar
```javascript
const ERROR_MESSAGES = {
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
  }
};
```

---

## 📝 Örnek Senaryolar

### Senaryo 1: Gold IV → Gold I
```javascript
// Input
currentRank = 'Gold';
currentDivision = 'IV';
targetRank = 'Gold';
targetDivision = 'I';

// Validation
const validation = validateRankBoost(currentRank, currentDivision, targetRank, targetDivision);
// Result: { valid: true }

// Price Calculation
const price = calculateBoostPrice(currentRank, currentDivision, targetRank, targetDivision);
// Result: ~$35 (3 division jump)
```

### Senaryo 2: Silver I → Diamond IV
```javascript
// Input
currentRank = 'Silver';
currentDivision = 'I';
targetRank = 'Diamond';
targetDivision = 'IV';

// Validation
const validation = validateRankBoost(currentRank, currentDivision, targetRank, targetDivision);
// Result: { valid: false, error: 'TOO_FAR_JUMP' }

// Suggested Alternative
const suggestions = getSuggestedTargets(currentRank, currentDivision);
// Result: [
//   { rank: 'Gold', division: 'IV', type: 'NEXT_RANK', priority: 2 }
// ]
```

### Senaryo 3: Platinum III → Platinum II (Geçersiz)
```javascript
// Input
currentRank = 'Platinum';
currentDivision = 'III';
targetRank = 'Platinum';
targetDivision = 'II';

// Validation
const validation = validateRankBoost(currentRank, currentDivision, targetRank, targetDivision);
// Result: { valid: false, error: 'DOWNWARD_MOVEMENT' }

// Error Message
const message = ERROR_MESSAGES.DOWNWARD_MOVEMENT.tr;
// Result: "⬇️ Rank düşürme hizmeti sunmuyoruz. Yukarı doğru boost alın!"
```

---

## 🔌 API Endpoint Örnekleri

### 1. Rank Validation Endpoint
```javascript
// POST /api/validate-rank
{
  "game": "lol", // veya "valorant"
  "currentRank": "Gold",
  "currentDivision": "IV",
  "targetRank": "Platinum",
  "targetDivision": "II"
}

// Response
{
  "valid": true,
  "price": 85,
  "estimatedTime": "4-6 days",
  "suggestions": [
    {
      "rank": "Gold",
      "division": "III",
      "type": "SAME_RANK_UP",
      "price": 25
    }
  ]
}
```

### 2. Rank Suggestions Endpoint
```javascript
// GET /api/rank-suggestions?game=lol&currentRank=Gold&currentDivision=IV

// Response
{
  "suggestions": [
    {
      "rank": "Gold",
      "division": "III",
      "type": "SAME_RANK_UP",
      "price": 25,
      "estimatedTime": "1-2 days"
    },
    {
      "rank": "Platinum",
      "division": "IV",
      "type": "NEXT_RANK",
      "price": 65,
      "estimatedTime": "3-4 days"
    }
  ]
}
```

### 3. Price Calculator Endpoint
```javascript
// POST /api/calculate-price
{
  "game": "valorant",
  "currentRank": "Silver",
  "currentDivision": 2,
  "targetRank": "Gold",
  "targetDivision": 1
}

// Response
{
  "price": 45,
  "currency": "USD",
  "breakdown": {
    "basePrice": 15,
    "rankJumps": 1,
    "divisionJumps": 2,
    "total": 45
  }
}
```

---

## 🎯 Frontend Implementation

### React Component Örneği
```jsx
function RankSelector({ game, currentRank, currentDivision, onRankChange }) {
  const [targetRank, setTargetRank] = useState('');
  const [targetDivision, setTargetDivision] = useState('');
  const [validation, setValidation] = useState(null);
  
  const validateSelection = async () => {
    const response = await fetch('/api/validate-rank', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        game,
        currentRank,
        currentDivision,
        targetRank,
        targetDivision
      })
    });
    
    const result = await response.json();
    setValidation(result);
  };
  
  useEffect(() => {
    if (targetRank && targetDivision) {
      validateSelection();
    }
  }, [targetRank, targetDivision]);
  
  return (
    <div className="rank-selector">
      <div className="current-rank">
        Mevcut: {currentRank} {currentDivision}
      </div>
      
      <select 
        value={targetRank} 
        onChange={(e) => setTargetRank(e.target.value)}
      >
        <option value="">Hedef Rank Seçin</option>
        {getAvailableRanks(game, currentRank).map(rank => (
          <option key={rank} value={rank}>{rank}</option>
        ))}
      </select>
      
      {targetRank && (
        <select 
          value={targetDivision} 
          onChange={(e) => setTargetDivision(e.target.value)}
        >
          <option value="">Division Seçin</option>
          {getDivisions(game, targetRank).map(div => (
            <option key={div} value={div}>{div}</option>
          ))}
        </select>
      )}
      
      {validation && (
        <div className={`validation ${validation.valid ? 'valid' : 'invalid'}`}>
          {validation.valid ? (
            <div>
              ✅ Geçerli seçim! Fiyat: ${validation.price}
            </div>
          ) : (
            <div>
              ❌ {ERROR_MESSAGES[validation.error]?.tr}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

---

## 📊 Database Schema

### Rank Configuration Table
```sql
CREATE TABLE rank_configurations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  game ENUM('lol', 'valorant') NOT NULL,
  rank_name VARCHAR(20) NOT NULL,
  rank_value INT NOT NULL,
  has_divisions BOOLEAN DEFAULT TRUE,
  divisions JSON, -- ["IV", "III", "II", "I"] veya [1, 2, 3]
  max_jump_distance INT DEFAULT 4,
  base_price DECIMAL(10,2) DEFAULT 15.00,
  price_multiplier DECIMAL(3,2) DEFAULT 1.20,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Boost Orders Table
```sql
CREATE TABLE boost_orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  game ENUM('lol', 'valorant') NOT NULL,
  current_rank VARCHAR(20) NOT NULL,
  current_division VARCHAR(5),
  target_rank VARCHAR(20) NOT NULL,
  target_division VARCHAR(5),
  price DECIMAL(10,2) NOT NULL,
  status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

*Bu doküman, AtlastBoost platformu için rank seçimi ve validation mantığını içerir. Tüm kurallar müşteri deneyimini optimize etmek ve mantıklı seçimler yapmalarını sağlamak için tasarlanmıştır.*
