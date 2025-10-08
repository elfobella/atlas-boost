import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { selectOptimalBooster } from '@/lib/booster-assignment'

// POST /api/orders/[id]/assign - Siparişe booster ata
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Sadece admin veya sistem otomatik atama yapabilir
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { boosterId, autoAssign = false } = body

    // Siparişi bul
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { user: true }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Sadece PAID durumundaki siparişlere booster atanabilir
    if (order.orderStatus !== 'PAID') {
      return NextResponse.json({ 
        error: 'Order must be in PAID status to assign booster' 
      }, { status: 400 })
    }

    let selectedBooster

    if (autoAssign) {
      // Otomatik booster seçimi
      selectedBooster = await selectOptimalBooster(order)
      
      if (!selectedBooster) {
        return NextResponse.json({ 
          error: 'No suitable booster found' 
        }, { status: 404 })
      }
    } else {
      // Manuel booster atama
      if (!boosterId) {
        return NextResponse.json({ 
          error: 'boosterId is required for manual assignment' 
        }, { status: 400 })
      }

      // Booster'ı kontrol et
      const booster = await prisma.user.findFirst({
        where: {
          id: boosterId,
          role: 'BOOSTER',
          isAvailable: true
        }
      })

      if (!booster) {
        return NextResponse.json({ 
          error: 'Booster not found or not available' 
        }, { status: 404 })
      }

      // Booster'ın mevcut aktif sipariş sayısını kontrol et
      const activeOrders = await prisma.order.count({
        where: {
          boosterId: boosterId,
          orderStatus: {
            in: ['ASSIGNED', 'IN_PROGRESS']
          }
        }
      })

      if (activeOrders >= booster.maxOrders) {
        return NextResponse.json({ 
          error: 'Booster has reached maximum order limit' 
        }, { status: 400 })
      }

      selectedBooster = booster
    }

    // Booster earnings hesapla (%70 booster'a, %30 platform'a)
    const boosterEarnings = order.price * 0.7

    // Siparişi güncelle
    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: {
        boosterId: selectedBooster.id,
        boosterEarnings: boosterEarnings,
        orderStatus: 'ASSIGNED',
        assignedAt: new Date()
      },
      include: {
        booster: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            rating: true,
            completedOrders: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // TODO: Booster'a bildirim gönder
    // TODO: Müşteriye booster bilgileri gönder

    return NextResponse.json({
      message: 'Booster assigned successfully',
      order: updatedOrder
    })
  } catch (error) {
    console.error('Error assigning booster:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/orders/[id]/assign - Müsait booster'ları listele
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Sadece admin booster listesini görebilir
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Müsait booster'ları getir
    const availableBoosters = await prisma.user.findMany({
      where: {
        role: 'BOOSTER',
        isAvailable: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        rating: true,
        completedOrders: true,
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
    })

    // Her booster için mevcut slot sayısını hesapla
    const boostersWithSlots = availableBoosters.map(booster => ({
      ...booster,
      availableSlots: booster.maxOrders - booster._count.boostJobs
    }))

    // Uygun booster'ları filtrele (müsait slot olan)
    const suitableBoosters = boostersWithSlots.filter(booster => 
      booster.availableSlots > 0
    )

    return NextResponse.json({
      boosters: suitableBoosters,
      order: {
        id: order.id,
        game: order.game,
        currentRank: order.currentRank,
        targetRank: order.targetRank,
        price: order.price
      }
    })
  } catch (error) {
    console.error('Error fetching available boosters:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
