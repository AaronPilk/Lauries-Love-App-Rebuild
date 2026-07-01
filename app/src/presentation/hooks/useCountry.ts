import { useMemo } from 'react';
import countriesJSON from 'presentation/ui/assets/data/countries.json';

const SUPPORT_COUNTRY_CODES = ['US', 'CA'];
const DEFAULT_COUNTRY_CODE = 'US';

export type Country = {
  name: string;
  code: string;
  prefix: string;
  format?: string | null;
};

export default function useCountry() {
  const allCountries = useMemo<Array<Country>>(
    () => JSON.parse(JSON.stringify(countriesJSON)) as Array<Country>,
    [],
  );

  const supportedCountries = useMemo<Array<Country>>(
    () =>
      allCountries.filter(country =>
        SUPPORT_COUNTRY_CODES.includes(country.code),
      ),
    [allCountries],
  );

  const defaultCountry = useMemo<Country>(
    () => allCountries.find(c => c.code === DEFAULT_COUNTRY_CODE)!,
    [allCountries],
  );

  return {
    allCountries,
    supportedCountries,
    defaultCountry,
    supportedCountryCodes: SUPPORT_COUNTRY_CODES,
  };
}
