'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import PaymentGate from '@/components/PaymentGate';
import Link from 'next/link';

interface Proposal {
  id: string;
  client_name: string;
  client_email: string;
  project_type: string;
  status: string;
  total_amount: number;
  proposal_html: string;
  contract_html: string;
  invoice_html: string;
  proposal_pdf_url: string;
  contract_pdf_url: string;
  invoice_pdf_url: string;
  share_token: string;
  gate_payment_status: string;
  invoice_paid: boolean;
  created_at: string;
}

interface Profile {
  subscription_status: string;
}

export default function ProposalDetailPage({ params }: { params: { id: string } }) {
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'proposal' | 'contract' | 'invoice'>('proposal');
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [pdfError, setPdfError] = useState('');
  const [copyMsg, setCopyMsg] = useState('');
  const supabase = createClient();

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const loadData = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError('Not authenticated');
      setLoading(false);
      return;
    }

    const [{ data: prop, error: propErr }, { data: prof }] = await Promise.all([
      supabase.from('proposals').select('*').eq('id', params.id).eq('user_id', user.id).single(),
      supabase.from('freelancer_profiles').select('subscription_status').eq('user_id', user.id).single(),
    ]);

    if (propErr || !prop) {
      setError('Proposal not found');
    } else {
      setProposal(prop);
    }
    setProfile(prof || { subscription_status: 'free' });
    setLoading(false);
  };

  const generatePdfs = async () => {
    if (!proposal) return;
    setGeneratingPdf(true);
    setPdfError('');

    const res = await fetch('/api/generate-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proposalId: proposal.id }),
    });

    const json = await res.json();

    if (res.ok) {
      await loadData();
    } else {
      setPdfError(json.error || 'PDF generation failed');
    }
    setGeneratingPdf(false);
  };

  const copyShareLink = () => {
    if (!proposal) return;
    const url = `${window.location.origin}/client/${proposal.share_token}`;
    navigator.clipboard.writeText(url);
    setCopyMsg('Copied!');
    setTimeout(() => setCopyMsg(''), 2000);
  };

  const formatAmount = (cents: number) =>
    new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(cents / 100);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500">{error || 'Proposal not found'}</p>
        <Link href="/dashboard" className="text-blue-600 mt-4 inline-block hover:underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const tabs = ['proposal', 'contract', 'invoice'] as const;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/dashboard" className="text-gray-400 text-sm hover:text-gray-600">
            ← Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">
            Proposal for {proposal.client_name}
          </h1>
          <p className="text-gray-500 text-sm">
            {proposal.project_type.replace('_', ' ')} ·{' '}
            {proposal.total_amount ? formatAmount(proposal.total_amount) : ''} ·{' '}
            {new Date(proposal.created_at).toLocaleDateString('en-CA')}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${
            proposal.invoice_paid
              ? 'bg-green-100 text-green-700'
              : proposal.status === 'sent'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {proposal.invoice_paid ? 'Paid' : proposal.status}
        </span>
      </div>

      {/* Payment Gate */}
      <div className="mb-6">
        <PaymentGate
          proposalId={proposal.id}
          gatePaymentStatus={proposal.gate_payment_status}
          subscriptionStatus={profile?.subscription_status || 'free'}
        >
          <div className="bg-white rounded-xl border border-gray-100 p-5 flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-3 flex-wrap">
              {/* PDF Downloads */}
              {proposal.proposal_pdf_url ? (
                <>
                  <a
                    href={proposal.proposal_pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    ↓ Proposal PDF
                  </a>
                  <a
                    href={proposal.contract_pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    ↓ Contract PDF
                  </a>
                  <a
                    href={proposal.invoice_pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    ↓ Invoice PDF
                  </a>
                </>
              ) : (
                <button
                  onClick={generatePdfs}
                  disabled={generatingPdf}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {generatingPdf ? 'Generating PDFs...' : '⚡ Generate PDFs'}
                </button>
              )}

              {/* Share Link */}
              <button
                onClick={copyShareLink}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
              >
                {copyMsg || '🔗 Copy Client Link'}
              </button>
            </div>

            {pdfError && <p className="text-red-500 text-sm w-full">{pdfError}</p>}
          </div>
        </PaymentGate>
      </div>

      {/* Document Tabs */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'proposal' && (
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: proposal.proposal_html || '<p class="text-gray-400">No content generated yet.</p>' }}
            />
          )}
          {activeTab === 'contract' && (
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: proposal.contract_html || '<p class="text-gray-400">No content generated yet.</p>' }}
            />
          )}
          {activeTab === 'invoice' && (
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: proposal.invoice_html || '<p class="text-gray-400">No content generated yet.</p>' }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
