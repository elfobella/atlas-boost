import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/lib/stripe';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe signature' },
      { status: 400 }
    );
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || 'whsec_your_webhook_secret_here'
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        
        // Create order in database
        await prisma.order.create({
          data: {
            id: session.id,
            userId: session.metadata?.userId || '',
            gameId: session.metadata?.gameId || '',
            serviceId: session.metadata?.serviceId || '',
            currentRankId: session.metadata?.currentRank || '',
            targetRankId: session.metadata?.targetRank || '',
            status: 'PENDING',
            price: session.amount_total || 0,
            estimatedTime: '1-3 gün',
            notes: `Payment completed for ${session.metadata?.gameName} ${session.metadata?.serviceName}`,
          },
        });
        
        console.log('Order created:', session.id);
        break;

      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('Payment succeeded:', paymentIntent.id);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
