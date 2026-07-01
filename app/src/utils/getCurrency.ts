export const getCurrency = (
  country?: string,
): {
  symbol: '$' | 'CA$';
  currencyName: 'USD' | 'CAD';
  country: 'US' | 'CA';
} => {
  // in fact, both countries return USD now
  if (country === 'US' || country === 'CA') {
    return { symbol: '$', currencyName: 'USD', country };
  }
  return { symbol: '$', currencyName: 'USD', country: 'US' }; // fallback
};
