'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Proposal {
  id: string;
  client_name: string;
  freelancer_name: string;
  business_name: string;
  project_type: string;
  proposal_html: string;
  contract_html: string;
  invoice_html: string;
  total_amount: number;
  invoice_paid: boolean;
  share_token: string;
}

interface Profile {
  business_name: string;
  logo_url: string;
  primary_color: string;
  secondary_color: string;
  bg_color: string;
  font_choice: string;
  tagline: string;
  website_url: string;
}

export default function ClientViewPage({ params }: { params: { token: string } }) {
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'proposal' | 'contract' | 'invoice'>('proposal');
  const [payLoading, setPayLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const loadData = async () => {
      const { data: prop, error: propErr } = await supabase
        .from('proposals')
        .select('*')
        .eq('share_token', params.token)
        .single();

      if (propErr || !prop) {
        setError('Proposal not found');
        setLoading(false);
        return;
      }

      setProposal(prop);

      // Mark as viewed
      if (prop.status === 'sent' || prop.status === 'draft') {
        await supabase.from('proposals').update({ status: 'viewed' }).eq('id', prop.id);
      }

      // Load branding
      const { data: prof } = await supabase
        .from('freelancer_profiles')
        .select('*')
        .eq('user_id', prop.user_id)
        .single();

      setProfile(prof || null);
      setLoading(false);
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.token]);

  const handlePay = async () => {
    setPayLoading(true);

    const res = await fetch('/api/create-invoice-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: params.token }),
    });

    const json = await res.json();

    if (json.url) {
      window.location.href = json.url;
    } else {
      setPayLoading(false);
    }
  };

  const formatAmount = (cents: number) =>
    new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(cents / 100);

  const primaryColor = profile?.primary_color || '#2563EB';
  const secondaryColor = profile?.secondary_color || '#64748B';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Not Found</h2>
          <p className="text-gray-500">{error || 'This link is invalid or has expired.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Branding Header */}
      <header
        className="bg-white border-b py-4 px-6"
        style={{ borderColor: `${primaryColor}44` }}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {profile?.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.logo_url} alt="Logo" className="h-10 object-contain" />
            ) : null}
            <div>
              <div className="font-bold text-lg" style={{ color: primaryColor }}>
                {profile?.business_name || proposal.business_name || proposal.freelancer_name}
              </div>
              {profile?.tagline && (
                <div className="text-sm" style={{ color: secondaryColor }}>
                  {profile.tagline}
                </div>
              )}
            </div>
          </div>
          <div className="text-sm text-right" style={{ color: secondaryColor }}>
            <div>Proposal for</div>
            <div className="font-semibold text-gray-900">{proposal.client_name}</div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Invoice Summary Banner */}
        {!proposal.invoice_paid && (
          <div
            className="rounded-xl p-5 mb-6 flex items-center justify-between"
            style={{ background: `${primaryColor}10`, border: `1px solid ${primaryColor}30` }}
          >
            <div>
              <div className="text-sm font-semibold" style={{ color: secondaryColor }}>
                Invoice Total
              </div>
              <div className="text-2xl font-bold" style={{ color: primaryColor }}>
                {proposal.total_amount ? formatAmount(proposal.total_amount) : 'See invoice'}
              </div>
              <div className="text-xs mt-0.5" style={{ color: secondaryColor }}>
                Includes applicable Canadian taxes
              </div>
            </div>
            <button
              onClick={handlePay}
              disabled={payLoading}
              className="px-6 py-3 rounded-xl font-bold text-white text-sm disabled:opacity-50 transition-colors"
              style={{ background: primaryColor }}
            >
              {payLoading ? 'Loading...' : 'Pay Invoice'}
            </button>
          </div>
        )}

        {proposal.invoice_paid && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-green-800">Invoice Paid</div>
              <div className="text-sm text-green-600">Payment received. Thank you!</div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100">
            {(['proposal', 'contract', 'invoice'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-6 py-3 text-sm font-medium capitalize transition-colors"
                style={
                  activeTab === tab
                    ? { borderBottom: `2px solid ${primaryColor}`, color: primaryColor }
                    : { color: '#6b7280' }
                }
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'proposal' && (
              <div
                dangerouslySetInnerHTML={{
                  __html: proposal.proposal_html || '<p style="color:#94a3b8">Document not available.</p>',
                }}
              />
            )}
            {activeTab === 'contract' && (
              <div
                dangerouslySetInnerHTML={{
                  __html: proposal.contract_html || '<p style="color:#94a3b8">Document not available.</p>',
                }}
              />
            )}
            {activeTab === 'invoice' && (
              <div
                dangerouslySetInnerHTML={{
                  __html: proposal.invoice_html || '<p style="color:#94a3b8">Document not available.</p>',
                }}
              />
            )}
          </div>
        </div>

        {/* Website link */}
        {profile?.website_url && (
          <div className="text-center mt-6 text-sm" style={{ color: secondaryColor }}>
            <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
              {profile.website_url}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
