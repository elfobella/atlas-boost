/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Notifications API: Starting request');
    
    // Check auth with error handling
    let session;
    try {
      session = await auth();
    } catch (authError) {
      console.error('❌ Notifications API: Auth error:', authError);
      return NextResponse.json({ 
        error: 'Authentication service error',
        details: authError instanceof Error ? authError.message : 'Unknown auth error'
      }, { status: 500 });
    }
    
    console.log('🔍 Notifications API: Session check', { 
      hasSession: !!session, 
      hasUser: !!session?.user, 
      userId: session?.user?.id 
    });
    
    if (!session?.user?.id) {
      console.log('❌ Notifications API: Unauthorized - no session or user ID');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const type = searchParams.get('type');

    type WhereType = {
      userId: string;
      read?: boolean;
      type?: string;
      OR: Array<{ expiresAt: null | { gt: Date } }>;
    };
    
    const where: WhereType = {
      userId: session.user.id,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
    };

    if (unreadOnly) {
      where.read = false;
    }

    if (type) {
      where.type = type;
    }

    console.log('🔍 Notifications API: About to query database', { where, page, limit });
    
    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: where as any,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.notification.count({ where: where as any }),
      prisma.notification.count({
        where: {
          userId: session.user.id,
          read: false,
        },
      }),
    ]);
    
    console.log('✅ Notifications API: Database query successful', { 
      notificationsCount: notifications.length, 
      total, 
      unreadCount 
    });

    // Parse JSON strings
    const parsedNotifications = notifications.map(n => ({
      ...n,
      data: n.data ? JSON.parse(n.data) : {},
      channels: n.channels ? JSON.parse(n.channels) : [],
    }));

    return NextResponse.json({
      notifications: parsedNotifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      unreadCount,
    });
  } catch (error) {
    console.error('❌ Notifications API: Error occurred:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

