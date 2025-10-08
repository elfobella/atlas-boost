import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { sessionId } = body

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    // Stripe session'ı retrieve et
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId)

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
      return NextResponse.json({ 
        message: 'Order already exists',
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
        paymentStatus: 'COMPLETED',
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
