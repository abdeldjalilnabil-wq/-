import { DEFAULT_WHATSAPP_COUNTRY_CODE } from '../types';

/**
 * Formats a phone number into clean international WhatsApp digits (without + or 00).
 * Local numbers starting with a single 0 (e.g. 0550123456) get converted to the shop's
 * configured international country code (defaulting to Algeria 213).
 */
export function formatWhatsAppPhone(
  rawPhone: string,
  defaultCountryCode: string = DEFAULT_WHATSAPP_COUNTRY_CODE
): string {
  const trimmed = rawPhone.trim();
  if (!trimmed) return '';

  const countryDigits = defaultCountryCode.replace(/\D/g, '') || DEFAULT_WHATSAPP_COUNTRY_CODE;
  const hasPlus = trimmed.startsWith('+');
  const digits = trimmed.replace(/\D/g, '');
  if (!digits) return '';

  if (hasPlus) {
    return digits;
  }

  if (digits.startsWith('00')) {
    return digits.slice(2);
  }

  if (digits.startsWith('0') && digits.length >= 8) {
    return `${countryDigits}${digits.slice(1)}`;
  }

  return digits;
}

export function buildTurnWhatsAppMessage(params: {
  customerName: string;
  shopName: string;
  ticketNumber: number;
}): string {
  return `مرحباً ${params.customerName}، حان دورك الآن في ${params.shopName} (تذكرة #${params.ticketNumber})، يمكنك التقرب للمحل الآن.`;
}

export function buildWhatsAppUrl(params: {
  phone: string;
  countryCode?: string;
  message?: string;
}): string {
  const formatted = formatWhatsAppPhone(params.phone, params.countryCode);
  if (!formatted) return 'https://wa.me/';
  if (params.message) {
    return `https://wa.me/${formatted}?text=${encodeURIComponent(params.message)}`;
  }
  return `https://wa.me/${formatted}`;
}
