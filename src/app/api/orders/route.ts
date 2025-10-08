import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateBoostPriceWithCurrency } from '@/lib/boost-pricing'

// GET /api/orders - Kullanıcının siparişlerini listele
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const whereClause: any = {
      userId: session.user.id
    }

    if (status && status !== 'all') {
      whereClause.orderStatus = status.toUpperCase()
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: whereClause,
        include: {
          booster: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              rating: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.order.count({ where: whereClause })
    ])

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/orders - Yeni sipariş oluştur
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      game,
      currentRank,
      currentDivision,
      targetRank,
      targetDivision
    } = body

    // Validation
    if (!game || !currentRank || !targetRank) {
      return NextResponse.json({ 
        error: 'Missing required fields: game, currentRank, targetRank' 
      }, { status: 400 })
    }

    // Valid games
    const validGames = ['lol', 'valorant']
    if (!validGames.includes(game)) {
      return NextResponse.json({ 
        error: 'Invalid game. Supported games: lol, valorant' 
      }, { status: 400 })
    }

    // Calculate price
    // Currency ve fiyat hesapla
    const currency = (body.currency as 'USD' | 'TRY') || 'USD'
    const price = calculateBoostPriceWithCurrency(
      game,
      currentRank,
      targetRank,
      currentDivision,
      targetDivision,
      currency
    )
    
    if (price <= 0) {
      return NextResponse.json({ 
        error: 'Invalid rank range or unable to calculate price' 
      }, { status: 400 })
    }

    // Check if user has any pending orders
    const pendingOrders = await prisma.order.count({
      where: {
        userId: session.user.id,
        orderStatus: {
          in: ['PENDING', 'PAID', 'ASSIGNED', 'IN_PROGRESS']
        }
      }
    })

    if (pendingOrders >= 3) {
      return NextResponse.json({ 
        error: 'You can have maximum 3 active orders at a time' 
      }, { status: 400 })
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        game,
        currentRank,
        currentDivision,
        targetRank,
        targetDivision,
        price,
        currency: currency,
        orderStatus: 'PENDING',
        paymentStatus: 'PENDING'
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

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
