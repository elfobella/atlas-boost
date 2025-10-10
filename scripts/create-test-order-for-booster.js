const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createTestOrderForBooster() {
  try {
    console.log('🧪 Test siparişi oluşturuluyor...\n')

    // 1. Booster kullanıcısını bul veya oluştur
    let booster = await prisma.user.findFirst({
      where: { role: 'BOOSTER' }
    })

    if (!booster) {
      console.log('❌ Booster bulunamadı! Önce booster oluşturun:')
      console.log('   node scripts/create-test-booster.js')
      return
    }

    console.log(`✅ Booster bulundu: ${booster.name} (${booster.email})`)

    // 2. Müşteri kullanıcısını bul veya oluştur
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

    // 3. Test siparişi oluştur ve booster'a ata
    const testOrders = [
      {
        userId: customer.id,
        boosterId: booster.id,
        game: 'lol',
        currentRank: 'Silver',
        currentDivision: 'II',
        targetRank: 'Gold',
        targetDivision: 'IV',
        price: 450,
        currency: 'TRY',
        boosterEarnings: 315, // %70
        orderStatus: 'ASSIGNED',
        paymentStatus: 'SUCCEEDED',
        progress: 0,
        estimatedHours: 15,
        assignedAt: new Date(),
        paidAt: new Date()
      },
      {
        userId: customer.id,
        boosterId: booster.id,
        game: 'valorant',
        currentRank: 'Bronze',
        currentDivision: 'III',
        targetRank: 'Silver',
        targetDivision: 'I',
        price: 350,
        currency: 'TRY',
        boosterEarnings: 245, // %70
        orderStatus: 'IN_PROGRESS',
        paymentStatus: 'SUCCEEDED',
        progress: 45,
        estimatedHours: 12,
        assignedAt: new Date(Date.now() - 86400000), // 1 gün önce
        startedAt: new Date(Date.now() - 86400000),
        paidAt: new Date(Date.now() - 86400000)
      },
      {
        userId: customer.id,
        boosterId: booster.id,
        game: 'lol',
        currentRank: 'Platinum',
        currentDivision: 'IV',
        targetRank: 'Diamond',
        targetDivision: 'IV',
        price: 850,
        currency: 'TRY',
        boosterEarnings: 595, // %70
        orderStatus: 'COMPLETED',
        paymentStatus: 'SUCCEEDED',
        progress: 100,
        estimatedHours: 25,
        actualHours: 22,
        assignedAt: new Date(Date.now() - 604800000), // 1 hafta önce
        startedAt: new Date(Date.now() - 604800000),
        paidAt: new Date(Date.now() - 604800000),
        completedAt: new Date(Date.now() - 172800000), // 2 gün önce
        customerRating: 5,
        customerFeedback: 'Harika bir deneyimdi, çok hızlı ve profesyonel!'
      }
    ]

    console.log('\n📦 Test siparişleri oluşturuluyor...')
    
    for (let i = 0; i < testOrders.length; i++) {
      const order = await prisma.order.create({
        data: testOrders[i]
      })
      console.log(`   ✅ Sipariş ${i + 1}: ${order.game.toUpperCase()} ${order.currentRank} → ${order.targetRank} (${order.orderStatus})`)
    }

    // 4. İstatistikleri göster
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📊 ÖZET')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    const allOrders = await prisma.order.findMany({
      where: { boosterId: booster.id },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    })

    console.log(`\n👤 Booster: ${booster.name} (${booster.email})`)
    console.log(`📦 Toplam Atanan Sipariş: ${allOrders.length}`)
    console.log(`🎯 Aktif İşler: ${allOrders.filter(o => ['ASSIGNED', 'IN_PROGRESS'].includes(o.orderStatus)).length}`)
    console.log(`✅ Tamamlanan İşler: ${allOrders.filter(o => o.orderStatus === 'COMPLETED').length}`)
    
    const totalEarnings = allOrders
      .filter(o => o.orderStatus === 'COMPLETED')
      .reduce((sum, o) => sum + (o.boosterEarnings || 0), 0)
    console.log(`💰 Toplam Kazanç: ${totalEarnings}₺`)

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🔗 Booster Dashboard: http://localhost:3000/dashboard/booster')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\n✨ Booster hesabıyla giriş yapın:')
    console.log(`   📧 Email: ${booster.email}`)
    console.log(`   🔑 Şifre: booster123`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    
  } catch (error) {
    console.error('❌ Hata:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestOrderForBooster()

