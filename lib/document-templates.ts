export interface BrandingConfig {
  business_name?: string | null;
  tagline?: string | null;
  website_url?: string | null;
  logo_url?: string | null;
  primary_color?: string | null;
  secondary_color?: string | null;
  bg_color?: string | null;
  font_choice?: string | null;
  custom_footer?: string | null;
}

export function wrapWithBranding(
  content: string,
  branding: BrandingConfig,
  docType: 'proposal' | 'contract' | 'invoice'
): string {
  const primaryColor = branding.primary_color || '#2563EB';
  const secondaryColor = branding.secondary_color || '#64748B';
  const bgColor = branding.bg_color || '#FFFFFF';
  const font = branding.font_choice || 'Inter';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(font)}:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * { font-family: '${font}', Arial, sans-serif; box-sizing: border-box; }
    body { background: ${bgColor}; margin: 0; padding: 40px; color: #1a1a1a; }
    .header { border-bottom: 3px solid ${primaryColor}; padding-bottom: 20px; margin-bottom: 30px; display: flex; align-items: center; gap: 20px; }
    .logo { max-height: 60px; max-width: 200px; object-fit: contain; }
    .business-name { color: ${primaryColor}; font-size: 24px; font-weight: 700; }
    .tagline { color: ${secondaryColor}; font-size: 14px; margin-top: 4px; }
    h1, h2, h3 { color: ${primaryColor}; }
    h1 { font-size: 28px; }
    h2 { font-size: 22px; border-bottom: 1px solid ${secondaryColor}; padding-bottom: 8px; margin-top: 32px; }
    h3 { font-size: 18px; }
    p { line-height: 1.6; }
    .footer { border-top: 1px solid ${secondaryColor}; margin-top: 40px; padding-top: 20px; font-size: 12px; color: ${secondaryColor}; display: flex; justify-content: space-between; align-items: center; }
    .footer a { color: ${primaryColor}; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: ${primaryColor}; color: white; padding: 10px 12px; text-align: left; font-weight: 600; }
    td { padding: 8px 12px; border-bottom: 1px solid #e2e8f0; }
    tr:nth-child(even) td { background: #f8fafc; }
    .total-row td { font-weight: 700; font-size: 16px; border-top: 2px solid ${primaryColor}; border-bottom: none; }
    .section { margin: 24px 0; padding: 20px; background: #f8fafc; border-left: 4px solid ${primaryColor}; border-radius: 0 8px 8px 0; }
    .highlight { color: ${primaryColor}; font-weight: 600; }
    .signature-block { margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
    .sig-line { border-top: 1px solid #333; padding-top: 8px; margin-top: 60px; font-size: 12px; color: ${secondaryColor}; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600; }
    .amount-display { font-size: 20px; font-weight: 700; color: ${primaryColor}; }
    .doc-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: ${secondaryColor}; font-weight: 600; margin-bottom: 4px; }
  </style>
</head>
<body>
  <div class="header">
    ${branding.logo_url ? `<img src="${branding.logo_url}" class="logo" alt="${branding.business_name || 'Logo'}" />` : ''}
    <div>
      <div class="business-name">${branding.business_name || 'Your Business'}</div>
      ${branding.tagline ? `<div class="tagline">${branding.tagline}</div>` : ''}
    </div>
    <div style="margin-left: auto; text-align: right;">
      <div class="doc-label">${docType.toUpperCase()}</div>
    </div>
  </div>
  ${content}
  <div class="footer">
    <span>${branding.custom_footer || 'Thank you for your business.'}</span>
    ${branding.website_url ? `<span><a href="${branding.website_url}">${branding.website_url}</a></span>` : ''}
  </div>
</body>
</html>`;
}
