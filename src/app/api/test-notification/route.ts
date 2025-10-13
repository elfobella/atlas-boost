import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { notificationService } from '@/lib/notification-service';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Test bildirimi gönder
    const result = await notificationService.sendNotification({
      userId: session.user.id,
      type: 'SYSTEM_UPDATE',
      title: '🎉 Test Bildirimi',
      message: 'Bu bir test bildirimidir. Bildirim sistemi çalışıyor!',
      priority: 'HIGH',
      channels: ['in_app', 'email', 'push'],
      actionUrl: '/dashboard/notifications',
      data: {
        test: true,
        timestamp: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Test bildirimi gönderildi',
      notification: result,
      debug: {
        userId: session.user.id,
        userEmail: session.user.email,
        pusherConfigured: !!(process.env.PUSHER_APP_ID && process.env.PUSHER_KEY && process.env.PUSHER_SECRET),
        resendConfigured: !!process.env.RESEND_API_KEY,
        vapidConfigured: !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      }
    });
  } catch (error) {
    console.error('Test notification error:', error);
    return NextResponse.json({
      error: 'Test bildirimi gönderilemedi',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

