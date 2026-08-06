// Stripe Checkout via Supabase Edge Function — ADDITIVE.
//
// Calls the `stripe-create-checkout-session` edge function and returns a hosted
// Checkout URL to open in the system browser. Designed to fail SOFT: if the
// function is missing / not yet configured (503) or errors, callers fall back
// to the existing payment flow. No keys live here — the secret Stripe key stays
// server-side in the edge function's environment.

import { Linking } from 'react-native';
import { supabase } from './client';

export type StripeCheckoutInput = {
  /** Donation amount in the user's currency (major units, e.g. 25 = $25). */
  amount: number;
  /** ISO 4217 currency name, e.g. 'USD'. */
  currency: string;
  paymentType: 'ONE_TIME' | 'RECURRING';
  inHonor?: boolean;
  inHonorName?: string | null;
};

export type StripeCheckoutResult =
  | { status: 'ok'; url: string }
  | { status: 'not_configured' }
  | { status: 'error'; error: unknown };

/**
 * Ask the edge function for a Checkout session URL. Never throws — returns a
 * discriminated result so the caller can branch cleanly.
 *   - 'ok'             -> open `url`
 *   - 'not_configured' -> function returned 503 / a not-configured signal
 *   - 'error'          -> network/other failure (also treated as fallback)
 */
export async function createStripeCheckoutSession(
  input: StripeCheckoutInput,
): Promise<StripeCheckoutResult> {
  try {
    const { data, error } = await supabase.functions.invoke(
      'stripe-create-checkout-session',
      { body: input },
    );

    if (error) {
      // FunctionsHttpError exposes the raw Response on `context`. A 503 means
      // the function is deployed but not wired (no Stripe key yet).
      const status = (error as any)?.context?.status;
      if (status === 503) return { status: 'not_configured' };
      return { status: 'error', error };
    }

    // Also honor an in-body not-configured flag (function returns 200 + flag).
    if (data?.notConfigured === true || data?.status === 'not_configured') {
      return { status: 'not_configured' };
    }

    const url: unknown = data?.url ?? data?.checkoutUrl;
    if (typeof url === 'string' && url.length > 0) {
      return { status: 'ok', url };
    }
    // Unexpected shape — treat as not configured so the card form still works.
    return { status: 'not_configured' };
  } catch (error) {
    return { status: 'error', error };
  }
}

/** Open a hosted Checkout URL in the system browser. Returns success. */
export async function openCheckoutUrl(url: string): Promise<boolean> {
  try {
    const can = await Linking.canOpenURL(url);
    if (!can) return false;
    await Linking.openURL(url);
    return true;
  } catch {
    return false;
  }
}
