import type { PaymentMethodId, PaymentRegion } from '../types';

export interface PaymentMethodMeta {
  id: PaymentMethodId;
  region: PaymentRegion;
  kind: 'card' | 'transfer' | 'wallet';
  nameAr: string;
  nameEn: string;
  shortCode: string;
  accentBg: string;
  accentText: string;
  supportsInstantCard: boolean;
}

export const ALGERIAN_PAYMENT_METHODS: PaymentMethodMeta[] = [
  {
    id: 'edahabia',
    region: 'algeria',
    kind: 'card',
    nameAr: 'البطاقة الذهبية (بريد الجزائر)',
    nameEn: 'Edahabia (Algérie Poste)',
    shortCode: 'EDAHABIA',
    accentBg: '#CA8A04',
    accentText: '#FFFFFF',
    supportsInstantCard: true,
  },
  {
    id: 'cib',
    region: 'algeria',
    kind: 'card',
    nameAr: 'بطاقة CIB (جميع البنوك الجزائرية)',
    nameEn: 'CIB Interbank Card (SATIM)',
    shortCode: 'CIB',
    accentBg: '#0284C7',
    accentText: '#FFFFFF',
    supportsInstantCard: true,
  },
  {
    id: 'baridimob',
    region: 'algeria',
    kind: 'transfer',
    nameAr: 'بريدي موب / تحويل بريدي CCP',
    nameEn: 'BaridiMob / CCP Transfer',
    shortCode: 'BARIDIMOB',
    accentBg: '#15803D',
    accentText: '#FFFFFF',
    supportsInstantCard: false,
  },
];

export const INTERNATIONAL_PAYMENT_METHODS: PaymentMethodMeta[] = [
  {
    id: 'visa',
    region: 'international',
    kind: 'card',
    nameAr: 'بطاقة Visa العالمية',
    nameEn: 'Visa',
    shortCode: 'VISA',
    accentBg: '#1D4ED8',
    accentText: '#FFFFFF',
    supportsInstantCard: true,
  },
  {
    id: 'mastercard',
    region: 'international',
    kind: 'card',
    nameAr: 'بطاقة Mastercard العالمية',
    nameEn: 'Mastercard',
    shortCode: 'MC',
    accentBg: '#DC2626',
    accentText: '#FFFFFF',
    supportsInstantCard: true,
  },
  {
    id: 'amex',
    region: 'international',
    kind: 'card',
    nameAr: 'أمريكان إكسبريس (Amex)',
    nameEn: 'American Express',
    shortCode: 'AMEX',
    accentBg: '#0369A1',
    accentText: '#FFFFFF',
    supportsInstantCard: true,
  },
  {
    id: 'unionpay',
    region: 'international',
    kind: 'card',
    nameAr: 'يونيون باي (UnionPay)',
    nameEn: 'UnionPay',
    shortCode: 'UP',
    accentBg: '#0D9488',
    accentText: '#FFFFFF',
    supportsInstantCard: true,
  },
  {
    id: 'discover',
    region: 'international',
    kind: 'card',
    nameAr: 'ديسكفر / داينرز (Discover)',
    nameEn: 'Discover / Diners',
    shortCode: 'DISC',
    accentBg: '#EA580C',
    accentText: '#FFFFFF',
    supportsInstantCard: true,
  },
  {
    id: 'jcb',
    region: 'international',
    kind: 'card',
    nameAr: 'بطاقة JCB الدولية',
    nameEn: 'JCB',
    shortCode: 'JCB',
    accentBg: '#4338CA',
    accentText: '#FFFFFF',
    supportsInstantCard: true,
  },
  {
    id: 'mir',
    region: 'international',
    kind: 'card',
    nameAr: 'بطاقة Mir',
    nameEn: 'Mir',
    shortCode: 'MIR',
    accentBg: '#16A34A',
    accentText: '#FFFFFF',
    supportsInstantCard: true,
  },
  {
    id: 'paypal',
    region: 'international',
    kind: 'wallet',
    nameAr: 'باي بال (PayPal)',
    nameEn: 'PayPal',
    shortCode: 'PAYPAL',
    accentBg: '#003087',
    accentText: '#FFFFFF',
    supportsInstantCard: false,
  },
  {
    id: 'wise_paysera',
    region: 'international',
    kind: 'transfer',
    nameAr: 'Wise / Paysera / RedotPay / IBAN',
    nameEn: 'Wise / Paysera / RedotPay',
    shortCode: 'WISE/IBAN',
    accentBg: '#0F766E',
    accentText: '#FFFFFF',
    supportsInstantCard: false,
  },
  {
    id: 'apple_pay',
    region: 'international',
    kind: 'wallet',
    nameAr: 'آبل باي (Apple Pay)',
    nameEn: 'Apple Pay',
    shortCode: 'APPLE PAY',
    accentBg: '#18181B',
    accentText: '#FFFFFF',
    supportsInstantCard: true,
  },
  {
    id: 'google_pay',
    region: 'international',
    kind: 'wallet',
    nameAr: 'جوجل باي (Google Pay)',
    nameEn: 'Google Pay',
    shortCode: 'G PAY',
    accentBg: '#27272A',
    accentText: '#FFFFFF',
    supportsInstantCard: true,
  },
];

