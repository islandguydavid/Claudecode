import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createRouteClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, proposalId } = await req.json();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    if (type === 'per_proposal') {
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [
          {
            price: process.env.STRIPE_PRICE_PER_PROPOSAL!,
            quantity: 1,
          },
        ],
        metadata: {
          userId: user.id,
          proposalId,
          type: 'gate',
          gateType: 'per_proposal',
        },
        success_url: `${appUrl}/dashboard/proposals/${proposalId}?gate=success`,
        cancel_url: `${appUrl}/dashboard/proposals/${proposalId}`,
      });

      return NextResponse.json({ url: session.url });
    } else if (type === 'monthly') {
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        line_items: [
          {
            price: process.env.STRIPE_PRICE_MONTHLY!,
            quantity: 1,
          },
        ],
        metadata: {
          userId: user.id,
          type: 'gate',
          gateType: 'monthly',
        },
        success_url: `${appUrl}/dashboard?subscription=success`,
        cancel_url: `${appUrl}/dashboard`,
      });

      return NextResponse.json({ url: session.url });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (err) {
    console.error('Checkout error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
