import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/orders/[id] - Sipariş detaylarını getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params;

    const order = await prisma.order.findFirst({
      where: {
        id: id,
        userId: session.user.id // Sadece kendi siparişini görebilir
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

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/orders/[id] - Sipariş durumunu güncelle (sadece booster)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      orderStatus, 
      progress, 
      notes, 
      actualHours,
      customerRating,
      customerFeedback 
    } = body

    const { id } = await params;

    // Siparişi bul
    const order = await prisma.order.findUnique({
      where: { id },
      include: { booster: true }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Yetki kontrolü
    const isOwner = order.userId === session.user.id
    const isBooster = order.boosterId === session.user.id
    const isAdmin = session.user.role === 'ADMIN'

    if (!isOwner && !isBooster && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Güncelleme verilerini hazırla
    const updateData: Record<string, unknown> = {}

    // Booster güncellemeleri
    if (isBooster || isAdmin) {
      if (orderStatus) updateData.orderStatus = orderStatus
      if (progress !== undefined) updateData.progress = progress
      if (notes) updateData.notes = notes
      if (actualHours) updateData.actualHours = actualHours

      // Boost başladığında
      if (orderStatus === 'IN_PROGRESS' && !order.startedAt) {
        updateData.startedAt = new Date()
      }

      // Boost tamamlandığında
      if (orderStatus === 'COMPLETED' && !order.completedAt) {
        updateData.completedAt = new Date()
        
        // Booster'ın completed orders sayısını artır
        await prisma.user.update({
          where: { id: order.boosterId! },
          data: {
            completedOrders: {
              increment: 1
            }
          }
        })
      }
    }

    // Müşteri güncellemeleri
    if (isOwner || isAdmin) {
      if (customerRating) updateData.customerRating = customerRating
      if (customerFeedback) updateData.customerFeedback = customerFeedback
    }

    // Admin güncellemeleri
    if (isAdmin) {
      // Admin her şeyi güncelleyebilir
      Object.assign(updateData, body)
    }

    const updatedOrder = await prisma.order.update({
      where: { id: id },
      data: updateData,
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

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/orders/[id] - Siparişi iptal et
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params;

    const order = await prisma.order.findFirst({
      where: {
        id,
        userId: session.user.id // Sadece kendi siparişini iptal edebilir
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Sadece PENDING ve PAID durumundaki siparişler iptal edilebilir
    if (!['PENDING', 'PAID'].includes(order.orderStatus)) {
      return NextResponse.json({ 
        error: 'Order cannot be cancelled in current status' 
      }, { status: 400 })
    }

    const cancelledOrder = await prisma.order.update({
      where: { id: id },
      data: {
        orderStatus: 'CANCELLED'
      }
    })

    return NextResponse.json(cancelledOrder)
  } catch (error) {
    console.error('Error cancelling order:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
