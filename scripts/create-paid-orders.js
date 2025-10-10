const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createPaidOrders() {
  try {
    console.log('🧪 PAID durumunda test siparişleri oluşturuluyor...\n')

    // 1. Müşteri kullanıcısını bul veya oluştur
    let customer = await prisma.user.findFirst({
      where: { role: 'USER' }
    })

    if (!customer) {
      console.log('📝 Müşteri bulunamadı, test müşterisi oluşturuluyor...')
      const bcrypt = require('bcryptjs')
      const hashedPassword = await bcrypt.hash('test123', 12)
      
      customer = await prisma.user.create({
        data: {
          name: 'Test Müşteri',
          email: 'customer@test.com',
          password: hashedPassword,
          role: 'USER'
        }
      })
      console.log(`✅ Test müşteri oluşturuldu: ${customer.email}`)
    } else {
      console.log(`✅ Müşteri bulundu: ${customer.name} (${customer.email})`)
    }

    // 2. Booster'ı bul
    let booster = await prisma.user.findFirst({
      where: { role: 'BOOSTER' }
    })

    if (!booster) {
      console.log('❌ Booster bulunamadı! Önce booster oluşturun:')
      console.log('   node scripts/create-test-booster.js')
      return
    }

    console.log(`✅ Booster bulundu: ${booster.name} (${booster.email})\n`)

    // 3. PAID durumunda test siparişleri oluştur (tüm boosterlara açık)
    const paidOrders = [
      {
        userId: customer.id,
        game: 'lol',
        currentRank: 'Gold',
        currentDivision: 'IV',
        targetRank: 'Platinum',
        targetDivision: 'IV',
        price: 550,
        currency: 'TRY',
        orderStatus: 'PAID',
        paymentStatus: 'SUCCEEDED',
        estimatedHours: 18,
        paidAt: new Date()
      },
      {
        userId: customer.id,
        game: 'valorant',
        currentRank: 'Silver',
        currentDivision: 'II',
        targetRank: 'Gold',
        targetDivision: 'II',
        price: 480,
        currency: 'TRY',
        orderStatus: 'PAID',
        paymentStatus: 'SUCCEEDED',
        estimatedHours: 14,
        paidAt: new Date()
      },
      {
        userId: customer.id,
        game: 'lol',
        currentRank: 'Diamond',
        currentDivision: 'IV',
        targetRank: 'Master',
        targetDivision: null,
        price: 1200,
        currency: 'TRY',
        orderStatus: 'PAID',
        paymentStatus: 'SUCCEEDED',
        estimatedHours: 35,
        paidAt: new Date()
      }
    ]

    console.log('📦 PAID durumunda siparişler oluşturuluyor (tüm boosterlara açık)...')
    
    for (let i = 0; i < paidOrders.length; i++) {
      const order = await prisma.order.create({
        data: paidOrders[i]
      })
      console.log(`   ✅ Sipariş ${i + 1}: ${order.game.toUpperCase()} ${order.currentRank} → ${order.targetRank} (${order.price}₺)`)
    }

    // 4. İstatistikleri göster
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📊 ÖZET')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    const availableOrders = await prisma.order.findMany({
      where: { 
        orderStatus: 'PAID',
        boosterId: null
      }
    })

    const assignedOrders = await prisma.order.findMany({
      where: { 
        boosterId: booster.id
      }
    })

    console.log(`\n📦 Tüm Boosterlara Açık Siparişler: ${availableOrders.length}`)
    console.log(`💼 Booster'a Atanmış Siparişler: ${assignedOrders.length}`)
    
    const totalValue = availableOrders.reduce((sum, o) => sum + o.price, 0)
    const totalEarnings = totalValue * 0.70
    console.log(`💰 Toplam Potansiyel Kazanç: ${totalEarnings.toFixed(0)}₺`)

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🔗 Booster Dashboard: http://localhost:3000/dashboard/booster')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\n✨ Booster hesabıyla giriş yapın:')
    console.log(`   📧 Email: ${booster.email}`)
    console.log(`   🔑 Şifre: booster123`)
    console.log('\n📌 "Aktif Siparişler" sekmesinde yeni siparişleri göreceksiniz!')
    console.log('📌 "Siparişi Al" butonuna tıklayarak sipariş alabilirsiniz!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    
  } catch (error) {
    console.error('❌ Hata:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createPaidOrders()

