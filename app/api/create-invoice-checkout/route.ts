import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: 'Share token is required' }, { status: 400 });
    }

    const serviceClient = createServiceClient();
    const { data: proposal, error } = await serviceClient
      .from('proposals')
      .select('*')
      .eq('share_token', token)
      .single();

    if (error || !proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    if (proposal.invoice_paid) {
      return NextResponse.json({ error: 'Invoice already paid' }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'cad',
            unit_amount: proposal.total_amount || 0,
            product_data: {
              name: `Invoice - ${proposal.project_type}`,
              description: `Freelance services for ${proposal.client_name}`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        proposalId: proposal.id,
        type: 'invoice',
        shareToken: token,
      },
      customer_email: proposal.client_email,
      success_url: `${appUrl}/client/${token}/success`,
      cancel_url: `${appUrl}/client/${token}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Invoice checkout error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
