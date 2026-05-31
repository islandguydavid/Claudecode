import { NextRequest, NextResponse } from 'next/server';
import { getAnthropicClient, MODEL } from '@/lib/anthropic';
import { createRouteClient, createServiceClient } from '@/lib/supabase/server';
import { TAX_RATES, PROVINCIAL_COURTS, PROVINCE_NAMES } from '@/lib/tax-rates';

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.json();

    const {
      province,
      fee_structure,
      hourly_rate,
      estimated_hours,
      fixed_price,
      payment_terms,
      revision_rounds,
      kill_fee_pct,
      start_date,
      end_date,
    } = formData;

    // Calculate totals
    const subtotal =
      fee_structure === 'hourly'
        ? (hourly_rate || 0) * (estimated_hours || 0)
        : fixed_price || 0;

    const taxInfo = TAX_RATES[province] || { rate: 0.05, type: 'GST', label: 'GST (5%)' };
    const taxAmount = subtotal * taxInfo.rate;
    const totalWithTax = subtotal + taxAmount;
    const provincialCourt = PROVINCIAL_COURTS[province] || 'the appropriate provincial court';
    const provinceName = PROVINCE_NAMES[province] || province;

    const formDataStr = JSON.stringify({
      ...formData,
      province_name: provinceName,
      subtotal,
      tax_amount: taxAmount,
      total_with_tax: totalWithTax,
    });

    // Generate Proposal
    const proposalResponse = await getAnthropicClient().messages.create({
      model: MODEL,
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `Generate a professional freelance project proposal in clean HTML (no markdown, use inline styles and embedded CSS). Include:
- Header with freelancer name/business (already handled by wrapper, so skip logo/header)
- Executive Summary
- Project Scope & Deliverables
- Timeline (start: ${start_date} to end: ${end_date})
- Investment section (${fee_structure} pricing, total: $${totalWithTax.toFixed(2)} CAD)
- Next Steps / Call to Action
Use professional business language. Make it visually polished with a clean layout. Use only HTML tags and inline styles. Do NOT include <!DOCTYPE>, <html>, <head>, or <body> tags.
Form data: ${formDataStr}`,
        },
      ],
    });

    const proposalHtml =
      proposalResponse.content[0].type === 'text' ? proposalResponse.content[0].text : '';

    // Generate Contract
    const contractResponse = await getAnthropicClient().messages.create({
      model: MODEL,
      max_tokens: 3000,
      messages: [
        {
          role: 'user',
          content: `Generate a legally-worded Canadian freelance services contract in clean HTML (no markdown, inline styles).
Province: ${provinceName} — reference provincial law where applicable.
Must include ALL these clauses:
1. Parties (freelancer & client details)
2. Scope of Work
3. Intellectual Property — all IP transfers to client upon full payment
4. Payment Terms — ${payment_terms}, with 2% per month late payment penalty
5. Kill Fee — ${kill_fee_pct}% of total project value if client cancels after work begins
6. Revision Policy — ${revision_rounds} revision round(s) included; additional revisions billed at hourly rate
7. Confidentiality
8. Limitation of Liability
9. Dispute Resolution — ${provincialCourt} in ${provinceName}
10. Governing Law — laws of the Province of ${provinceName}
11. Signature block for both parties with date lines
Use only HTML tags and inline styles. Do NOT include <!DOCTYPE>, <html>, <head>, or <body> tags.
Form data: ${formDataStr}`,
        },
      ],
    });

    const contractHtml =
      contractResponse.content[0].type === 'text' ? contractResponse.content[0].text : '';

    // Generate Invoice
    const timestamp = Date.now();
    const invoiceResponse = await getAnthropicClient().messages.create({
      model: MODEL,
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `Generate a professional invoice in clean HTML (no markdown, inline styles).
Include:
- Invoice number: INV-${timestamp}
- Invoice date: ${new Date().toLocaleDateString('en-CA')} and due date based on payment terms
- Freelancer and client details
- Line items table with description, quantity, rate, amount
- Subtotal: $${subtotal.toFixed(2)}
- ${taxInfo.label}: $${taxAmount.toFixed(2)}
- TOTAL OWING: $${totalWithTax.toFixed(2)} CAD
- Payment instructions section
- "Thank you for your business" footer
Make it look like a real professional invoice. Use only HTML tags and inline styles. Do NOT include <!DOCTYPE>, <html>, <head>, or <body> tags.
Form data: ${formDataStr}
Tax info: ${JSON.stringify({ ...taxInfo, subtotal, taxAmount, totalWithTax })}`,
        },
      ],
    });

    const invoiceHtml =
      invoiceResponse.content[0].type === 'text' ? invoiceResponse.content[0].text : '';

    // Save to Supabase
    const serviceClient = createServiceClient();
    const { data: proposal, error } = await serviceClient
      .from('proposals')
      .insert({
        user_id: user.id,
        freelancer_name: formData.freelancer_name,
        business_name: formData.business_name,
        client_name: formData.client_name,
        client_email: formData.client_email,
        province: formData.province,
        project_type: formData.project_type,
        project_description: formData.project_description,
        fee_structure: formData.fee_structure,
        hourly_rate: formData.hourly_rate,
        estimated_hours: formData.estimated_hours,
        fixed_price: formData.fixed_price,
        payment_terms: formData.payment_terms,
        revision_rounds: formData.revision_rounds,
        kill_fee_pct: formData.kill_fee_pct,
        start_date: formData.start_date,
        end_date: formData.end_date,
        proposal_html: proposalHtml,
        contract_html: contractHtml,
        invoice_html: invoiceHtml,
        total_amount: Math.round(totalWithTax * 100),
        status: 'draft',
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: 'Failed to save proposal' }, { status: 500 });
    }

    return NextResponse.json({
      id: proposal.id,
      share_token: proposal.share_token,
    });
  } catch (err) {
    console.error('Generate error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
