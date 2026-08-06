// Shared CORS + JSON response helpers for all edge functions.
// Matches the delete-account style (plain JSON responses, Content-Type set
// on every reply) and adds the CORS preflight handling the mobile/web clients
// need when calling functions directly from the browser.

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Standard JSON reply with CORS headers attached.
export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// 503 "not configured" — returned when a required secret is missing so the app
// can safely call a function BEFORE the client supplies API keys, without
// crashing the function or getting an opaque 500.
export function notConfigured(missing: string[]): Response {
  return json(
    {
      error: 'not_configured',
      message:
        'This function is not configured yet. Missing required secret(s): ' +
        missing.join(', '),
      missing,
    },
    503,
  );
}

// Handles the CORS preflight. Returns a Response for OPTIONS, else null.
export function handlePreflight(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  return null;
}
