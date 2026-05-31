'use client';

import { useState } from 'react';

interface PaymentGateProps {
  proposalId: string;
  gatePaymentStatus: string;
  subscriptionStatus: string;
  children: React.ReactNode;
}

export default function PaymentGate({
  proposalId,
  gatePaymentStatus,
  subscriptionStatus,
  children,
}: PaymentGateProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  const isUnlocked =
    gatePaymentStatus === 'paid' || subscriptionStatus === 'unlimited';

  const handleCheckout = async (type: 'per_proposal' | 'monthly') => {
    setLoading(type);
    setError('');

    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, proposalId }),
      });

      const json = await res.json();

      if (json.url) {
        window.location.href = json.url;
      } else {
        setError(json.error || 'Failed to create checkout');
        setLoading(null);
      }
    } catch {
      setError('Network error. Please try again.');
      setLoading(null);
    }
  };

  if (isUnlocked) {
    return <>{children}</>;
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-8 text-center">
      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-2">Unlock PDF Downloads & Sharing</h3>
      <p className="text-gray-500 mb-8">
        Download PDFs and get a shareable client link to collect payment.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <div className="bg-white rounded-xl border-2 border-blue-600 p-6 w-full sm:w-64">
          <div className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-1">
            This Proposal
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">$9</div>
          <div className="text-sm text-gray-500 mb-4">one-time</div>
          <ul className="text-sm text-gray-600 space-y-1 mb-5 text-left">
            <li className="flex items-center gap-2"><span className="text-green-500">✓</span> PDF downloads</li>
            <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Client share link</li>
            <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Invoice payment</li>
          </ul>
          <button
            onClick={() => handleCheckout('per_proposal')}
            disabled={loading !== null}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading === 'per_proposal' ? 'Loading...' : 'Unlock for $9'}
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 w-full sm:w-64">
          <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Unlimited
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            $19<span className="text-lg font-normal text-gray-400">/mo</span>
          </div>
          <div className="text-sm text-gray-500 mb-4">all proposals</div>
          <ul className="text-sm text-gray-600 space-y-1 mb-5 text-left">
            <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Unlimited PDFs</li>
            <li className="flex items-center gap-2"><span className="text-green-500">✓</span> All proposals</li>
            <li className="flex items-center gap-2"><span className="text-green-500">✓</span> White-label branding</li>
          </ul>
          <button
            onClick={() => handleCheckout('monthly')}
            disabled={loading !== null}
            className="w-full border border-gray-300 text-gray-700 py-2.5 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            {loading === 'monthly' ? 'Loading...' : 'Subscribe $19/mo'}
          </button>
        </div>
      </div>
    </div>
  );
}
