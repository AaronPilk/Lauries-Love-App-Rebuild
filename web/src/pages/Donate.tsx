import { useState } from 'react';
import { useFeatureFlags } from '../lib/featureFlags';
import { supabase, currentUserId } from '../lib/supabase';

// Donations. One-time or monthly recurring. Checkout runs through a Stripe
// edge function (stripe-create-checkout-session) that activates once the Stripe
// account + keys are connected. Until then the button explains that clearly
// rather than failing silently.
const PRESETS = [10, 25, 50, 100, 250];

// "What your donation covers" — simple education calculator.
function coverage(amount: number): string {
  if (amount >= 250) return 'Helps host community events and outreach for a month.';
  if (amount >= 100) return 'Covers platform + messaging costs for dozens of members.';
  if (amount >= 50) return 'Keeps the community running for many members this month.';
  if (amount >= 25) return 'Supports a member’s access to the community for a month.';
  return 'Every dollar helps keep Laurie’s Love free for members.';
}

export function Donate() {
  const { isEnabled } = useFeatureFlags();
  const [amount, setAmount] = useState(25);
  const [recurring, setRecurring] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  async function donate() {
    setStatus(null);
    setLoading(true);
    const me = await currentUserId();
    try {
      // The edge function returns a Stripe Checkout URL once configured. If it
      // isn't (503 / not-configured / any error), fall through to the pending
      // message rather than surfacing a raw error.
      const { data, error } = await supabase.functions.invoke('stripe-create-checkout-session', {
        body: { amount, recurring, profile_id: me },
      });
      if (error) throw error;
      const url = (data as { url?: string } | null)?.url;
      if (url) {
        window.location.href = url;
        return;
      }
      setStatus('Donations aren’t connected yet — Stripe setup is pending.');
    } catch {
      setStatus('Donations aren’t connected yet — Stripe setup is pending.');
    } finally {
      setLoading(false);
    }
  }

  if (!isEnabled('donations'))
    return <p className="text-gray-500">Donations are turned off.</p>;

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-1 text-xl font-bold text-brand-700">Support Laurie’s Love</h1>
      <p className="mb-5 text-sm text-gray-500">
        Your gift keeps the community free for members.
      </p>

      <div className="mb-4 flex rounded-full bg-brand-50 p-1 text-sm">
        <button
          onClick={() => setRecurring(false)}
          className={`flex-1 rounded-full py-2 ${!recurring ? 'bg-brand-700 text-white' : 'text-brand-700'}`}
        >
          One-time
        </button>
        <button
          onClick={() => setRecurring(true)}
          className={`flex-1 rounded-full py-2 ${recurring ? 'bg-brand-700 text-white' : 'text-brand-700'}`}
        >
          Monthly
        </button>
      </div>

      <div className="mb-3 grid grid-cols-3 gap-2">
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => setAmount(p)}
            className={`rounded-lg border py-2 font-semibold ${
              amount === p ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200'
            }`}
          >
            ${p}
          </button>
        ))}
      </div>
      <input
        type="number"
        min={1}
        value={amount}
        onChange={(e) => setAmount(Math.max(1, Number(e.target.value) || 0))}
        className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand-500"
      />

      <div className="mb-4 rounded-lg bg-brand-50 p-3 text-sm text-brand-700">
        {coverage(amount)}
      </div>

      <button
        onClick={donate}
        disabled={loading}
        className="w-full rounded-lg bg-brand-700 py-3 font-semibold text-white hover:bg-brand-500 disabled:opacity-50"
      >
        {loading
          ? 'Redirecting…'
          : recurring
            ? `Give $${amount}/month`
            : `Give $${amount}`}
      </button>
      {status && <p className="mt-3 text-center text-sm text-amber-700">{status}</p>}
    </div>
  );
}
