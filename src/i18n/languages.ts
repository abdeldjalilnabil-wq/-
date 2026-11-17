export type DictLocale =
  | 'ar'
  | 'en'
  | 'fr'
  | 'es'
  | 'de'
  | 'tr'
  | 'it'
  | 'pt'
  | 'ru'
  | 'zh'
  | 'ja'
  | 'ko'
  | 'hi'
  | 'ur'
  | 'fa'
  | 'id';

export interface WorldLanguage {
  code: string;
  nativeName: string;
  enName: string;
  arName: string;
  dir: 'rtl' | 'ltr';
  countryCode: string;
  dictLocale: DictLocale;
}

export const RTL_LANG_CODES = new Set([
  'ar',
  'ur',
  'fa',
  'he',
  'ps',
  'ku',
  'sd',
  'ug',
  'yi',
]);

export const WORLD_LANGUAGES: WorldLanguage[] = [
  { code: 'ar', nativeName: 'العربية', enName: 'Arabic', arName: 'العربية', dir: 'rtl', countryCode: 'DZ', dictLocale: 'ar' },
  { code: 'en', nativeName: 'English', enName: 'English', arName: 'الإنجليزية', dir: 'ltr', countryCode: 'GB', dictLocale: 'en' },
  { code: 'fr', nativeName: 'Français', enName: 'French', arName: 'الفرنسية', dir: 'ltr', countryCode: 'FR', dictLocale: 'fr' },
  { code: 'es', nativeName: 'Español', enName: 'Spanish', arName: 'الإسبانية', dir: 'ltr', countryCode: 'ES', dictLocale: 'es' },
  { code: 'de', nativeName: 'Deutsch', enName: 'German', arName: 'الألمانية', dir: 'ltr', countryCode: 'DE', dictLocale: 'de' },
  { code: 'tr', nativeName: 'Türkçe', enName: 'Turkish', arName: 'التركية', dir: 'ltr', countryCode: 'TR', dictLocale: 'tr' },
  { code: 'it', nativeName: 'Italiano', enName: 'Italian', arName: 'الإيطالية', dir: 'ltr', countryCode: 'IT', dictLocale: 'it' },
  { code: 'pt', nativeName: 'Português', enName: 'Portuguese', arName: 'البرتغالية', dir: 'ltr', countryCode: 'PT', dictLocale: 'pt' },
  { code: 'ru', nativeName: 'Русский', enName: 'Russian', arName: 'الروسية', dir: 'ltr', countryCode: 'RU', dictLocale: 'ru' },
  { code: 'zh', nativeName: '中文 (简体)', enName: 'Chinese (Simplified)', arName: 'الصينية', dir: 'ltr', countryCode: 'CN', dictLocale: 'zh' },
  { code: 'ja', nativeName: '日本語', enName: 'Japanese', arName: 'اليابانية', dir: 'ltr', countryCode: 'JP', dictLocale: 'ja' },
  { code: 'ko', nativeName: '한국어', enName: 'Korean', arName: 'الكورية', dir: 'ltr', countryCode: 'KR', dictLocale: 'ko' },
  { code: 'hi', nativeName: 'हिन्दी', enName: 'Hindi', arName: 'الهندية', dir: 'ltr', countryCode: 'IN', dictLocale: 'hi' },
  { code: 'ur', nativeName: 'اردو', enName: 'Urdu', arName: 'الأردية', dir: 'rtl', countryCode: 'PK', dictLocale: 'ur' },
  { code: 'fa', nativeName: 'فارسی', enName: 'Persian', arName: 'الفارسية', dir: 'rtl', countryCode: 'IR', dictLocale: 'fa' },
  { code: 'id', nativeName: 'Bahasa Indonesia', enName: 'Indonesian', arName: 'الإندونيسية', dir: 'ltr', countryCode: 'ID', dictLocale: 'id' },
  // Extended Global Languages (automatic RTL/LTR + full UI mapping)
  { code: 'kab', nativeName: 'Taqbaylit (أمازيغية)', enName: 'Kabyle / Amazigh', arName: 'الأمازيغية / القبائلية', dir: 'ltr', countryCode: 'DZ', dictLocale: 'fr' },
  { code: 'nl', nativeName: 'Nederlands', enName: 'Dutch', arName: 'الهولندية', dir: 'ltr', countryCode: 'NL', dictLocale: 'en' },
  { code: 'pl', nativeName: 'Polski', enName: 'Polish', arName: 'البولندية', dir: 'ltr', countryCode: 'PL', dictLocale: 'en' },
  { code: 'uk', nativeName: 'Українська', enName: 'Ukrainian', arName: 'الأوكرانية', dir: 'ltr', countryCode: 'UA', dictLocale: 'ru' },
  { code: 'el', nativeName: 'Ελληνικά', enName: 'Greek', arName: 'اليونانية', dir: 'ltr', countryCode: 'GR', dictLocale: 'en' },
  { code: 'sv', nativeName: 'Svenska', enName: 'Swedish', arName: 'السويدية', dir: 'ltr', countryCode: 'SE', dictLocale: 'en' },
  { code: 'no', nativeName: 'Norsk', enName: 'Norwegian', arName: 'النرويجية', dir: 'ltr', countryCode: 'NO', dictLocale: 'en' },
  { code: 'da', nativeName: 'Dansk', enName: 'Danish', arName: 'الدنماركية', dir: 'ltr', countryCode: 'DK', dictLocale: 'en' },
  { code: 'fi', nativeName: 'Suomi', enName: 'Finnish', arName: 'الفنلندية', dir: 'ltr', countryCode: 'FI', dictLocale: 'en' },
  { code: 'cs', nativeName: 'Čeština', enName: 'Czech', arName: 'التشيكية', dir: 'ltr', countryCode: 'CZ', dictLocale: 'en' },
  { code: 'ro', nativeName: 'Română', enName: 'Romanian', arName: 'الرومانية', dir: 'ltr', countryCode: 'RO', dictLocale: 'fr' },
  { code: 'hu', nativeName: 'Magyar', enName: 'Hungarian', arName: 'المجرية', dir: 'ltr', countryCode: 'HU', dictLocale: 'en' },
  { code: 'bg', nativeName: 'Български', enName: 'Bulgarian', arName: 'البلغارية', dir: 'ltr', countryCode: 'BG', dictLocale: 'ru' },
  { code: 'sr', nativeName: 'Српски', enName: 'Serbian', arName: 'الصربية', dir: 'ltr', countryCode: 'RS', dictLocale: 'ru' },
  { code: 'hr', nativeName: 'Hrvatski', enName: 'Croatian', arName: 'الكرواتية', dir: 'ltr', countryCode: 'HR', dictLocale: 'en' },
  { code: 'sk', nativeName: 'Slovenčina', enName: 'Slovak', arName: 'السلوفاكية', dir: 'ltr', countryCode: 'SK', dictLocale: 'en' },
  { code: 'sq', nativeName: 'Shqip', enName: 'Albanian', arName: 'الألبانية', dir: 'ltr', countryCode: 'AL', dictLocale: 'en' },
  { code: 'az', nativeName: 'Azərbaycan', enName: 'Azerbaijani', arName: 'الأذربيجانية', dir: 'ltr', countryCode: 'AZ', dictLocale: 'tr' },
  { code: 'uz', nativeName: 'Oʻzbekcha', enName: 'Uzbek', arName: 'الأوزبكية', dir: 'ltr', countryCode: 'UZ', dictLocale: 'tr' },
  { code: 'kk', nativeName: 'Қазақша', enName: 'Kazakh', arName: 'الكازاخية', dir: 'ltr', countryCode: 'KZ', dictLocale: 'ru' },
  { code: 'ms', nativeName: 'Bahasa Melayu', enName: 'Malay', arName: 'الماليزية', dir: 'ltr', countryCode: 'MY', dictLocale: 'id' },
  { code: 'th', nativeName: 'ไทย', enName: 'Thai', arName: 'التايلاندية', dir: 'ltr', countryCode: 'TH', dictLocale: 'en' },
  { code: 'vi', nativeName: 'Tiếng Việt', enName: 'Vietnamese', arName: 'الفيتنامية', dir: 'ltr', countryCode: 'VN', dictLocale: 'en' },
  { code: 'bn', nativeName: 'বাংলা', enName: 'Bengali', arName: 'البنغالية', dir: 'ltr', countryCode: 'BD', dictLocale: 'en' },
  { code: 'ta', nativeName: 'தமிழ்', enName: 'Tamil', arName: 'التاميلية', dir: 'ltr', countryCode: 'IN', dictLocale: 'hi' },
  { code: 'te', nativeName: 'తెలుగు', enName: 'Telugu', arName: 'التيلوغوية', dir: 'ltr', countryCode: 'IN', dictLocale: 'hi' },
  { code: 'mr', nativeName: 'मराठी', enName: 'Marathi', arName: 'الماراثية', dir: 'ltr', countryCode: 'IN', dictLocale: 'hi' },
  { code: 'pa', nativeName: 'ਪੰਜਾਬੀ', enName: 'Punjabi', arName: 'البنجابية', dir: 'ltr', countryCode: 'PK', dictLocale: 'ur' },
  { code: 'tl', nativeName: 'Tagalog', enName: 'Filipino / Tagalog', arName: 'الفلبينية', dir: 'ltr', countryCode: 'PH', dictLocale: 'en' },
  { code: 'sw', nativeName: 'Kiswahili', enName: 'Swahili', arName: 'السواحيلية', dir: 'ltr', countryCode: 'KE', dictLocale: 'en' },
  { code: 'am', nativeName: 'አማርኛ', enName: 'Amharic', arName: 'الأمهرية', dir: 'ltr', countryCode: 'ET', dictLocale: 'en' },
  { code: 'ha', nativeName: 'Hausa', enName: 'Hausa', arName: 'الهوسا', dir: 'ltr', countryCode: 'NG', dictLocale: 'en' },
  { code: 'yo', nativeName: 'Yorùbá', enName: 'Yoruba', arName: 'اليوروبا', dir: 'ltr', countryCode: 'NG', dictLocale: 'en' },
  { code: 'so', nativeName: 'Soomaali', enName: 'Somali', arName: 'الصومالية', dir: 'ltr', countryCode: 'SO', dictLocale: 'ar' },
  { code: 'ku', nativeName: 'کوردی', enName: 'Kurdish', arName: 'الكردية', dir: 'rtl', countryCode: 'IQ', dictLocale: 'ar' },
  { code: 'ps', nativeName: 'پښتو', enName: 'Pashto', arName: 'البشتوية', dir: 'rtl', countryCode: 'AF', dictLocale: 'fa' },
  { code: 'he', nativeName: 'עברית', enName: 'Hebrew', arName: 'العبرية', dir: 'rtl', countryCode: 'PS', dictLocale: 'en' },
  { code: 'ca', nativeName: 'Català', enName: 'Catalan', arName: 'الكتالونية', dir: 'ltr', countryCode: 'ES', dictLocale: 'es' },
  { code: 'eu', nativeName: 'Euskara', enName: 'Basque', arName: 'الباسكية', dir: 'ltr', countryCode: 'ES', dictLocale: 'es' },
  { code: 'gl', nativeName: 'Galego', enName: 'Galician', arName: 'الجاليكية', dir: 'ltr', countryCode: 'ES', dictLocale: 'es' },
  { code: 'af', nativeName: 'Afrikaans', enName: 'Afrikaans', arName: 'الأفريكانية', dir: 'ltr', countryCode: 'ZA', dictLocale: 'en' },
  { code: 'is', nativeName: 'Íslenska', enName: 'Icelandic', arName: 'الأيسلندية', dir: 'ltr', countryCode: 'IS', dictLocale: 'en' },
  { code: 'ga', nativeName: 'Gaeilge', enName: 'Irish', arName: 'الأيرلندية', dir: 'ltr', countryCode: 'IE', dictLocale: 'en' },
  { code: 'cy', nativeName: 'Cymraeg', enName: 'Welsh', arName: 'الويلزية', dir: 'ltr', countryCode: 'GB', dictLocale: 'en' },
  { code: 'lt', nativeName: 'Lietuvių', enName: 'Lithuanian', arName: 'الليتوانية', dir: 'ltr', countryCode: 'LT', dictLocale: 'en' },
  { code: 'lv', nativeName: 'Latviešu', enName: 'Latvian', arName: 'اللاتفية', dir: 'ltr', countryCode: 'LV', dictLocale: 'en' },
  { code: 'et', nativeName: 'Eesti', enName: 'Estonian', arName: 'الإستونية', dir: 'ltr', countryCode: 'EE', dictLocale: 'en' },
  { code: 'ka', nativeName: 'ქართული', enName: 'Georgian', arName: 'الجورجية', dir: 'ltr', countryCode: 'GE', dictLocale: 'en' },
  { code: 'hy', nativeName: 'Հայերեն', enName: 'Armenian', arName: 'الأرمنية', dir: 'ltr', countryCode: 'AM', dictLocale: 'en' },
  { code: 'ne', nativeName: 'नेपाली', enName: 'Nepali', arName: 'النيبالية', dir: 'ltr', countryCode: 'NP', dictLocale: 'hi' },
  { code: 'si', nativeName: 'සිංහල', enName: 'Sinhala', arName: 'السنهالية', dir: 'ltr', countryCode: 'LK', dictLocale: 'en' },
  { code: 'km', nativeName: 'ភាសាខ្មែរ', enName: 'Khmer', arName: 'الخميرية', dir: 'ltr', countryCode: 'KH', dictLocale: 'en' },
  { code: 'lo', nativeName: 'ລາວ', enName: 'Lao', arName: 'اللاوية', dir: 'ltr', countryCode: 'LA', dictLocale: 'en' },
  { code: 'my', nativeName: 'မြန်မာ', enName: 'Burmese', arName: 'البورمية', dir: 'ltr', countryCode: 'MM', dictLocale: 'en' },
  { code: 'mn', nativeName: 'Монгол', enName: 'Mongolian', arName: 'المنغولية', dir: 'ltr', countryCode: 'MN', dictLocale: 'ru' },
  { code: 'zh-TW', nativeName: '中文 (繁體)', enName: 'Chinese (Traditional)', arName: 'الصينية التقليدية', dir: 'ltr', countryCode: 'TW', dictLocale: 'zh' },
  { code: 'pt-BR', nativeName: 'Português (Brasil)', enName: 'Portuguese (Brazil)', arName: 'البرتغالية (البرازيل)', dir: 'ltr', countryCode: 'BR', dictLocale: 'pt' },
  { code: 'es-MX', nativeName: 'Español (Latinoamérica)', enName: 'Spanish (Latin America)', arName: 'الإسبانية (أمريكا اللاتينية)', dir: 'ltr', countryCode: 'MX', dictLocale: 'es' },
  { code: 'fr-CA', nativeName: 'Français (Canada)', enName: 'French (Canada)', arName: 'الفرنسية (كندا)', dir: 'ltr', countryCode: 'CA', dictLocale: 'fr' },
];

export function getWorldLanguage(code?: string): WorldLanguage {
  if (!code) return WORLD_LANGUAGES[0];
  const normalized = code.trim();
  const exact = WORLD_LANGUAGES.find(
    (l) => l.code.toLowerCase() === normalized.toLowerCase()
  );
  if (exact) return exact;
  const base = normalized.split('-')[0].toLowerCase();
  const byBase = WORLD_LANGUAGES.find((l) => l.code.toLowerCase() === base);
  if (byBase) return byBase;
  return WORLD_LANGUAGES[0];
}

const LANG_STORAGE_KEY = 'dorak_preferred_language';

export function getStoredLanguage(): string | null {
  try {
    return window.localStorage.getItem(LANG_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function storeLanguage(code: string): void {
  try {
    window.localStorage.setItem(LANG_STORAGE_KEY, code);
  } catch {
    // Ignore storage access restriction
  }
}
