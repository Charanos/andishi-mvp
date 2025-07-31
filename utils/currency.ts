// Shared currency utilities for both frontend and backend TypeScript code.
// This centralizes the CurrencyAmount interface and common helper functions
// to keep currency conversion and formatting logic consistent across the
// code-base.

export type SupportedCurrency = 'USD' | 'KES';

export interface CurrencyAmount {
  /**
   * Amount expressed in the currency listed in `currency`.
   */
  amount: number;
  /**
   * The currency of the `amount` field.
   */
  currency: SupportedCurrency;
  /**
   * Convenience field with the USD equivalent of `amount` (after conversion).
   * If `currency === 'USD'`, this will equal `amount`.
   */
  usdEquivalent?: number;
  /**
   * The original amount before any conversion (useful when the backend has
   * converted KES → USD but we still want to surface the original figure).
   */
  originalAmount?: number;
  /**
   * The original currency for `originalAmount` (e.g. 'KES').
   */
  originalCurrency?: SupportedCurrency;
}

/**
 * Extract a plain numeric value for chart calculations. We prioritise the USD
 * equivalent, falling back to the raw amount.
 */
export const extractAmount = (value: number | CurrencyAmount): number => {
  if (typeof value === 'number') return value;
  return value.usdEquivalent ?? value.amount ?? 0;
};

/**
 * Return the currency code for display purposes. For primitive numbers we
 * assume USD because all numeric-only currency coming from the backend should
 * already be converted.
 */
export const getCurrencySymbol = (value: number | CurrencyAmount): SupportedCurrency => {
  if (typeof value === 'number') return 'USD';
  return value.currency ?? 'USD';
};

/**
 * Basic number formatter that respects thousands separators but shows no
 * currency symbol.
 */
export const formatNumber = (num: number): string =>
  new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);

/**
 * Format a CurrencyAmount (or number) as a USD string by default. When the
 * value was originally in KES we optionally append the original amount in
 * parentheses, e.g. `$13,860 (KES 1,800,000)`.
 */
export const formatCurrency = (
  value: number | CurrencyAmount,
  showOriginal = false,
): string => {
  const amount = extractAmount(value);

  const formattedUSD = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

  if (
    showOriginal &&
    typeof value === 'object' &&
    value.originalCurrency === 'KES' &&
    value.originalAmount
  ) {
    const original = formatNumber(value.originalAmount);
    return `${formattedUSD} (KES ${original})`;
  }

  return formattedUSD;
};
