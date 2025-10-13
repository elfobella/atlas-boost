import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test Prisma Client connection
    await prisma.$connect();
    console.log('✅ Prisma Client connected successfully');
    
    // Test a simple query
    const userCount = await prisma.user.count();
    console.log('✅ User count query successful:', userCount);
    
    // Test notification table
    const notificationCount = await prisma.notification.count();
    console.log('✅ Notification count query successful:', notificationCount);
    
    return NextResponse.json({
      status: 'success',
      message: 'Database connection working',
      data: {
        userCount,
        notificationCount,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Database test failed:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    
    return NextResponse.json(
      {
        status: 'error',
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
