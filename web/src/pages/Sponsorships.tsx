import { useFeatureFlags } from '../lib/featureFlags';

// Sponsorship landing page with tiered opportunities (SOW). Static tiers for
// now; "Become a sponsor" routes to the donations flow (Stripe) or a contact
// step once configured. Tiers/branding will become admin-configurable in a
// fast-follow.
const TIERS = [
  {
    name: 'Community Friend',
    price: '$500 / year',
    perks: ['Logo on the sponsors page', 'Thank-you post to the community'],
  },
  {
    name: 'Community Partner',
    price: '$2,500 / year',
    perks: [
      'Everything in Friend',
      'Featured placement on the sponsors page',
      'Quarterly community shout-out',
    ],
    featured: true,
  },
  {
    name: 'Community Champion',
    price: '$10,000 / year',
    perks: [
      'Everything in Partner',
      'Homepage recognition',
      'Named support for a community program',
    ],
  },
];

export function Sponsorships() {
  const { isEnabled } = useFeatureFlags();
  if (!isEnabled('sponsorships'))
    return <p className="text-gray-500">Sponsorships are turned off.</p>;

  return (
    <div>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-brand-700">Become a Sponsor</h1>
        <p className="mt-1 text-sm text-gray-500">
          Partner with Laurie’s Love to support cancer patients and their families.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {TIERS.map((t) => (
          <div
            key={t.name}
            className={`rounded-2xl border p-5 ${
              t.featured
                ? 'border-brand-500 bg-brand-50 shadow-md'
                : 'border-brand-100 bg-white'
            }`}
          >
            <div className="text-lg font-bold text-brand-700">{t.name}</div>
            <div className="mb-3 text-sm text-brand-500">{t.price}</div>
            <ul className="space-y-1 text-sm text-gray-600">
              {t.perks.map((p) => (
                <li key={p}>• {p}</li>
              ))}
            </ul>
            <button className="mt-4 w-full rounded-lg bg-brand-700 py-2 text-sm font-semibold text-white hover:bg-brand-500">
              Become a {t.name.split(' ')[1]}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
