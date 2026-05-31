import { NextRequest, NextResponse } from 'next/server';
import { createRouteClient, createServiceClient } from '@/lib/supabase/server';
import { generatePDF } from '@/lib/pdfshift';
import { wrapWithBranding } from '@/lib/document-templates';

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { proposalId } = await req.json();

    if (!proposalId) {
      return NextResponse.json({ error: 'proposalId is required' }, { status: 400 });
    }

    const serviceClient = createServiceClient();

    // Fetch proposal
    const { data: proposal, error: proposalError } = await serviceClient
      .from('proposals')
      .select('*')
      .eq('id', proposalId)
      .eq('user_id', user.id)
      .single();

    if (proposalError || !proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    // Fetch branding
    const { data: branding } = await serviceClient
      .from('freelancer_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const brandingConfig = branding || {};

    const docTypes = ['proposal', 'contract', 'invoice'] as const;
    const urls: Record<string, string> = {};

    for (const docType of docTypes) {
      const htmlContent = proposal[`${docType}_html`];
      if (!htmlContent) continue;

      const fullHtml = wrapWithBranding(htmlContent, brandingConfig, docType);
      const pdfBuffer = await generatePDF(fullHtml);

      const filePath = `${user.id}/${proposalId}/${docType}.pdf`;
      const { error: uploadError } = await serviceClient.storage
        .from('pdfs')
        .upload(filePath, pdfBuffer, {
          contentType: 'application/pdf',
          upsert: true,
        });

      if (uploadError) {
        console.error(`Upload error for ${docType}:`, uploadError);
        continue;
      }

      const { data: publicUrlData } = serviceClient.storage.from('pdfs').getPublicUrl(filePath);
      urls[`${docType}_pdf_url`] = publicUrlData.publicUrl;
    }

    // Update proposal with PDF URLs
    await serviceClient.from('proposals').update(urls).eq('id', proposalId);

    return NextResponse.json({ success: true, urls });
  } catch (err) {
    console.error('PDF generation error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
