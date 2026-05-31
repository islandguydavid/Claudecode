import { NextRequest, NextResponse } from 'next/server';
import { createRouteClient, createServiceClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createRouteClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const serviceClient = createServiceClient();
    const { data: profile } = await serviceClient
      .from('freelancer_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    return NextResponse.json({ profile: profile || null });
  } catch (err) {
    console.error('Branding GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const serviceClient = createServiceClient();

    // Check if profile exists
    const { data: existing } = await serviceClient
      .from('freelancer_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    const profileData = {
      business_name: body.business_name,
      tagline: body.tagline,
      website_url: body.website_url,
      logo_url: body.logo_url,
      primary_color: body.primary_color,
      secondary_color: body.secondary_color,
      bg_color: body.bg_color,
      font_choice: body.font_choice,
      default_payment_terms: body.default_payment_terms,
      default_kill_fee: body.default_kill_fee,
      default_revision_rounds: body.default_revision_rounds,
      default_late_penalty: body.default_late_penalty,
      custom_footer: body.custom_footer,
      email_sender_name: body.email_sender_name,
      email_signature: body.email_signature,
      thank_you_message: body.thank_you_message,
      updated_at: new Date().toISOString(),
    };

    let result;
    if (existing) {
      result = await serviceClient
        .from('freelancer_profiles')
        .update(profileData)
        .eq('user_id', user.id)
        .select()
        .single();
    } else {
      result = await serviceClient
        .from('freelancer_profiles')
        .insert({ ...profileData, user_id: user.id })
        .select()
        .single();
    }

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({ profile: result.data });
  } catch (err) {
    console.error('Branding POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
