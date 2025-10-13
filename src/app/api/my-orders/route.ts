import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * Kullanıcının kendi siparişlerini listeler (test için basitleştirilmiş)
 */
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        game: true,
        currentRank: true,
        targetRank: true,
        price: true,
        orderStatus: true,
        paymentStatus: true,
        createdAt: true,
        booster: {
          select: {
            name: true
          }
        }
      }
    });

    return NextResponse.json({
      orders: orders.map(o => ({
        ...o,
        testUrl: `/api/test-payment-flow?orderId=${o.id}`
      }))
    });
  } catch (error) {
    console.error('Get my orders error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


