/**
 * Appends -sm and -md size suffixes to an S3 image URL.
 *
 * @param s3Url - The original image URL
 * @returns URLs with -sm and -md suffixes
 */
export const getSizedImageUrls = (
  s3Url: string,
): { sm: string; md: string } => {
  const lastDotIndex = s3Url.lastIndexOf('.');
  if (lastDotIndex === -1) {
    return {
      sm: s3Url + '-sm.png',
      md: s3Url + '-md.png',
    };
  }

  const base = s3Url.substring(0, lastDotIndex); // userId-timestamp
  const ext = s3Url.substring(lastDotIndex + 1);

  return {
    sm: `${base}-sm.${ext}`,
    md: `${base}-md.${ext}`,
  };
};

/**
 * Removes the -sm or -md size suffix from an S3 image URL.
 *
 * @param sizedUrl - The image URL with a potential size suffix
 * @returns The original image URL
 */
// Hoisted so the regex is compiled once, not on every call (hot path in lists).
const SIZE_SUFFIX_RE = /-(sm|md)$/;

export const getOriginalImageUrl = (sizedUrl: string): string => {
  const lastDotIndex = sizedUrl.lastIndexOf('.');

  if (lastDotIndex === -1) {
    return sizedUrl.replace(SIZE_SUFFIX_RE, '');
  }

  const base = sizedUrl.substring(0, lastDotIndex);
  const ext = sizedUrl.substring(lastDotIndex + 1);

  const originalBase = base.replace(SIZE_SUFFIX_RE, '');

  return `${originalBase}.${ext}`;
};
