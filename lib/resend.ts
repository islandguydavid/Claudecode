import { Resend } from 'resend';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY || 're_placeholder');
}

export async function sendProposalEmail(
  to: string,
  clientName: string,
  freelancerName: string,
  shareUrl: string,
  customMessage?: string
) {
  const resend = getResend();
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563EB;">You have a new proposal from ${freelancerName}</h2>
      <p>Hello ${clientName},</p>
      <p>${customMessage || `${freelancerName} has sent you a professional proposal, contract, and invoice for review.`}</p>
      <div style="margin: 30px 0;">
        <a href="${shareUrl}" style="background: #2563EB; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600;">
          View Proposal &amp; Documents
        </a>
      </div>
      <p style="color: #64748B; font-size: 14px;">This link will take you to a secure page where you can review the proposal, contract, and invoice.</p>
    </div>
  `;

  const result = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'noreply@example.com',
    to,
    subject: `Proposal from ${freelancerName}`,
    html,
  });

  return result;
}

export async function sendPaymentConfirmation(
  clientEmail: string,
  freelancerEmail: string,
  proposalId: string,
  amount: number,
  thankyouMessage?: string,
  emailSignature?: string
) {
  const resend = getResend();
  const formattedAmount = new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(amount / 100);

  const clientHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #16a34a;">Payment Confirmed!</h2>
      <p>Your payment of <strong>${formattedAmount}</strong> has been successfully processed.</p>
      <p>Invoice ID: ${proposalId}</p>
      ${thankyouMessage ? `<p>${thankyouMessage}</p>` : '<p>Thank you for your business!</p>'}
      ${emailSignature ? `<p style="color: #64748B; font-size: 14px;">${emailSignature}</p>` : ''}
    </div>
  `;

  const freelancerHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #16a34a;">Invoice Paid!</h2>
      <p>Great news! Your invoice has been paid.</p>
      <p>Amount received: <strong>${formattedAmount}</strong></p>
      <p>Invoice ID: ${proposalId}</p>
    </div>
  `;

  await Promise.all([
    resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@example.com',
      to: clientEmail,
      subject: 'Payment Confirmed',
      html: clientHtml,
    }),
    resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@example.com',
      to: freelancerEmail,
      subject: 'Invoice Payment Received',
      html: freelancerHtml,
    }),
  ]);
}
