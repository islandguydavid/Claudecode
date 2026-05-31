import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createServiceClient } from '@/lib/supabase/server';
import { sendPaymentConfirmation } from '@/lib/resend';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const sig = req.headers.get('stripe-signature');

    if (!sig) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const serviceClient = createServiceClient();

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const metadata = session.metadata || {};

      if (metadata.type === 'invoice') {
        const proposalId = metadata.proposalId;

        const { data: proposal } = await serviceClient
          .from('proposals')
          .select('*, freelancer_profiles(*)')
          .eq('id', proposalId)
          .single();

        await serviceClient
          .from('proposals')
          .update({
            invoice_paid: true,
            invoice_paid_at: new Date().toISOString(),
            status: 'paid',
            stripe_checkout_session_id: session.id,
          })
          .eq('id', proposalId);

        // Send confirmation emails
        if (proposal) {
          try {
            const profile = Array.isArray(proposal.freelancer_profiles)
              ? proposal.freelancer_profiles[0]
              : proposal.freelancer_profiles;

            // Get freelancer email
            const { data: userData } = await serviceClient.auth.admin.getUserById(
              proposal.user_id
            );
            const freelancerEmail = userData?.user?.email;

            if (freelancerEmail) {
              await sendPaymentConfirmation(
                proposal.client_email,
                freelancerEmail,
                proposalId,
                proposal.total_amount || 0,
                profile?.thank_you_message,
                profile?.email_signature
              );
            }
          } catch (emailErr) {
            console.error('Email send error:', emailErr);
          }
        }
      } else if (metadata.type === 'gate') {
        const proposalId = metadata.proposalId;
        const gateType = metadata.gateType;
        const userId = metadata.userId;

        if (gateType === 'per_proposal' && proposalId) {
          await serviceClient
            .from('proposals')
            .update({ gate_payment_status: 'paid' })
            .eq('id', proposalId);
        } else if (gateType === 'monthly' && userId) {
          await serviceClient
            .from('freelancer_profiles')
            .update({ subscription_status: 'unlimited' })
            .eq('user_id', userId);
        }
      }
    } else if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      const customerId = subscription.customer as string;

      await serviceClient
        .from('freelancer_profiles')
        .update({ subscription_status: 'free' })
        .eq('stripe_customer_id', customerId);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
