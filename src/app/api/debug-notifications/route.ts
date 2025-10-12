import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(_request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Kullanıcının bildirimlerini kontrol et
    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Bildirim tercihlerini kontrol et
    const preferences = await prisma.notificationPreference.findUnique({
      where: { userId: session.user.id },
    });

    // Son siparişleri kontrol et
    const recentOrders = await prisma.order.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        orderStatus: true,
        paymentStatus: true,
        createdAt: true,
        paidAt: true,
      },
    });

    return NextResponse.json({
      userId: session.user.id,
      userEmail: session.user.email,
      notifications: notifications.map(n => ({
        id: n.id,
        type: n.type,
        title: n.title,
        read: n.read,
        createdAt: n.createdAt,
      })),
      preferences: preferences ? {
        inAppEnabled: preferences.inAppEnabled,
        emailEnabled: preferences.emailEnabled,
        pushEnabled: preferences.pushEnabled,
      } : 'NOT_SET',
      recentOrders,
      config: {
        pusher: {
          configured: !!(process.env.PUSHER_APP_ID && process.env.PUSHER_KEY && process.env.PUSHER_SECRET),
          appId: process.env.PUSHER_APP_ID ? '✓' : '✗',
          key: process.env.PUSHER_KEY ? '✓' : '✗',
          secret: process.env.PUSHER_SECRET ? '✓' : '✗',
          publicKey: process.env.NEXT_PUBLIC_PUSHER_KEY ? '✓' : '✗',
        },
        resend: {
          configured: !!process.env.RESEND_API_KEY,
        },
        vapid: {
          configured: !!(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY),
        },
      },
    });
  } catch (error) {
    console.error('Debug notifications error:', error);
    return NextResponse.json({
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

