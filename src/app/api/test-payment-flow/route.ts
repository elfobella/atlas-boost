import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notificationService } from '@/lib/notification-service';

/**
 * Test endpoint - Ödeme akışını simüle eder
 * 
 * Kullanım:
 * 1. Önce bir sipariş oluşturun
 * 2. Bu endpoint'i çağırın: /api/test-payment-flow?orderId=YOUR_ORDER_ID
 * 
 * Bu endpoint:
 * 1. Siparişi PAID durumuna getirir
 * 2. Müşteriye bildirim gönderir
 * 3. Otomatik olarak booster atar (varsa)
 * 4. Hem müşteriye hem booster'a atama bildirimi gönderir
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const autoAssign = searchParams.get('autoAssign') === 'true';

    if (!orderId) {
      return NextResponse.json({ 
        error: 'orderId parametresi gerekli',
        usage: '/api/test-payment-flow?orderId=YOUR_ORDER_ID&autoAssign=true (opsiyonel)'
      }, { status: 400 });
    }

    // Siparişi bul
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true }
    });

    if (!order) {
      return NextResponse.json({ error: 'Sipariş bulunamadı' }, { status: 404 });
    }

    // Sadece kendi siparişini test edebilir (veya admin)
    if (order.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Bu siparişi test etme yetkiniz yok' }, { status: 403 });
    }

    const steps: string[] = [];

    // ADIM 1: Siparişi PAID yap
    console.log('📦 ADIM 1: Sipariş PAID yapılıyor...');
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'SUCCEEDED',
        orderStatus: 'PAID',
        paidAt: new Date(),
      }
    });
    steps.push('✅ Sipariş PAID yapıldı');
    console.log('✅ Sipariş PAID yapıldı');

    // ADIM 2: Müşteriye ödeme onayı bildirimi gönder
    console.log('📧 ADIM 2: Müşteriye bildirim gönderiliyor...');
    await notificationService.notifyPaymentConfirmed(orderId, order.userId);
    steps.push('✅ Müşteriye ödeme bildirimi gönderildi');
    console.log('✅ Müşteriye ödeme bildirimi gönderildi');

    // Otomatik atama istenmediyse burada bitir
    if (!autoAssign) {
      return NextResponse.json({
        success: true,
        message: 'Ödeme bildirimleri başarıyla gönderildi',
        steps,
        order: {
          id: order.id,
          status: 'PAID',
          note: 'Sipariş PAID durumunda, boosterlar tarafından alınabilir'
        },
        info: 'Otomatik booster ataması için ?autoAssign=true parametresini ekleyin'
      });
    }

    // ADIM 3: Müsait booster var mı kontrol et (sadece autoAssign=true ise)
    console.log('🔍 ADIM 3: Müsait booster aranıyor (autoAssign modu)...');
    const availableBoosters = await prisma.user.findMany({
      where: {
        role: 'BOOSTER',
        isAvailable: true,
      },
      select: {
        id: true,
        name: true,
        maxOrders: true,
        _count: {
          select: {
            boostJobs: {
              where: {
                orderStatus: {
                  in: ['ASSIGNED', 'IN_PROGRESS']
                }
              }
            }
          }
        }
      }
    });

    const suitableBoosters = availableBoosters.filter(b => 
      b._count.boostJobs < b.maxOrders
    );

    if (suitableBoosters.length === 0) {
      steps.push('⚠️ Müsait booster bulunamadı (test için bir BOOSTER hesabı oluşturun)');
      console.log('⚠️ Müsait booster bulunamadı');
      
      return NextResponse.json({
        success: true,
        message: 'Ödeme akışı test edildi ancak booster atanmadı',
        steps,
        note: 'Booster atamak için bir BOOSTER rolünde kullanıcı oluşturun',
      });
    }

    // ADIM 4: İlk müsait booster'ı ata
    const selectedBooster = suitableBoosters[0];
    const boosterEarnings = order.price * 0.7;

    console.log('👤 ADIM 4: Booster atanıyor:', selectedBooster.name);
    await prisma.order.update({
      where: { id: orderId },
      data: {
        boosterId: selectedBooster.id,
        boosterEarnings: boosterEarnings,
        orderStatus: 'ASSIGNED',
        assignedAt: new Date()
      }
    });
    steps.push(`✅ Booster atandı: ${selectedBooster.name || 'Anonim'}`);
    console.log('✅ Booster atandı');

    // ADIM 5: Hem müşteriye hem booster'a bildirim gönder
    console.log('📧 ADIM 5: Atama bildirimleri gönderiliyor...');
    await notificationService.notifyBoosterAssigned(
      orderId,
      order.userId,
      selectedBooster.id
    );
    steps.push('✅ Müşteriye atama bildirimi gönderildi');
    steps.push('✅ Booster\'a yeni iş bildirimi gönderildi');
    console.log('✅ Tüm bildirimler gönderildi');

    return NextResponse.json({
      success: true,
      message: 'Ödeme akışı başarıyla test edildi',
      steps,
      order: {
        id: order.id,
        status: 'ASSIGNED',
        booster: {
          id: selectedBooster.id,
          name: selectedBooster.name,
        }
      },
      debug: {
        pusherConfigured: !!(process.env.PUSHER_APP_ID && process.env.PUSHER_KEY && process.env.PUSHER_SECRET),
        totalNotificationsSent: 3, // orderCreated, paymentConfirmed, boosterAssigned (x2)
      }
    });

  } catch (error) {
    console.error('❌ Test ödeme akışı hatası:', error);
    return NextResponse.json({
      error: 'Test başarısız',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

