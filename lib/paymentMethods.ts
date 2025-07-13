// Centralized Payment Methods Configuration
// This file ensures consistency across admin dashboard and client dashboard

export type PaymentMethodType = 
  | "bank_transfer"
  | "credit_card"
  | "debit_card"
  | "paypal"
  | "stripe"
  | "mpesa"
  | "paystack"
  | "flutterwave"
  | "wise"
  | "cryptocurrency"
  | "check"
  | "cash"
  | "other";

export interface PaymentMethod {
  value: PaymentMethodType;
  label: string;
  description?: string;
  icon?: string;
  supported_currencies?: string[];
  fees?: {
    percentage?: number;
    fixed?: number;
    currency?: string;
  };
  processing_time?: string;
  region?: string[];
  enabled?: boolean;
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    value: "bank_transfer",
    label: "Bank Transfer",
    description: "Direct bank-to-bank transfer",
    icon: "🏦",
    supported_currencies: ["USD", "KES", "EUR", "GBP"],
    fees: { percentage: 0, fixed: 0 },
    processing_time: "1-3 business days",
    region: ["US", "KE", "EU", "UK"],
    enabled: true
  },
  {
    value: "credit_card",
    label: "Credit Card",
    description: "Visa, MasterCard, American Express",
    icon: "💳",
    supported_currencies: ["USD", "KES", "EUR", "GBP"],
    fees: { percentage: 2.9, fixed: 0.30, currency: "USD" },
    processing_time: "Instant",
    region: ["Global"],
    enabled: true
  },
  {
    value: "debit_card",
    label: "Debit Card",
    description: "Direct debit from bank account",
    icon: "💳",
    supported_currencies: ["USD", "KES", "EUR", "GBP"],
    fees: { percentage: 1.5, fixed: 0.25, currency: "USD" },
    processing_time: "Instant",
    region: ["Global"],
    enabled: true
  },
  {
    value: "paypal",
    label: "PayPal",
    description: "PayPal account transfer",
    icon: "🅿️",
    supported_currencies: ["USD", "EUR", "GBP"],
    fees: { percentage: 3.49, fixed: 0.49, currency: "USD" },
    processing_time: "Instant",
    region: ["Global"],
    enabled: true
  },
  {
    value: "stripe",
    label: "Stripe",
    description: "Stripe payment processing",
    icon: "💠",
    supported_currencies: ["USD", "EUR", "GBP"],
    fees: { percentage: 2.9, fixed: 0.30, currency: "USD" },
    processing_time: "Instant",
    region: ["Global"],
    enabled: true
  },
  {
    value: "mpesa",
    label: "M-Pesa",
    description: "Mobile money transfer (Kenya)",
    icon: "📱",
    supported_currencies: ["KES"],
    fees: { percentage: 0, fixed: 0 },
    processing_time: "Instant",
    region: ["KE"],
    enabled: true
  },
  {
    value: "paystack",
    label: "Paystack",
    description: "African payment gateway",
    icon: "🌍",
    supported_currencies: ["USD", "KES", "NGN", "ZAR"],
    fees: { percentage: 1.5, fixed: 0, currency: "USD" },
    processing_time: "Instant",
    region: ["KE", "NG", "ZA"],
    enabled: true
  },
  {
    value: "flutterwave",
    label: "Flutterwave",
    description: "Pan-African payment solution",
    icon: "🦋",
    supported_currencies: ["USD", "KES", "NGN", "ZAR"],
    fees: { percentage: 1.4, fixed: 0, currency: "USD" },
    processing_time: "Instant",
    region: ["KE", "NG", "ZA"],
    enabled: true
  },
  {
    value: "wise",
    label: "Wise (formerly TransferWise)",
    description: "International money transfer",
    icon: "🌐",
    supported_currencies: ["USD", "KES", "EUR", "GBP"],
    fees: { percentage: 0.41, fixed: 0, currency: "USD" },
    processing_time: "1-2 business days",
    region: ["Global"],
    enabled: true
  },
  {
    value: "cryptocurrency",
    label: "Cryptocurrency",
    description: "Bitcoin, Ethereum, USDC",
    icon: "₿",
    supported_currencies: ["BTC", "ETH", "USDC", "USDT"],
    fees: { percentage: 0, fixed: 0 },
    processing_time: "5-60 minutes",
    region: ["Global"],
    enabled: true
  },
  {
    value: "check",
    label: "Check",
    description: "Traditional paper check",
    icon: "📝",
    supported_currencies: ["USD", "EUR", "GBP"],
    fees: { percentage: 0, fixed: 0 },
    processing_time: "5-10 business days",
    region: ["US", "EU", "UK"],
    enabled: true
  },
  {
    value: "cash",
    label: "Cash",
    description: "Physical cash payment",
    icon: "💵",
    supported_currencies: ["USD", "KES", "EUR", "GBP"],
    fees: { percentage: 0, fixed: 0 },
    processing_time: "Instant",
    region: ["Local"],
    enabled: true
  },
  {
    value: "other",
    label: "Other",
    description: "Other payment method",
    icon: "❓",
    supported_currencies: ["USD", "KES", "EUR", "GBP"],
    fees: { percentage: 0, fixed: 0 },
    processing_time: "Varies",
    region: ["Global"],
    enabled: true
  }
];

// Helper functions
export const getPaymentMethodByValue = (value: PaymentMethodType): PaymentMethod | undefined => {
  return PAYMENT_METHODS.find(method => method.value === value);
};

export const getEnabledPaymentMethods = (): PaymentMethod[] => {
  return PAYMENT_METHODS.filter(method => method.enabled);
};

export const getPaymentMethodsForCurrency = (currency: string): PaymentMethod[] => {
  return PAYMENT_METHODS.filter(method => 
    method.enabled && 
    (method.supported_currencies?.includes(currency) || method.value === "other")
  );
};

export const getPaymentMethodsForRegion = (region: string): PaymentMethod[] => {
  return PAYMENT_METHODS.filter(method => 
    method.enabled && 
    (method.region?.includes(region) || method.region?.includes("Global"))
  );
};

export const formatPaymentMethodLabel = (value: PaymentMethodType): string => {
  const method = getPaymentMethodByValue(value);
  return method ? method.label : value.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// Default payment method for forms
export const DEFAULT_PAYMENT_METHOD: PaymentMethodType = "bank_transfer";

// Common payment method groupings
export const DIGITAL_PAYMENT_METHODS: PaymentMethodType[] = [
  "credit_card",
  "debit_card", 
  "paypal",
  "stripe",
  "mpesa",
  "paystack",
  "flutterwave"
];

export const TRADITIONAL_PAYMENT_METHODS: PaymentMethodType[] = [
  "bank_transfer",
  "check",
  "cash"
];

export const INTERNATIONAL_PAYMENT_METHODS: PaymentMethodType[] = [
  "wise",
  "cryptocurrency",
  "paypal",
  "stripe"
];

export const AFRICAN_PAYMENT_METHODS: PaymentMethodType[] = [
  "mpesa",
  "paystack",
  "flutterwave"
];
