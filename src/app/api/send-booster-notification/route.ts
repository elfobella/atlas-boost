import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { notificationService } from '@/lib/notification-service';
import { prisma } from '@/lib/prisma';

/**
 * Manuel olarak booster bildirimini gönder
 * Kullanım: /api/send-booster-notification?orderId=YOUR_ORDER_ID
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ 
        error: 'orderId parametresi gerekli',
        usage: '/api/send-booster-notification?orderId=YOUR_ORDER_ID'
      }, { status: 400 });
    }

    // Siparişi bul
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { 
        user: true,
        booster: true 
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Sipariş bulunamadı' }, { status: 404 });
    }

    if (!order.boosterId) {
      return NextResponse.json({ error: 'Bu siparişe henüz booster atanmamış' }, { status: 400 });
    }

    console.log('📧 Sending booster notification manually...');
    console.log('Order:', order.id);
    console.log('Customer:', order.userId);
    console.log('Booster:', order.boosterId);

    // Bildirimi gönder
    await notificationService.notifyBoosterAssigned(
      order.id,
      order.userId,
      order.boosterId
    );

    return NextResponse.json({
      success: true,
      message: 'Booster bildirimi başarıyla gönderildi',
      order: {
        id: order.id,
        customer: order.user.email,
        booster: order.booster?.email
      }
    });

  } catch (error) {
    console.error('❌ Booster bildirim hatası:', error);
    return NextResponse.json({
      error: 'Bildirim gönderilemedi',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

