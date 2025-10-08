const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createTestBooster() {
  try {
    console.log('🧪 Test booster hesabı oluşturuluyor...')

    // Test booster email'i
    const testEmail = 'booster@atlastboost.com'
    
    // Önce mevcut booster'ı kontrol et
    const existingBooster = await prisma.user.findUnique({
      where: { email: testEmail }
    })

    if (existingBooster) {
      console.log('✅ Test booster zaten mevcut!')
      console.log(`📧 Email: ${testEmail}`)
      console.log(`🔑 Role: ${existingBooster.role}`)
      return
    }

    // Şifre hash'le
    const hashedPassword = await bcrypt.hash('booster123', 12)

    // Test booster oluştur
    const booster = await prisma.user.create({
      data: {
        name: 'Test Booster',
        email: testEmail,
        password: hashedPassword,
        role: 'BOOSTER',
        isAvailable: true,
        maxOrders: 3,
        rating: 4.8,
        completedOrders: 25
      }
    })

    console.log('🎉 Test booster başarıyla oluşturuldu!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`📧 Email: ${testEmail}`)
    console.log(`🔑 Şifre: booster123`)
    console.log(`👤 Ad: ${booster.name}`)
    console.log(`🎯 Role: ${booster.role}`)
    console.log(`⭐ Rating: ${booster.rating}`)
    console.log(`📊 Tamamlanan Sipariş: ${booster.completedOrders}`)
    console.log(`✅ Müsait: ${booster.isAvailable ? 'Evet' : 'Hayır'}`)
    console.log(`🔢 Max Sipariş: ${booster.maxOrders}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🔗 Giriş yapmak için: https://atlas-boost-qraz.vercel.app/auth/signin')
    
  } catch (error) {
    console.error('❌ Hata:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestBooster()
