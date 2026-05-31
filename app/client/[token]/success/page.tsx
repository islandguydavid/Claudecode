'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface Profile {
  business_name?: string;
  logo_url?: string;
  primary_color?: string;
  thank_you_message?: string;
}

export default function PaymentSuccessPage({ params }: { params: { token: string } }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const loadData = async () => {
      const { data: prop } = await supabase
        .from('proposals')
        .select('user_id, client_name')
        .eq('share_token', params.token)
        .single();

      if (prop) {
        const { data: prof } = await supabase
          .from('freelancer_profiles')
          .select('business_name, logo_url, primary_color, thank_you_message')
          .eq('user_id', prop.user_id)
          .single();
        setProfile(prof || null);
      }
      setLoading(false);
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.token]);

  const primaryColor = profile?.primary_color || '#2563EB';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
        {profile?.logo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.logo_url}
            alt="Logo"
            className="h-12 object-contain mx-auto mb-6"
          />
        )}

        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: `${primaryColor}15` }}
        >
          <svg
            className="w-8 h-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke={primaryColor}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-gray-500 mb-4">
          {profile?.thank_you_message ||
            'Thank you for your payment. A confirmation has been sent to your email.'}
        </p>

        <Link
          href={`/client/${params.token}`}
          className="inline-block mt-4 text-sm font-medium hover:underline"
          style={{ color: primaryColor }}
        >
          View your documents
        </Link>
      </div>
    </div>
  );
}
