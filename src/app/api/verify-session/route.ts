import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { notificationService } from '@/lib/notification-service'

export async function POST(request: Request) {
  try {
    console.log('🔍 Verify session API called');
    
    const session = await auth()
    console.log('🔍 Session:', session?.user?.id ? 'Authenticated' : 'Not authenticated');
    
    if (!session?.user?.id) {
      console.error('❌ No authenticated session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { sessionId } = body
    console.log('🔍 Session ID:', sessionId);

    if (!sessionId) {
      console.error('❌ No session ID provided');
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    // Stripe session'ı retrieve et
    console.log('🔍 Retrieving Stripe session...');
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId)
    console.log('🔍 Stripe session retrieved:', stripeSession.id);

    if (!stripeSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Session zaten completed mı kontrol et
    if (stripeSession.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 })
    }

    // Bu session ID ile zaten sipariş var mı kontrol et
    const existingOrder = await prisma.order.findUnique({
      where: { stripeSessionId: sessionId }
    })

    if (existingOrder) {
      console.log('⚠️ Order already exists:', existingOrder.id)
      
      // Eğer bildirimler daha önce gönderilmediyse, şimdi gönder
      console.log('📧 Ensuring notifications are sent for existing order...')
      try {
        await notificationService.notifyOrderCreated(existingOrder.id, session.user.id)
        await notificationService.notifyPaymentConfirmed(existingOrder.id, session.user.id)
        console.log('ℹ️ Order is available for boosters to claim')
      } catch (error) {
        console.error('⚠️ Error sending notifications for existing order:', error)
      }
      
      return NextResponse.json({ 
        message: 'Order already exists, notifications sent',
        order: existingOrder 
      })
    }

    // Siparişi oluştur
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        stripeSessionId: sessionId,
        stripePaymentIntentId: stripeSession.payment_intent as string,
        game: stripeSession.metadata?.game || '',
        currentRank: stripeSession.metadata?.currentRank || '',
        currentDivision: stripeSession.metadata?.currentDivision || null,
        targetRank: stripeSession.metadata?.targetRank || '',
        targetDivision: stripeSession.metadata?.targetDivision || null,
        price: (stripeSession.amount_total || 0) / 100,
        currency: stripeSession.currency?.toUpperCase() || 'TRY',
        paymentStatus: 'SUCCEEDED',
        orderStatus: 'PAID',
        paidAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    console.log('✅ Order created from session verification:', order.id)

    // BILDIRIMLERI GÖNDER
    console.log('📧 Sending order notifications...')
    try {
      // 1. Sipariş oluşturuldu bildirimi
      await notificationService.notifyOrderCreated(order.id, session.user.id)
      console.log('✅ Order created notification sent')
      
      // 2. Ödeme onayı bildirimi
      await notificationService.notifyPaymentConfirmed(order.id, session.user.id)
      console.log('✅ Payment confirmed notification sent')
      
      console.log('ℹ️ Order is now available for boosters to claim')
    } catch (notificationError) {
      console.error('⚠️ Notification error (non-critical):', notificationError)
      // Hata olsa bile sipariş oluşturuldu, devam et
    }

    return NextResponse.json({
      message: 'Order created successfully',
      order: {
        id: order.id,
        game: order.game,
        currentRank: order.currentRank,
        targetRank: order.targetRank,
        price: order.price,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus
      }
    })

  } catch (error) {
    console.error('Error verifying session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
