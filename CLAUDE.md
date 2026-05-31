# FreelanceKit — AI-Powered Proposal, Contract & Invoice Generator

## Overview
FreelanceKit is a full-stack SaaS web application for Canadian freelancers to generate professional proposals, contracts, and invoices using AI. Built with Next.js 14 App Router.

## Tech Stack
- **Framework**: Next.js 14 (App Router, TypeScript)
- **Styling**: Tailwind CSS
- **AI**: Anthropic Claude API (`claude-sonnet-4-5-20251001`) for document generation
- **PDF**: PDFShift API for HTML→PDF conversion
- **Payments**: Stripe (pricing gate + client invoice payment)
- **Database**: Supabase (Postgres + Row Level Security)
- **Storage**: Supabase Storage (logos bucket, pdfs bucket)
- **Auth**: Supabase Auth (email/password)
- **Email**: Resend API

## Project Structure
```
app/
  layout.tsx              Root layout
  page.tsx                Landing/marketing page
  auth/
    login/page.tsx        Email login
    signup/page.tsx       Email signup
    callback/route.ts     Supabase auth callback
  dashboard/
    layout.tsx            Sidebar nav layout
    page.tsx              Dashboard with stats + proposal table
    new/page.tsx          Multi-step intake form
    proposals/[id]/       Single proposal view
    settings/page.tsx     White-label branding settings
  client/
    [token]/page.tsx      Public client view (no auth required)
    [token]/success/      Payment success page
  api/
    generate/             POST: Claude AI document generation
    generate-pdf/         POST: PDFShift PDF generation
    create-checkout/      POST: Stripe gate checkout ($9 or $19/mo)
    create-invoice-checkout/ POST: Stripe invoice payment
    webhooks/stripe/      POST: Stripe webhook handler
    branding/             GET/POST: Freelancer profile

lib/
  supabase/client.ts      Browser Supabase client
  supabase/server.ts      Server Supabase clients
  anthropic.ts            Claude API client
  pdfshift.ts             PDFShift PDF helper
  stripe.ts               Stripe client
  resend.ts               Email helpers
  tax-rates.ts            Canadian provincial tax rates
  document-templates.ts   HTML wrapper with branding

components/
  IntakeForm.tsx          Multi-step proposal intake form
  PaymentGate.tsx         Unlock gate ($9 or $19/mo)
  LivePreview.tsx         Real-time branding preview
  
supabase/
  schema.sql              Database schema + RLS policies
```

## Database Tables
- `freelancer_profiles` — User branding, defaults, subscription status
- `proposals` — All proposal data, generated HTML, PDF URLs, payment status

## Key Features
1. **Multi-step intake form** — 6 steps covering freelancer/client details, project info, fees, terms, timeline
2. **AI generation** — Claude generates proposal, contract, invoice HTML simultaneously
3. **Canadian law** — Contracts reference correct provincial courts and governing law
4. **PDF export** — PDFShift converts branded HTML to A4 PDFs stored in Supabase
5. **Pricing gate** — $9/proposal one-time or $19/month unlimited
6. **Client payment** — Stripe Checkout for invoice payment from public share link
7. **White-label branding** — Logo, colors, fonts, footer applied to all documents
8. **Live preview** — Real-time branding preview on settings page

## Environment Variables
See `.env.example` for all required variables:
- `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` + `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY`
- `PDFSHIFT_API_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` + `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_PER_PROPOSAL` + `STRIPE_PRICE_MONTHLY`
- `RESEND_API_KEY` + `RESEND_FROM_EMAIL`
- `NEXT_PUBLIC_APP_URL`

## Setup Instructions
1. Clone repo, run `npm install`
2. Copy `.env.example` to `.env.local`, fill in values
3. Create Supabase project, run `supabase/schema.sql`
4. Create Supabase Storage buckets: `pdfs` (public), `logos` (public)
5. Create Stripe products: $9 one-time + $19/month subscription
6. Set up Stripe webhook pointing to `/api/webhooks/stripe`
7. Run `npm run dev`

## Commands
```bash
npm run dev     # Development server
npm run build   # Production build
npm run lint    # ESLint
```
