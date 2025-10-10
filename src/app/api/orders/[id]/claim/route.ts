import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notificationService } from '@/lib/notification-service'

// POST /api/orders/[id]/claim - Booster siparişi alır
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Sadece booster'lar sipariş alabilir
    if (session.user.role !== 'BOOSTER') {
      return NextResponse.json({ error: 'Only boosters can claim orders' }, { status: 403 })
    }

    const orderId = params.id

    // Sipariş kontrolü - transaction içinde yap (race condition önleme)
    const result = await prisma.$transaction(async (tx) => {
      // Siparişi getir ve kontrol et
      const order = await tx.order.findUnique({
        where: { id: orderId }
      })

      if (!order) {
        throw new Error('Order not found')
      }

      // Sipariş zaten atanmış mı?
      if (order.boosterId) {
        throw new Error('Order already claimed by another booster')
      }

      // Sipariş PAID durumunda mı?
      if (order.orderStatus !== 'PAID') {
        throw new Error('Order is not available for claiming')
      }

      // Ödeme başarılı mı?
      if (order.paymentStatus !== 'SUCCEEDED') {
        throw new Error('Payment not completed')
      }

      // Booster'ın aktif sipariş sayısını kontrol et
      const activeOrders = await tx.order.count({
        where: {
          boosterId: session.user.id,
          orderStatus: {
            in: ['ASSIGNED', 'IN_PROGRESS']
          }
        }
      })

      // Booster bilgilerini al
      const booster = await tx.user.findUnique({
        where: { id: session.user.id }
      })

      if (!booster) {
        throw new Error('Booster not found')
      }

      // Maksimum sipariş limitini kontrol et
      if (activeOrders >= booster.maxOrders) {
        throw new Error(`Maximum active orders limit reached (${booster.maxOrders})`)
      }

      // Booster kazancını hesapla (%70 booster, %30 platform)
      const boosterEarnings = order.price * 0.70

      // Siparişi booster'a ata
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          boosterId: session.user.id,
          orderStatus: 'ASSIGNED',
          assignedAt: new Date(),
          boosterEarnings: boosterEarnings
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          },
          booster: {
            select: {
              id: true,
              name: true,
              email: true,
              rating: true
            }
          }
        }
      })

      return updatedOrder
    })

    // Send notifications
    await notificationService.notifyBoosterAssigned(
      result.id,
      result.userId,
      session.user.id
    );

    return NextResponse.json({
      success: true,
      order: result,
      message: 'Order claimed successfully'
    })

  } catch (error: any) {
    console.error('Error claiming order:', error)
    
    // Kullanıcı dostu hata mesajları
    if (error.message === 'Order not found') {
      return NextResponse.json({ error: 'Sipariş bulunamadı' }, { status: 404 })
    }
    if (error.message === 'Order already claimed by another booster') {
      return NextResponse.json({ error: 'Bu sipariş başka bir booster tarafından alındı' }, { status: 409 })
    }
    if (error.message === 'Order is not available for claiming') {
      return NextResponse.json({ error: 'Bu sipariş alınmaya uygun değil' }, { status: 400 })
    }
    if (error.message.includes('Maximum active orders limit reached')) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Sipariş alınırken hata oluştu' }, { status: 500 })
  }
}

