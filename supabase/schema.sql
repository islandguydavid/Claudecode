-- freelancer_profiles (one per user)
create table freelancer_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null unique,
  -- branding
  business_name text,
  tagline text,
  website_url text,
  logo_url text,
  primary_color text default '#2563EB',
  secondary_color text default '#64748B',
  bg_color text default '#FFFFFF',
  font_choice text default 'Inter',
  -- document defaults
  default_payment_terms text default '50_upfront',
  default_kill_fee integer default 25,
  default_revision_rounds text default '2',
  default_late_penalty numeric default 2.0,
  custom_footer text,
  -- email branding
  email_sender_name text,
  email_signature text,
  thank_you_message text,
  -- subscription
  subscription_status text default 'free', -- free, per_proposal, unlimited
  stripe_customer_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- proposals
create table proposals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  -- form data
  freelancer_name text not null,
  business_name text,
  client_name text not null,
  client_email text not null,
  province text not null,
  project_type text not null,
  project_description text not null,
  fee_structure text not null, -- 'hourly' or 'fixed'
  hourly_rate numeric,
  estimated_hours numeric,
  fixed_price numeric,
  payment_terms text not null,
  revision_rounds text not null,
  kill_fee_pct integer not null,
  start_date date,
  end_date date,
  -- generated content (HTML strings)
  proposal_html text,
  contract_html text,
  invoice_html text,
  -- pdf urls in supabase storage
  proposal_pdf_url text,
  contract_pdf_url text,
  invoice_pdf_url text,
  -- status
  status text default 'draft', -- draft, sent, viewed, paid
  share_token text unique default encode(gen_random_bytes(16), 'hex'),
  -- payment
  stripe_payment_intent_id text,
  stripe_checkout_session_id text,
  gate_payment_status text default 'unpaid', -- unpaid, paid (for the $9 gate)
  invoice_paid boolean default false,
  invoice_paid_at timestamptz,
  total_amount numeric,
  -- timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table freelancer_profiles enable row level security;
alter table proposals enable row level security;

create policy "Users own their profile" on freelancer_profiles for all using (auth.uid() = user_id);
create policy "Users own their proposals" on proposals for all using (auth.uid() = user_id);
create policy "Public can view proposals by share token" on proposals for select using (share_token is not null);
