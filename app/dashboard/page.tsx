'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface Proposal {
  id: string;
  client_name: string;
  project_type: string;
  status: string;
  total_amount: number;
  created_at: string;
  share_token: string;
  gate_payment_status: string;
  invoice_paid: boolean;
}

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  sent: 'bg-blue-100 text-blue-700',
  viewed: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-green-100 text-green-700',
};

export default function DashboardPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const supabase = createClient();

  useEffect(() => {
    loadProposals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProposals = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('proposals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setError('Failed to load proposals');
    } else {
      setProposals(data || []);
    }
    setLoading(false);
  };

  const totalProposals = proposals.length;
  const paidInvoices = proposals.filter((p) => p.invoice_paid).length;
  const totalRevenue = proposals
    .filter((p) => p.invoice_paid)
    .reduce((sum, p) => sum + (p.total_amount || 0), 0);
  const pendingInvoices = proposals.filter((p) => !p.invoice_paid && p.status !== 'draft').length;

  const formatAmount = (cents: number) =>
    new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(cents / 100);

  const copyShareLink = (token: string) => {
    const url = `${window.location.origin}/client/${token}`;
    navigator.clipboard.writeText(url);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link
          href="/dashboard/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          + New Proposal
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Proposals', value: totalProposals, color: 'text-gray-900' },
          { label: 'Paid Invoices', value: paidInvoices, color: 'text-green-600' },
          { label: 'Total Revenue', value: formatAmount(totalRevenue), color: 'text-blue-600' },
          { label: 'Pending Invoices', value: pendingInvoices, color: 'text-yellow-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="text-sm text-gray-500 mb-1">{stat.label}</div>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">All Proposals</h2>
        </div>

        {loading ? (
          <div className="px-6 py-12 text-center text-gray-400">Loading...</div>
        ) : error ? (
          <div className="px-6 py-12 text-center text-red-500">{error}</div>
        ) : proposals.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-400 mb-4">No proposals yet.</p>
            <Link
              href="/dashboard/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Create your first proposal
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {['Client', 'Project Type', 'Status', 'Amount', 'Created', 'Actions'].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {proposals.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{p.client_name}</td>
                  <td className="px-6 py-4 text-gray-500 capitalize">{p.project_type.replace('_', ' ')}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[p.status] || STATUS_STYLES.draft}`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700 font-medium">
                    {p.total_amount ? formatAmount(p.total_amount) : '—'}
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">
                    {new Date(p.created_at).toLocaleDateString('en-CA')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/proposals/${p.id}`}
                        className="text-blue-600 text-sm font-medium hover:underline"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => copyShareLink(p.share_token)}
                        className="text-gray-500 text-sm font-medium hover:text-gray-700"
                      >
                        Copy Link
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
