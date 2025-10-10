import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/orders/available - PAID durumundaki siparişleri getir (tüm boosterlara açık)
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Sadece booster'lar görebilir
    if (session.user.role !== 'BOOSTER') {
      return NextResponse.json({ error: 'Only boosters can access this endpoint' }, { status: 403 })
    }

    // PAID durumundaki siparişleri getir (booster atanmamış)
    const orders = await prisma.order.findMany({
      where: {
        orderStatus: 'PAID',
        boosterId: null, // Henüz kimseye atanmamış
        paymentStatus: 'SUCCEEDED' // Ödeme başarılı
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      },
      orderBy: {
        paidAt: 'asc' // İlk ödenen önce
      }
    })

    return NextResponse.json({
      orders,
      count: orders.length
    })
  } catch (error) {
    console.error('Error fetching available orders:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

