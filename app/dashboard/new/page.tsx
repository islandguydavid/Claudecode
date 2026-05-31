'use client';

import { useEffect, useState } from 'react';
import IntakeForm from '@/components/IntakeForm';
import { createClient } from '@/lib/supabase/client';

interface ProfileDefaults {
  default_payment_terms?: string;
  default_kill_fee?: number;
  default_revision_rounds?: string;
  business_name?: string;
}

export default function NewProposalPage() {
  const [defaults, setDefaults] = useState<ProfileDefaults | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const loadDefaults = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from('freelancer_profiles')
          .select(
            'default_payment_terms, default_kill_fee, default_revision_rounds, business_name'
          )
          .eq('user_id', user.id)
          .single();
        setDefaults(data || {});
      }
      setLoading(false);
    };

    loadDefaults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">New Proposal</h1>
        <p className="text-gray-500 mt-1">
          Fill out the form below and AI will generate your proposal, contract, and invoice.
        </p>
      </div>

      <IntakeForm
        defaultValues={
          defaults
            ? {
                business_name: defaults.business_name || undefined,
                payment_terms: defaults.default_payment_terms || '50_upfront',
                kill_fee_pct: defaults.default_kill_fee || 25,
                revision_rounds: defaults.default_revision_rounds || '2',
              }
            : undefined
        }
      />
    </div>
  );
}
