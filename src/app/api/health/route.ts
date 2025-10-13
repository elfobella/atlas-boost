import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Health check endpoint to verify environment configuration
 * Access: /api/health
 */
export async function GET() {
  try {
    const checks = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      checks: {
        env_vars: {
          AUTH_SECRET: !!process.env.AUTH_SECRET,
          NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
          DATABASE_URL: !!process.env.DATABASE_URL,
          STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
          GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
          DISCORD_CLIENT_ID: !!process.env.DISCORD_CLIENT_ID,
          PUSHER_APP_ID: !!process.env.PUSHER_APP_ID,
          NEXT_PUBLIC_PUSHER_KEY: !!process.env.NEXT_PUBLIC_PUSHER_KEY,
        },
        database: {
          connected: false,
          error: null as string | null
        },
        auth: {
          configured: false,
          error: null as string | null
        }
      }
    };

    // Test database connection
    try {
      await prisma.$connect();
      await prisma.user.count();
      checks.checks.database.connected = true;
      console.log('✅ Database connection: OK');
    } catch (dbError) {
      checks.checks.database.error = dbError instanceof Error ? dbError.message : 'Unknown error';
      console.error('❌ Database connection: FAILED', dbError);
    } finally {
      await prisma.$disconnect();
    }

    // Check auth configuration
    try {
      const { auth } = await import('@/lib/auth');
      if (typeof auth === 'function') {
        checks.checks.auth.configured = true;
        console.log('✅ Auth configuration: OK');
      }
    } catch (authError) {
      checks.checks.auth.error = authError instanceof Error ? authError.message : 'Unknown error';
      console.error('❌ Auth configuration: FAILED', authError);
    }

    // Determine overall health status
    const allEnvVarsPresent = Object.values(checks.checks.env_vars).every(v => v === true);
    const healthy = checks.checks.database.connected && 
                   checks.checks.auth.configured && 
                   allEnvVarsPresent;

    return NextResponse.json({
      status: healthy ? 'healthy' : 'unhealthy',
      ...checks
    }, { 
      status: healthy ? 200 : 503 
    });

  } catch (error) {
    console.error('❌ Health check failed:', error);
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

