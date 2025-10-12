/**
 * Bildirim sistemini test etmek için script
 * 
 * Kullanım:
 * node scripts/test-notifications.js
 * 
 * NOT: Bu script notification service'i çağırmaz, sadece veritabanı durumunu kontrol eder.
 * Gerçek bildirimleri test etmek için uygulamayı başlatın ve API endpoint'lerini kullanın.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Notification service'i import edemeyiz çünkü TypeScript dosyası
// Bu yüzden sadece veritabanı seviyesinde kontrol yapacağız

async function main() {
  console.log('🧪 Bildirim Sistemi Test Scripti\n');

  // Test kullanıcısını bul veya oluştur
  console.log('1️⃣ Test kullanıcıları kontrol ediliyor...');
  
  let customer = await prisma.user.findFirst({
    where: { role: 'USER' }
  });

  let booster = await prisma.user.findFirst({
    where: { role: 'BOOSTER' }
  });

  if (!customer) {
    console.log('❌ Müşteri bulunamadı. Lütfen önce bir USER hesabı oluşturun.');
    return;
  }

  if (!booster) {
    console.log('❌ Booster bulunamadı. Lütfen önce bir BOOSTER hesabı oluşturun.');
    return;
  }

  console.log('✅ Müşteri bulundu:', customer.email);
  console.log('✅ Booster bulundu:', booster.email);

  // Bildirim tercihlerini kontrol et
  console.log('\n2️⃣ Bildirim tercihleri kontrol ediliyor...');
  
  let customerPrefs = await prisma.notificationPreference.findUnique({
    where: { userId: customer.id }
  });

  let boosterPrefs = await prisma.notificationPreference.findUnique({
    where: { userId: booster.id }
  });

  if (!customerPrefs) {
    customerPrefs = await prisma.notificationPreference.create({
      data: { userId: customer.id }
    });
    console.log('✅ Müşteri için bildirim tercihleri oluşturuldu');
  } else {
    console.log('✅ Müşteri bildirim tercihleri:', {
      inAppEnabled: customerPrefs.inAppEnabled,
      emailEnabled: customerPrefs.emailEnabled,
      pushEnabled: customerPrefs.pushEnabled,
    });
  }

  if (!boosterPrefs) {
    boosterPrefs = await prisma.notificationPreference.create({
      data: { userId: booster.id }
    });
    console.log('✅ Booster için bildirim tercihleri oluşturuldu');
  } else {
    console.log('✅ Booster bildirim tercihleri:', {
      inAppEnabled: boosterPrefs.inAppEnabled,
      emailEnabled: boosterPrefs.emailEnabled,
      pushEnabled: boosterPrefs.pushEnabled,
    });
  }

  // Test siparişi oluştur
  console.log('\n3️⃣ Test siparişi oluşturuluyor...');
  
  const order = await prisma.order.create({
    data: {
      userId: customer.id,
      game: 'lol',
      currentRank: 'GOLD',
      currentDivision: 'IV',
      targetRank: 'PLATINUM',
      targetDivision: 'IV',
      price: 100.00,
      currency: 'TRY',
      orderStatus: 'PAID',
      paymentStatus: 'SUCCEEDED',
      paidAt: new Date(),
    }
  });

  console.log('✅ Sipariş oluşturuldu:', order.id);

  // Bildirimleri kontrol et
  console.log('\n4️⃣ Sipariş oluşturma bildirimleri kontrol ediliyor...');
  
  const customerNotifications = await prisma.notification.findMany({
    where: {
      userId: customer.id,
      type: {
        in: ['ORDER_CREATED', 'ORDER_PAYMENT_CONFIRMED']
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  console.log(`📬 Müşteriye gönderilen bildirimler: ${customerNotifications.length}`);
  customerNotifications.forEach(n => {
    console.log(`   - ${n.type}: ${n.title}`);
  });

  // Booster ata
  console.log('\n5️⃣ Booster atanıyor...');
  
  const updatedOrder = await prisma.order.update({
    where: { id: order.id },
    data: {
      boosterId: booster.id,
      boosterEarnings: order.price * 0.7,
      orderStatus: 'ASSIGNED',
      assignedAt: new Date(),
    }
  });

  console.log('✅ Booster atandı:', booster.email);

  // Booster bildirimlerini kontrol et
  console.log('\n6️⃣ Booster atama bildirimleri kontrol ediliyor...');
  
  const boosterNotifications = await prisma.notification.findMany({
    where: {
      userId: booster.id,
      type: 'BOOST_JOB_ASSIGNED'
    },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  console.log(`📬 Booster'a gönderilen bildirimler: ${boosterNotifications.length}`);
  boosterNotifications.forEach(n => {
    console.log(`   - ${n.type}: ${n.title}`);
  });

  const customerAssignmentNotifications = await prisma.notification.findMany({
    where: {
      userId: customer.id,
      type: 'ORDER_BOOSTER_ASSIGNED'
    },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  console.log(`📬 Müşteriye gönderilen atama bildirimleri: ${customerAssignmentNotifications.length}`);
  customerAssignmentNotifications.forEach(n => {
    console.log(`   - ${n.type}: ${n.title}`);
  });

  // Özet
  console.log('\n📊 TEST SONUCU:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Sipariş ID: ${order.id}`);
  console.log(`✅ Müşteri bildirimleri: ${customerNotifications.length + customerAssignmentNotifications.length}`);
  console.log(`✅ Booster bildirimleri: ${boosterNotifications.length}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  console.log('\n💡 NOTLAR:');
  console.log('1. Veritabanında bildirimler oluşturuldu, ancak Pusher üzerinden gerçek zamanlı gönderim için uygulamanın çalışıyor olması gerekiyor.');
  console.log('2. Bu bildirimleri görmek için /dashboard/notifications sayfasını ziyaret edin.');
  console.log('3. Gerçek zamanlı bildirimleri test etmek için:');
  console.log('   - Uygulamayı başlatın: npm run dev');
  console.log('   - Giriş yapın ve bildirim çanına tıklayın');
  console.log('   - Bu scripti çalıştırın veya /api/test-notification endpoint\'ini ziyaret edin');
  console.log('\n4. Pusher yapılandırmasını kontrol etmek için:');
  console.log('   - /api/debug-notifications endpoint\'ini ziyaret edin');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

