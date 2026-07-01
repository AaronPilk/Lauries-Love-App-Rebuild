import {
  postcodeValidator,
  postcodeValidatorExistsForCountry,
} from 'postcode-validator';

export function isValidZipcode(zipcode: string, country?: string): boolean {
  try {
    if (!country || !postcodeValidatorExistsForCountry(country)) {
      return zipcode.length <= 6;
    }
    const isValid = postcodeValidator(zipcode, country);
    return isValid;
  } catch (error) {
    if (__DEV__) console.warn('Failed to validate zipcode', error);
    // If catch error, assume the zipcode is invalid
    return false;
  }
}
