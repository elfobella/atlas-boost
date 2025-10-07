import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
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
  try {
    switch (event.type) {
      case 'checkout.session.completed':
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

  // TODO: Save order to database
  // const order = await db.boostOrders.create({
  //   stripeSessionId: session.id,
  //   game: session.metadata?.game,
  //   currentRank: session.metadata?.currentRank,
  //   currentDivision: session.metadata?.currentDivision,
  //   targetRank: session.metadata?.targetRank,
  //   targetDivision: session.metadata?.targetDivision,
  //   price: (session.amount_total || 0) / 100,
  //   customerEmail: session.customer_email,
  //   paymentStatus: 'succeeded',
  //   orderStatus: 'pending',
  //   paidAt: new Date()
  // });

  // TODO: Send confirmation email
  // await sendOrderConfirmationEmail(session.customer_email, order);
}

// Handle successful payment intent
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('✅ Payment intent succeeded:', paymentIntent.id);
  
  // TODO: Update payment status in database
  // await db.boostOrders.updateMany({
  //   where: { stripePaymentIntentId: paymentIntent.id },
  //   data: { paymentStatus: 'succeeded' }
  // });
}

// Handle failed payment
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('❌ Payment intent failed:', paymentIntent.id);
  console.log('Failure reason:', paymentIntent.last_payment_error?.message);

  // TODO: Update order status
  // await db.boostOrders.updateMany({
  //   where: { stripePaymentIntentId: paymentIntent.id },
  //   data: { paymentStatus: 'failed' }
  // });

  // TODO: Send failure notification email
}

// Handle refund
async function handleChargeRefunded(charge: Stripe.Charge) {
  console.log('💰 Charge refunded:', charge.id);
  console.log('Refund amount:', charge.amount_refunded);

  // TODO: Update order status
  // await db.boostOrders.updateMany({
  //   where: { stripePaymentIntentId: charge.payment_intent as string },
  //   data: { paymentStatus: 'refunded', orderStatus: 'cancelled' }
  // });
}
