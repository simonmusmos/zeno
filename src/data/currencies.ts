import type { Currency } from '../types/currency.types';

/** Approximate exchange rates to USD (for offline demo conversion) */
export const USD_RATES: Record<string, number> = {
  USD: 1,       EUR: 1.08,    GBP: 1.26,    JPY: 0.0067,
  PHP: 0.0175,  AUD: 0.65,    CAD: 0.73,    CHF: 1.11,
  HKD: 0.128,   SGD: 0.74,    MYR: 0.21,    INR: 0.012,
  CNY: 0.138,   KRW: 0.00073, THB: 0.028,   IDR: 0.000063,
  TWD: 0.031,   AED: 0.272,   SAR: 0.267,   QAR: 0.274,
  KWD: 3.27,    BRL: 0.20,    MXN: 0.058,   ZAR: 0.054,
  NGN: 0.00065, GHS: 0.069,   EGP: 0.032,   TRY: 0.031,
  PLN: 0.25,    HUF: 0.0027,  CZK: 0.044,   SEK: 0.095,
  NOK: 0.093,   DKK: 0.145,   NZD: 0.60,    VND: 0.000040,
  PKR: 0.0036,  BDT: 0.0091,
};

/** Convert using a provided rates table (USD-based). Falls back to static USD_RATES. */
export function convertWithRates(
  amount: number,
  from: string,
  to: string,
  rates: Record<string, number>,
): number {
  if (from === to) return amount;
  const fromRate = rates[from] ?? USD_RATES[from] ?? 1;
  const toRate   = rates[to]   ?? USD_RATES[to]   ?? 1;
  return (amount * fromRate) / toRate;
}

/** Legacy static conversion — used as fallback only */
export function convertCurrency(amount: number, from: string, to: string): number {
  return convertWithRates(amount, from, to, USD_RATES);
}

export const CURRENCIES: Currency[] = [
  { code: 'USD', name: 'US Dollar',           symbol: '$'  },
  { code: 'EUR', name: 'Euro',                symbol: '€'  },
  { code: 'GBP', name: 'British Pound',       symbol: '£'  },
  { code: 'JPY', name: 'Japanese Yen',        symbol: '¥'  },
  { code: 'PHP', name: 'Philippine Peso',     symbol: '₱'  },
  { code: 'AUD', name: 'Australian Dollar',   symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar',     symbol: 'C$' },
  { code: 'CHF', name: 'Swiss Franc',         symbol: 'Fr' },
  { code: 'HKD', name: 'Hong Kong Dollar',    symbol: 'HK$'},
  { code: 'SGD', name: 'Singapore Dollar',    symbol: 'S$' },
  { code: 'MYR', name: 'Malaysian Ringgit',   symbol: 'RM' },
  { code: 'INR', name: 'Indian Rupee',        symbol: '₹'  },
  { code: 'CNY', name: 'Chinese Yuan',        symbol: '¥'  },
  { code: 'KRW', name: 'South Korean Won',    symbol: '₩'  },
  { code: 'THB', name: 'Thai Baht',           symbol: '฿'  },
  { code: 'IDR', name: 'Indonesian Rupiah',   symbol: 'Rp' },
  { code: 'TWD', name: 'Taiwan Dollar',       symbol: 'NT$'},
  { code: 'AED', name: 'UAE Dirham',          symbol: 'د.إ'},
  { code: 'SAR', name: 'Saudi Riyal',         symbol: '﷼'  },
  { code: 'QAR', name: 'Qatari Riyal',        symbol: 'ر.ق'},
  { code: 'KWD', name: 'Kuwaiti Dinar',       symbol: 'KD' },
  { code: 'BRL', name: 'Brazilian Real',      symbol: 'R$' },
  { code: 'MXN', name: 'Mexican Peso',        symbol: 'MX$'},
  { code: 'ZAR', name: 'South African Rand',  symbol: 'R'  },
  { code: 'NGN', name: 'Nigerian Naira',      symbol: '₦'  },
  { code: 'GHS', name: 'Ghanaian Cedi',       symbol: '₵'  },
  { code: 'EGP', name: 'Egyptian Pound',      symbol: 'E£' },
  { code: 'TRY', name: 'Turkish Lira',        symbol: '₺'  },
  { code: 'SEK', name: 'Swedish Krona',       symbol: 'kr' },
  { code: 'NOK', name: 'Norwegian Krone',     symbol: 'kr' },
  { code: 'DKK', name: 'Danish Krone',        symbol: 'kr' },
  { code: 'NZD', name: 'New Zealand Dollar',  symbol: 'NZ$'},
  { code: 'PLN', name: 'Polish Złoty',        symbol: 'zł' },
  { code: 'HUF', name: 'Hungarian Forint',    symbol: 'Ft' },
  { code: 'CZK', name: 'Czech Koruna',        symbol: 'Kč' },
  { code: 'VND', name: 'Vietnamese Dong',     symbol: '₫'  },
  { code: 'PKR', name: 'Pakistani Rupee',     symbol: '₨'  },
  { code: 'BDT', name: 'Bangladeshi Taka',    symbol: '৳'  },
];

export const DEFAULT_CURRENCY = CURRENCIES.find(c => c.code === 'PHP')!;

/** Format a number in a given currency */
export function formatCurrency(amount: number, currencyCode: string): string {
  const currency = CURRENCIES.find(c => c.code === currencyCode);
  const symbol = currency?.symbol ?? currencyCode;
  const formatted = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${amount < 0 ? '−' : ''}${symbol}${formatted}`;
}
