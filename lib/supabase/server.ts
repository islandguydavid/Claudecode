import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

function getCookieAdapter() {
  const cookieStore = cookies();
  return {
    get(name: string) {
      return cookieStore.get(name)?.value;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    set(name: string, value: string, options: any) {
      try {
        cookieStore.set(name, value, options);
      } catch {
        // Server Components can't set cookies
      }
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    remove(name: string, options: any) {
      try {
        cookieStore.set(name, '', options);
      } catch {
        // Server Components can't set cookies
      }
    },
  };
}

export function createRouteClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: getCookieAdapter() }
  );
}

export function createServerComponentClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: getCookieAdapter() }
  );
}

export const createServiceClient = () =>
  createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
