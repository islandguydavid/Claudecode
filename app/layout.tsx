import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FreelanceKit — Proposals, Contracts & Invoices',
  description:
    'Generate professional proposals, contracts, and invoices powered by AI. Built for Canadian freelancers.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