export const ALL_PAYMENT_METHODS: PaymentMethodMeta[] = [
  ...ALGERIAN_PAYMENT_METHODS,
  ...INTERNATIONAL_PAYMENT_METHODS,
];

export function getPaymentMethodMeta(id: PaymentMethodId): PaymentMethodMeta {
  return (
    ALL_PAYMENT_METHODS.find((m) => m.id === id) || ALGERIAN_PAYMENT_METHODS[0]
  );
}

/**
 * Detect card network/brand locally in memory from BIN prefix.
 * Raw card digits never leave the browser.
 */
export function detectCardBrand(
  rawInput: string,
  fallback?: PaymentMethodId
): { brandId: PaymentMethodId; label: string } {
  const digits = rawInput.replace(/\D/g, '');
  if (!digits) {
    const meta = getPaymentMethodMeta(fallback || 'visa');
    return { brandId: meta.id, label: meta.shortCode };
  }

  // Algerian Edahabia (Algérie Poste) prefixes (6280xxxx) & SATIM CIB (636/637/505)
  if (/^6280/.test(digits)) {
    return { brandId: 'edahabia', label: 'Edahabia' };
  }
  if (/^(636|637|638|639)/.test(digits)) {
    return { brandId: 'cib', label: 'CIB' };
  }
  if (/^4/.test(digits)) {
    return { brandId: 'visa', label: 'Visa' };
  }
  if (/^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[01]|2720)/.test(digits)) {
    return { brandId: 'mastercard', label: 'Mastercard' };
  }
  if (/^(34|37)/.test(digits)) {
    return { brandId: 'amex', label: 'American Express' };
  }
  if (/^62/.test(digits)) {
    return { brandId: 'unionpay', label: 'UnionPay' };
  }
  if (/^(6011|64[4-9]|65|30[0-5]|36|38)/.test(digits)) {
    return { brandId: 'discover', label: 'Discover / Diners' };
  }
  if (/^35(2[89]|[3-8])/.test(digits)) {
    return { brandId: 'jcb', label: 'JCB' };
  }
  if (/^220[0-4]/.test(digits)) {
    return { brandId: 'mir', label: 'Mir' };
  }

  const meta = getPaymentMethodMeta(fallback || 'visa');
  return { brandId: meta.id, label: meta.shortCode };
}

export function formatCardNumber(rawInput: string): string {
  const digits = rawInput.replace(/\D/g, '').slice(0, 19);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

export function passesLuhnCheck(rawInput: string): boolean {
  const digits = rawInput.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let doubleNext = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = Number(digits[i]);
    if (doubleNext) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    doubleNext = !doubleNext;
  }
  return sum % 10 === 0;
}

export function formatExpiryInput(rawInput: string): string {
  const digits = rawInput.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function isValidExpiry(mmYY: string): boolean {
  const match = /^(\d{2})\/(\d{2})$/.exec(mmYY.trim());
  if (!match) return false;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return false;
  const now = new Date();
  const curYear = now.getFullYear();
  const curMonth = now.getMonth() + 1;
  return year > curYear || (year === curYear && month >= curMonth);
}
