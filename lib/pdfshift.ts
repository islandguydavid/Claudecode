export async function generatePDF(htmlContent: string): Promise<ArrayBuffer> {
  const response = await fetch('https://api.pdfshift.io/v3/convert/pdf', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`api:${process.env.PDFSHIFT_API_KEY}`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      source: htmlContent,
      landscape: false,
      use_print: false,
      format: 'A4',
      margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`PDFShift error ${response.status}: ${text}`);
  }

  return response.arrayBuffer();
}
