type Price = {
  label: string;
  value: number;
};

type TabPrices = {
  options: string[];
  prices: Price[];
};

type DonateTabsValuesType = Record<string, TabPrices>;

const amountValues = [20, 50, 100, 500, 1000];
const recurringValues = [5, 10, 25, 50, 100];

export const generateDonateTabsValues = (
  symbol: string,
): DonateTabsValuesType => {
  const formatPrices = (values: number[]): Price[] =>
    values.map(v => ({
      label: `${symbol}${v}`,
      value: v,
    }));

  return {
    amount: {
      options: [],
      prices: formatPrices(amountValues),
    },
    recurring: {
      options: [],
      prices: formatPrices(recurringValues),
    },
  };
};

export type DonateTabsValues = keyof ReturnType<
  typeof generateDonateTabsValues
>;
