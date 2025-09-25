/**
 * Comprehensive currency formatting utility for dynamic currency display
 * Supports USD ($) and KES (KSh) currencies used in the project system
 */

export type SupportedCurrency = 'USD' | 'KES';

export interface CurrencyDisplayOptions {
  currency?: SupportedCurrency;
  showSymbol?: boolean;
  showCode?: boolean;
  locale?: string;
}

/**
 * Get currency symbol for supported currencies
 */
export const getCurrencySymbol = (currency: SupportedCurrency): string => {
  switch (currency) {
    case 'USD':
      return '$';
    case 'KES':
      return 'KSh';
    default:
      return '$'; // Default fallback
  }
};

/**
 * Format currency amount with proper symbol and formatting
 */
export const formatCurrency = (
  amount: number | string | undefined,
  currency: SupportedCurrency = 'USD',
  options: CurrencyDisplayOptions = {}
): string => {
  if (amount === undefined || amount === null || amount === '') {
    return '-';
  }

  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numericAmount)) {
    return '-';
  }

  const {
    showSymbol = true,
    showCode = false,
    locale = 'en-US'
  } = options;

  const symbol = getCurrencySymbol(currency);
  const formattedNumber = numericAmount.toLocaleString(locale);

  if (showCode) {
    return `${formattedNumber} ${currency}`;
  }

  if (showSymbol) {
    return `${symbol}${formattedNumber}`;
  }

  return formattedNumber;
};

/**
 * Format currency for project budget displays
 */
export const formatProjectBudget = (
  amount: number | string | undefined,
  currency: SupportedCurrency = 'USD'
): string => {
  return formatCurrency(amount, currency, { showSymbol: true });
};

/**
 * Format currency for milestone displays
 */
export const formatMilestoneBudget = (
  amount: number | string | undefined,
  currency: SupportedCurrency = 'USD'
): string => {
  return formatCurrency(amount, currency, { showSymbol: true });
};

/**
 * Extract currency from project data
 */
export const getProjectCurrency = (project: any): SupportedCurrency => {
  // Check various possible locations for currency info
  if (project?.pricing?.currency) {
    return project.pricing.currency.toUpperCase() as SupportedCurrency;
  }
  
  if (project?.currency) {
    return project.currency.toUpperCase() as SupportedCurrency;
  }

  // Default to USD if no currency specified
  return 'USD';
};

/**
 * Format currency with automatic currency detection from project
 */
export const formatProjectCurrency = (
  amount: number | string | undefined,
  project: any
): string => {
  const currency = getProjectCurrency(project);
  return formatCurrency(amount, currency);
};

/**
 * Create a currency formatter function for a specific project
 */
export const createProjectCurrencyFormatter = (project: any) => {
  const currency = getProjectCurrency(project);
  
  return (amount: number | string | undefined) => {
    return formatCurrency(amount, currency);
  };
};
