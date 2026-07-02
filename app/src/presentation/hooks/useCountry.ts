import countriesJSON from 'presentation/ui/assets/data/countries.json';

const SUPPORT_COUNTRY_CODES = ['US', 'CA'];
const DEFAULT_COUNTRY_CODE = 'US';

export type Country = {
  name: string;
  code: string;
  prefix: string;
  format?: string | null;
};

// Perf: the deep clone (JSON.parse(JSON.stringify(...))) of the full country
// list previously ran on EVERY mount of any component using this hook. The
// data is static, so compute once at module load and share stable references.
const ALL_COUNTRIES: Array<Country> = JSON.parse(
  JSON.stringify(countriesJSON),
) as Array<Country>;

const SUPPORTED_COUNTRIES: Array<Country> = ALL_COUNTRIES.filter(country =>
  SUPPORT_COUNTRY_CODES.includes(country.code),
);

const DEFAULT_COUNTRY: Country = ALL_COUNTRIES.find(
  c => c.code === DEFAULT_COUNTRY_CODE,
)!;

export default function useCountry() {
  return {
    allCountries: ALL_COUNTRIES,
    supportedCountries: SUPPORTED_COUNTRIES,
    defaultCountry: DEFAULT_COUNTRY,
    supportedCountryCodes: SUPPORT_COUNTRY_CODES,
  };
}
