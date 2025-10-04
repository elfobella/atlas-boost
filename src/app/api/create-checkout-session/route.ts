import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Request body received:', body);
    
    const { 
      gameId, 
      gameName, 
      serviceId, 
      serviceName, 
      currentRank, 
      targetRank, 
      price, 
      userId 
    } = body;

    // Validate required fields
    if (!gameId || !gameName || !serviceId || !serviceName || !currentRank || !targetRank || !price) {
      console.error('Missing required fields:', { gameId, gameName, serviceId, serviceName, currentRank, targetRank, price });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Log Stripe configuration
    console.log('Stripe configuration:', {
      hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
      secretKeyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 7) + '...'
    });

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'try',
            product_data: {
              name: `${gameName} ${serviceName}`,
              description: `${currentRank} → ${targetRank} Boost`,
              images: [gameId === 'league-of-legends' ? `${request.nextUrl.origin}/images/LoL.jpeg` : `${request.nextUrl.origin}/images/Valorant.jpeg`],
            },
            unit_amount: price * 100, // Convert to kuruş (Turkish currency)
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${request.nextUrl.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/games/${gameId}/services/${serviceId}/checkout`,
      customer_email: userId,
      metadata: {
        gameId,
        gameName,
        serviceId,
        serviceName,
        currentRank,
        targetRank,
        userId,
      },
    });

    console.log('Stripe session created:', {
      id: session.id,
      url: session.url,
      status: session.status
    });

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    
    // More detailed error information
    let errorMessage = 'Failed to create checkout session';
    let errorDetails = '';
    
    if (error instanceof Error) {
      errorDetails = error.message;
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
