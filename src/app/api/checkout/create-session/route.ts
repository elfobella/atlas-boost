import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      game, 
      currentRank, 
      currentDivision, 
      targetRank, 
      targetDivision, 
      price, 
      customerEmail 
    } = body;

    // Validation
    if (!game || !currentRank || !targetRank || !price) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Game display names
    const gameNames: Record<string, string> = {
      lol: 'League of Legends',
      valorant: 'Valorant'
    };

    // Product description
    const productName = `${gameNames[game]} Rank Boost`;
    const productDescription = `Boost from ${currentRank} ${currentDivision || ''} to ${targetRank} ${targetDivision || ''}`.trim();

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'try',
            product_data: {
              name: productName,
              description: productDescription,
              metadata: {
                game,
                currentRank,
                currentDivision: currentDivision?.toString() || '',
                targetRank,
                targetDivision: targetDivision?.toString() || ''
              }
            },
            unit_amount: Math.round(price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/games/rank-selector`,
      customer_email: customerEmail,
      metadata: {
        game,
        currentRank,
        currentDivision: currentDivision?.toString() || '',
        targetRank,
        targetDivision: targetDivision?.toString() || '',
        price: price.toString()
      },
      // Auto tax calculation (optional)
      automatic_tax: {
        enabled: false,
      },
      // Invoice creation
      invoice_creation: {
        enabled: true,
      },
    });

    return NextResponse.json({ 
      sessionId: session.id, 
      url: session.url 
    });
  } catch (error: unknown) {
    console.error('Checkout session error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create checkout session';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
