// Shared Supabase clients + env helpers for all edge functions.
// Same import + service-role pattern as delete-account/index.ts.
import { createClient, type SupabaseClient } from 'jsr:@supabase/supabase-js@2';

// Returns the names of any env vars in `names` that are missing/empty.
// Use this to short-circuit into a 503 "not configured" reply before doing work.
export function missingEnv(names: string[]): string[] {
  return names.filter((n) => {
    const v = Deno.env.get(n);
    return v === undefined || v === null || v === '';
  });
}

export function env(name: string): string | undefined {
  const v = Deno.env.get(name);
  return v === '' ? undefined : v ?? undefined;
}

// Service-role client — bypasses RLS. Used for all writes from trusted
// server-side function code (payments, moderation_queue, reading push tokens).
export function adminClient(): SupabaseClient {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );
}

// Resolves the calling user from THEIR JWT (anon-key client + bearer token),
// exactly like delete-account. Returns null if there is no valid session.
export async function getUser(
  req: Request,
): Promise<{ id: string; email?: string } | null> {
  const authHeader = req.headers.get('Authorization') ?? '';
  const jwt = authHeader.replace('Bearer ', '').trim();
  if (!jwt) return null;

  const userClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: `Bearer ${jwt}` } } },
  );
  const { data, error } = await userClient.auth.getUser(jwt);
  if (error || !data?.user) return null;
  return { id: data.user.id, email: data.user.email ?? undefined };
}

// A Supabase client scoped to the CALLER's JWT — so RLS + SECURITY DEFINER
// helpers (e.g. can_notify) evaluate as that user, not the service role.
export function callerClient(req: Request): SupabaseClient {
  const jwt = (req.headers.get('Authorization') ?? '').replace('Bearer ', '').trim();
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: `Bearer ${jwt}` } } },
  );
}
