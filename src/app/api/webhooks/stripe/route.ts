import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { notificationService } from '@/lib/notification-service';
import Stripe from 'stripe';

export async function POST(request: Request) {
  console.log('🎯 Stripe webhook received');
  
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  console.log('📝 Webhook details:', {
    hasBody: !!body,
    hasSignature: !!signature,
    bodyLength: body.length,
  });

  if (!signature) {
    console.error('❌ No signature found in webhook');
    return NextResponse.json(
      { error: 'No signature found' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    if (process.env.STRIPE_WEBHOOK_SECRET) {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } else {
      // For development without webhook secret
      event = JSON.parse(body);
      console.warn('⚠️ Webhook signature verification skipped - STRIPE_WEBHOOK_SECRET not set');
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('⚠️ Webhook signature verification failed:', errorMessage);
    return NextResponse.json(
      { error: `Webhook Error: ${errorMessage}` },
      { status: 400 }
    );
  }

  // Handle the event
  console.log('📦 Processing webhook event:', event.type);
  
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        console.log('💳 Processing checkout.session.completed');
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;

      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentSucceeded(paymentIntent);
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentFailed(failedPayment);
        break;

      case 'charge.refunded':
        const refund = event.data.object as Stripe.Charge;
        await handleChargeRefunded(refund);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// Handle successful checkout
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('✅ Checkout session completed:', session.id);
  console.log('Customer email:', session.customer_email);
  console.log('Amount total:', session.amount_total);
  console.log('Metadata:', session.metadata);

  try {
    // Kullanıcıyı bul veya oluştur
    const user = await prisma.user.findUnique({
      where: { email: session.customer_email || '' }
    });

    if (!user) {
      console.error('❌ User not found for email:', session.customer_email);
      return;
    }

    // Siparişi oluştur
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        stripeSessionId: session.id,
        stripePaymentIntentId: session.payment_intent as string,
        game: session.metadata?.game || '',
        currentRank: session.metadata?.currentRank || '',
        currentDivision: session.metadata?.currentDivision || null,
        targetRank: session.metadata?.targetRank || '',
        targetDivision: session.metadata?.targetDivision || null,
        price: (session.amount_total || 0) / 100,
        currency: session.currency?.toUpperCase() || 'TRY',
        paymentStatus: 'SUCCEEDED',
        orderStatus: 'PAID',
        paidAt: new Date()
      }
    });

    console.log('✅ Order created successfully:', order.id);

    // Send notifications
    console.log('📧 Sending order created notification...');
    await notificationService.notifyOrderCreated(order.id, user.id);
    
    console.log('📧 Sending payment confirmed notification...');
    await notificationService.notifyPaymentConfirmed(order.id, user.id);
    
    console.log('✅ All notifications sent for order:', order.id);
    console.log('ℹ️ Order status: PAID - Available for boosters to claim');
  } catch (error) {
    console.error('❌ Error creating order:', error);
  }
}

// Handle successful payment intent
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('✅ Payment intent succeeded:', paymentIntent.id);
  
  try {
    // Payment status'u güncelle
    const orders = await prisma.order.findMany({
      where: { stripePaymentIntentId: paymentIntent.id },
    });
    
    await prisma.order.updateMany({
      where: { stripePaymentIntentId: paymentIntent.id },
      data: { 
        paymentStatus: 'SUCCEEDED',
        orderStatus: 'PAID',
        paidAt: new Date()
      }
    });
    
    // Send notifications
    for (const order of orders) {
      await notificationService.notifyPaymentConfirmed(order.id, order.userId);
    }
    
    console.log('✅ Payment status updated successfully');
  } catch (error) {
    console.error('❌ Error updating payment status:', error);
  }
}

// Handle failed payment
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('❌ Payment intent failed:', paymentIntent.id);
  console.log('Failure reason:', paymentIntent.last_payment_error?.message);

  try {
    // Order status'u güncelle
    const orders = await prisma.order.findMany({
      where: { stripePaymentIntentId: paymentIntent.id },
    });
    
    await prisma.order.updateMany({
      where: { stripePaymentIntentId: paymentIntent.id },
      data: { 
        paymentStatus: 'FAILED',
        orderStatus: 'CANCELLED'
      }
    });
    
    // Send cancellation notifications
    for (const order of orders) {
      await notificationService.notifyOrderCancelled(
        order.id, 
        order.userId,
        `Ödeme başarısız oldu: ${paymentIntent.last_payment_error?.message || 'Bilinmeyen hata'}`
      );
    }
    
    console.log('✅ Order status updated to failed');
  } catch (error) {
    console.error('❌ Error updating failed payment status:', error);
  }
}

// Handle refund
async function handleChargeRefunded(charge: Stripe.Charge) {
  console.log('💰 Charge refunded:', charge.id);
  console.log('Refund amount:', charge.amount_refunded);

  try {
    // Order status'u güncelle
    const orders = await prisma.order.findMany({
      where: { stripePaymentIntentId: charge.payment_intent as string },
    });
    
    await prisma.order.updateMany({
      where: { stripePaymentIntentId: charge.payment_intent as string },
      data: { 
        paymentStatus: 'REFUNDED', 
        orderStatus: 'CANCELLED' 
      }
    });
    
    // Send refund notifications
    for (const order of orders) {
      await notificationService.notifyOrderCancelled(
        order.id, 
        order.userId,
        'Ödemeniz iade edildi. Para iadeniz 3-5 iş günü içinde hesabınıza yansıyacaktır.'
      );
    }
    
    console.log('✅ Order status updated to refunded');
  } catch (error) {
    console.error('❌ Error updating refund status:', error);
  }
}
