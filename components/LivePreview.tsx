'use client';

interface BrandingValues {
  business_name?: string;
  tagline?: string;
  website_url?: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  bg_color?: string;
  font_choice?: string;
  custom_footer?: string;
}

export default function LivePreview({ values }: { values: BrandingValues }) {
  const primary = values.primary_color || '#2563EB';
  const secondary = values.secondary_color || '#64748B';
  const bg = values.bg_color || '#FFFFFF';
  const font = values.font_choice || 'Inter';

  return (
    <div className="sticky top-6">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Live Preview
      </h3>
      <div
        className="rounded-xl border border-gray-200 overflow-hidden shadow-sm"
        style={{ backgroundColor: bg, fontFamily: font }}
      >
        {/* Header */}
        <div
          style={{ borderBottom: `3px solid ${primary}`, padding: '20px 24px' }}
          className="flex items-center gap-4"
        >
          {values.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={values.logo_url} alt="Logo" style={{ maxHeight: 48, maxWidth: 160, objectFit: 'contain' }} />
          ) : (
            <div
              style={{
                width: 48,
                height: 48,
                background: `${primary}22`,
                border: `2px dashed ${primary}`,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                color: primary,
              }}
            >
              LOGO
            </div>
          )}
          <div>
            <div style={{ color: primary, fontWeight: 700, fontSize: 18 }}>
              {values.business_name || 'Your Business Name'}
            </div>
            {values.tagline && (
              <div style={{ color: secondary, fontSize: 12, marginTop: 2 }}>{values.tagline}</div>
            )}
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: secondary, fontWeight: 600 }}>
              INVOICE
            </div>
            <div style={{ color: primary, fontWeight: 700, fontSize: 14 }}>INV-2024-001</div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '16px 24px' }}>
          {/* Invoice details row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: 12 }}>
            <div>
              <div style={{ color: secondary, fontWeight: 600, marginBottom: 2 }}>BILLED TO</div>
              <div style={{ fontWeight: 600 }}>Sample Client Inc.</div>
              <div style={{ color: secondary }}>client@example.com</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: secondary, fontWeight: 600, marginBottom: 2 }}>DATE</div>
              <div>May 30, 2026</div>
              <div style={{ color: secondary }}>Due: June 30, 2026</div>
            </div>
          </div>

          {/* Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr>
                {['Description', 'Qty', 'Rate', 'Amount'].map((h) => (
                  <th
                    key={h}
                    style={{
                      background: primary,
                      color: 'white',
                      padding: '8px 10px',
                      textAlign: 'left',
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '8px 10px', borderBottom: `1px solid ${secondary}33` }}>Web Development Services</td>
                <td style={{ padding: '8px 10px', borderBottom: `1px solid ${secondary}33` }}>20h</td>
                <td style={{ padding: '8px 10px', borderBottom: `1px solid ${secondary}33` }}>$150</td>
                <td style={{ padding: '8px 10px', borderBottom: `1px solid ${secondary}33` }}>$3,000</td>
              </tr>
              <tr>
                <td colSpan={3} style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600, fontSize: 11, color: secondary }}>
                  Subtotal
                </td>
                <td style={{ padding: '8px 10px', fontWeight: 600 }}>$3,000.00</td>
              </tr>
              <tr>
                <td colSpan={3} style={{ padding: '4px 10px', textAlign: 'right', fontSize: 11, color: secondary }}>
                  HST (13%)
                </td>
                <td style={{ padding: '4px 10px', fontSize: 11, color: secondary }}>$390.00</td>
              </tr>
              <tr>
                <td colSpan={3} style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, borderTop: `2px solid ${primary}` }}>
                  TOTAL DUE
                </td>
                <td style={{ padding: '8px 10px', fontWeight: 700, fontSize: 16, color: primary, borderTop: `2px solid ${primary}` }}>
                  $3,390.00
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div
          style={{
            borderTop: `1px solid ${secondary}44`,
            padding: '12px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 11,
            color: secondary,
          }}
        >
          <span>{values.custom_footer || 'Thank you for your business.'}</span>
          {values.website_url && <span>{values.website_url}</span>}
        </div>
      </div>
    </div>
  );
}
