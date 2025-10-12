import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { token, device } = await request.json();

    const preferences = await prisma.notificationPreference.findUnique({
      where: { userId: session.user.id },
    });

    const existingTokens = preferences?.pushTokens 
      ? JSON.parse(preferences.pushTokens) 
      : [];
    
    // Token zaten kayıtlı değilse ekle
    if (!existingTokens.some((t: { token: unknown }) => JSON.stringify(t.token) === JSON.stringify(token))) {
      existingTokens.push({
        token,
        device,
        addedAt: new Date().toISOString(),
      });

      await prisma.notificationPreference.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          pushTokens: JSON.stringify(existingTokens),
        },
        update: {
          pushTokens: JSON.stringify(existingTokens),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Save push token error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

