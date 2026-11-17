import type { Timestamp } from 'firebase/firestore';

export type AccountMode = 'customer' | 'barber';
export type AppViewMode = 'customer' | 'barber' | 'admin';

export type ServiceType = 'haircut' | 'protein' | 'blowdry' | 'all';

export type TicketStatus = 'waiting' | 'called' | 'in_chair' | 'completed' | 'cancelled';

export type BillingCycle = 'monthly' | 'yearly' | 'per_booking';

export type SubscriptionStatus = 'active' | 'pending' | 'suspended';

export type VoiceCallStatus = 'ringing' | 'connected' | 'ended' | 'declined' | 'missed';

export type ComplaintStatus = 'open' | 'reviewed' | 'resolved';

export type ThemeColorId = 'gold' | 'emerald' | 'blue' | 'burgundy' | 'dark';

export type LanguageCode = string;

export type PaymentRegion = 'algeria' | 'international';

export type PaymentMethodId =
  | 'edahabia'
  | 'cib'
  | 'baridimob'
  | 'visa'
  | 'mastercard'
  | 'amex'
  | 'unionpay'
  | 'discover'
  | 'jcb'
  | 'mir'
  | 'paypal'
  | 'wise_paysera'
  | 'apple_pay'
  | 'google_pay';

export type SubscriptionPaymentStatus = 'paid' | 'pending_review' | 'rejected';

export const ADMIN_OWNER_EMAIL = 'abdeldjalilnabil@gmail.com';

export const PRIMARY_CUSTOM_HOSTNAME = 'www.salon-ntb.com';
export const PRIMARY_CUSTOM_DOMAIN = 'https://www.salon-ntb.com';

export const DEFAULT_WHATSAPP_COUNTRY_CODE = '213';

export const WHATSAPP_COUNTRY_PRESETS = [
  { code: '213', label: 'الجزائر (+213)' },
  { code: '212', label: 'المغرب (+212)' },
  { code: '216', label: 'تونس (+216)' },
  { code: '966', label: 'السعودية (+966)' },
  { code: '20', label: 'مصر (+20)' },
  { code: '971', label: 'الإمارات (+971)' },
  { code: '964', label: 'العراق (+964)' },
  { code: '962', label: 'الأردن (+962)' },
  { code: '974', label: 'قطر (+974)' },
  { code: '965', label: 'الكويت (+965)' },
] as const;

export const QUICK_BARBER_MESSAGES = [
  'حان دورك، يمكنك التقرب للمحل الآن.',
  'الكرسي جاهز لك الآن، تفضل بالحضور.',
  'يتبقى شخص واحد قبلك، استعد للتوجه للمحل.',
] as const;

export const QUICK_CUSTOMER_REPLIES = [
  'تم الاستلام، أنا قادم للمحل الآن.',
  'أنا قريب من المحل وسأصل خلال دقائق.',
] as const;

export const COMPLAINT_TYPE_PRESETS = [
  'تأخر كبير عن الموعد',
  'عدم الالتزام بترتيب الطابور',
  'سوء المعاملة أو الاستقبال',
  'النظافة أو جودة الخدمة',
  'اختلاف في السعر المتفق عليه',
] as const;

export const COMPLAINT_STATUS_LABELS: Record<ComplaintStatus, string> = {
  open: 'بلاغ جديد',
  reviewed: 'تم الاطلاع',
  resolved: 'تمت المعالجة',
};

export interface PlatformSettings {
  appName: string;
  appTagline: string;
  ownerName: string;
  ownerPhone?: string;
  designerName: string;
  designerLocation?: string;
  designerInstagram?: string;
  pricingEnabled: boolean;
  usagePrice: number;
  currency: string;
  billingCycle: BillingCycle;
  paymentInstructions: string;
  autoApproveCardPayments?: boolean;
  baridiMobRip?: string;
  ccpAccount?: string;
  chargilyPayUrl?: string;
  stripeCheckoutUrl?: string;
  paypalLink?: string;
  wiseIban?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  footerNote?: string;
  defaultTheme?: ThemeColorId;
  defaultLanguage?: LanguageCode;
  allowVoiceCalls?: boolean;
  allowWhatsApp?: boolean;
  allowInAppMessages?: boolean;
  allowDeferTurn?: boolean;
  allowComplaints?: boolean;
  allowBarberSocials?: boolean;
  allowLocationFilter?: boolean;
  allowNewBarberRegistration?: boolean;
  allowAppDownload?: boolean;
  androidDownloadUrl?: string;
  iosDownloadUrl?: string;
  desktopDownloadUrl?: string;
  maintenanceMode?: boolean;
  maintenanceMessage?: string;
  serviceHaircutLabel?: string;
  serviceProteinLabel?: string;
  serviceBlowdryLabel?: string;
  serviceAllLabel?: string;
  updatedAt?: Timestamp;
}

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  appName: 'دورك',
  appTagline: 'نظام ذكي لإدارة طابور الحلاقة وحجوزات الزبائن',
  ownerName: 'عبد الجليل نبيل',
  ownerPhone: '0557052602',
  designerName: 'عبد الجليل نبيل',
  designerLocation: 'الجزائر - معسكر',
  designerInstagram: '@nabil_tb_29',
  pricingEnabled: false,
  usagePrice: 1500,
  currency: 'دج',
  billingCycle: 'monthly',
  paymentInstructions:
    'لتفعيل اشتراك محلك، ادفع إلكترونياً بالبطاقة الذهبية أو CIB أو بريدي موب أو أي بطاقة دولية، أو تواصل مع صاحب التطبيق على الرقم 0557052602.',
  autoApproveCardPayments: true,
  baridiMobRip: '',
  ccpAccount: '',
  chargilyPayUrl: '',
  stripeCheckoutUrl: '',
  paypalLink: '',
  wiseIban: '',
  heroTitle: 'نظّم طابور صالونك واستدعِ زبائنك بضغطة زر واحدة',
  heroSubtitle:
    'ودّع عناء المكالمات المتكررة والانتظار الطويل. يحجز الزبون دوره باسمه ورقم هاتفه، ويتابع عدد المنتظرين ومكان المحل مباشرة، وعندما يضغط الحلاق «تابع العمل» يصل التنبيه والاتصال فوراً.',
  footerNote: '',
  defaultTheme: 'gold',
  defaultLanguage: 'ar',
  allowVoiceCalls: true,
  allowWhatsApp: true,
  allowInAppMessages: true,
  allowDeferTurn: true,
  allowComplaints: true,
  allowBarberSocials: true,
  allowLocationFilter: true,
  allowNewBarberRegistration: true,
  allowAppDownload: true,
  androidDownloadUrl: '',
  iosDownloadUrl: '',
  desktopDownloadUrl: '',
  maintenanceMode: false,
  maintenanceMessage:
    'التطبيق في وضع التحديث والصيانة المؤقتة من قِبل الإدارة، يرجى العودة بعد قليل.',
  serviceHaircutLabel: 'حلاقة',
  serviceProteinLabel: 'وضع بروتين',
  serviceBlowdryLabel: 'تجفيف شعر',
  serviceAllLabel: 'كلهم (الباقة الشاملة)',
};

export const BILLING_CYCLE_LABELS: Record<BillingCycle, string> = {
  monthly: 'شهرياً',
  yearly: 'سنوياً',
  per_booking: 'لكل حجز',
};

export const SUBSCRIPTION_STATUS_LABELS: Record<SubscriptionStatus, string> = {
  active: 'مفعّل',
  pending: 'بانتظار التفعيل',
  suspended: 'موقوف مؤقتاً',
};

export interface ServiceOption {
  id: ServiceType;
  label: string;
  shortDesc: string;
  durationMins: number;
}

export const SERVICE_OPTIONS: ServiceOption[] = [
  {
    id: 'haircut',
    label: 'حلاقة',
    shortDesc: 'قص وتهذيب الشعر والذقن بدقة',
    durationMins: 25,
  },
  {
    id: 'protein',
    label: 'وضع بروتين',
    shortDesc: 'علاج وتنعيم الشعر بالبروتين',
    durationMins: 45,
  },
  {
    id: 'blowdry',
    label: 'تجفيف شعر',
    shortDesc: 'غسيل وتصفيف وتجفيف حراري',
    durationMins: 20,
  },
  {
    id: 'all',
    label: 'كلهم (الباقة الشاملة)',
    shortDesc: 'حلاقة + بروتين + تجفيف شعر متكامل',
    durationMins: 75,
  },
];

export const SERVICE_LABELS: Record<ServiceType, string> = {
  haircut: 'حلاقة',
  protein: 'وضع بروتين',
  blowdry: 'تجفيف شعر',
  all: 'كلهم (حلاقة + بروتين + تجفيف)',
};

export function getEffectiveServiceLabel(
  serviceType: ServiceType,
  settings?: PlatformSettings
): string {
  switch (serviceType) {
    case 'haircut':
      return settings?.serviceHaircutLabel?.trim() || SERVICE_LABELS.haircut;
    case 'protein':
      return settings?.serviceProteinLabel?.trim() || SERVICE_LABELS.protein;
    case 'blowdry':
      return settings?.serviceBlowdryLabel?.trim() || SERVICE_LABELS.blowdry;
    case 'all':
      return settings?.serviceAllLabel?.trim() || SERVICE_LABELS.all;
  }
}

export const STATUS_LABELS: Record<TicketStatus, string> = {
  waiting: 'في الانتظار',
  called: 'جاري الاستدعاء الآن',
  in_chair: 'على الكرسي الآن',
  completed: 'مكتمل',
  cancelled: 'ملغي',
};

export const VALIDATION_LIMITS = {
  DISPLAY_NAME_MAX: 80,
  SHOP_NAME_MAX: 80,
  LOCATION_MAX: 160,
  COUNTRY_CODE_MAX: 10,
  COUNTRY_NAME_MAX: 80,
  STATE_NAME_MAX: 100,
  SOCIAL_URL_MAX: 200,
  CUSTOMER_NAME_MIN: 2,
  CUSTOMER_NAME_MAX: 60,
  PHONE_MIN: 6,
  PHONE_MAX: 25,
  PHONE_PATTERN: /^[0-9+\-\s()]{6,25}$/,
  AVATAR_MAX: 80000,
  APP_NAME_MIN: 2,
  APP_NAME_MAX: 60,
  TAGLINE_MAX: 140,
  HERO_TITLE_MAX: 140,
  HERO_SUBTITLE_MAX: 300,
  FOOTER_NOTE_MAX: 140,
  MAINTENANCE_MSG_MAX: 240,
  SERVICE_LABEL_MAX: 50,
  SERVICE_ALL_LABEL_MAX: 60,
  OWNER_NAME_MAX: 80,
  DESIGNER_NAME_MAX: 80,
  DESIGNER_LOCATION_MAX: 80,
  DESIGNER_INSTAGRAM_MAX: 60,
  CURRENCY_MAX: 20,
  PAYMENT_INSTRUCTIONS_MAX: 300,
  PAYMENT_REF_MAX: 80,
  PAYMENT_NOTE_MAX: 240,
  PAYMENT_ACCOUNT_MAX: 240,
  BARIDIMOB_RIP_MAX: 40,
  CCP_ACCOUNT_MAX: 40,
  PAYPAL_LINK_MAX: 140,
  WISE_IBAN_MAX: 100,
  DOWNLOAD_URL_MAX: 240,
  LANGUAGE_CODE_MAX: 10,
  MESSAGE_MAX: 400,
  COMPLAINT_TYPE_MIN: 2,
  COMPLAINT_TYPE_MAX: 80,
  COMPLAINT_DETAILS_MIN: 5,
  COMPLAINT_DETAILS_MAX: 500,
} as const;

export const PRESET_BARBER_AVATARS = [
  {
    id: 'master',
    label: 'صورة الحلاق الكلاسيكية',
    url: '/src/assets/images/barber_avatar_master_1794862632955.jpg',
  },
  {
    id: 'emblem',
    label: 'شعار المقص والموس الذهبي',
    url: '/src/assets/images/barber_brand_emblem_1794862632903.jpg',
  },
  {
    id: 'tools',
    label: 'عدة العناية الاحترافية',
    url: '/src/assets/images/barber_grooming_tools_1794862633514.jpg',
  },
] as const;

export const HERO_STUDIO_IMAGE = '/src/assets/images/barber_hero_studio_1794862632713.jpg';

export interface UserProfile {
  uid: string;
  displayName: string;
  phone: string;
  accountMode: AccountMode;
  barberId?: string;
  themeColor?: ThemeColorId;
  preferredLanguage?: LanguageCode;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface BarberShop {
  id: string;
  ownerUid: string;
  shopName: string;
  barberName: string;
  countryCode?: string;
  countryName?: string;
  stateName?: string;
  location: string;
  avatarUrl: string;
  whatsappCountryCode?: string;
  barberPhone?: string;
  facebookUrl?: string;
  tiktokUrl?: string;
  instagramUrl?: string;
  isOpen: boolean;
  isPublished: boolean;
  subscriptionStatus?: SubscriptionStatus;
  lastPaymentId?: string;
  waitingCount: number;
  nowServingNumber: number;
  nextTicketCounter: number;
  activeCallTicketId: string;
  activeCallNumber: number;
  avgMinutesPerClient: number;
  services: ServiceType[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface SubscriptionPayment {
  id: string;
  barberId: string;
  barberUid: string;
  shopName: string;
  payerName: string;
  region: PaymentRegion;
  paymentMethod: PaymentMethodId;
  cardBrand?: string;
  cardLast4?: string;
  referenceCode: string;
  amount: number;
  currency: string;
  billingCycle: BillingCycle;
  status: SubscriptionPaymentStatus;
  note?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface QueueTicket {
  id: string;
  barberId: string;
  barberUid: string;
  shopName: string;
  barberLocation: string;
  customerUid: string;
  customerName: string;
  customerPhone: string;
  serviceType: ServiceType;
  status: TicketStatus;
  ticketNumber: number;
  queueOrder: number;
  deferCount: number;
  callCount: number;
  lastBarberMessage?: string;
  lastBarberMessageAt?: Timestamp;
  lastCalledAt?: Timestamp;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface QueueSlot {
  ticketId: string;
  barberId: string;
  barberUid: string;
  customerUid: string;
  ticketNumber: number;
  queueOrder: number;
  serviceType: ServiceType;
  status: TicketStatus;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  barberId: string;
  barberUid: string;
  customerUid: string;
  senderUid: string;
  senderRole: 'barber' | 'customer';
  senderName: string;
  text: string;
  createdAt?: Timestamp;
}

export interface VoiceCall {
  id: string;
  barberId: string;
  barberUid: string;
  customerUid: string;
  ticketId: string;
  shopName: string;
  customerName: string;
  status: VoiceCallStatus;
  offerSdp: string;
  answerSdp?: string;
  endedByUid?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface IceCandidateDoc {
  barberUid: string;
  customerUid: string;
  senderUid: string;
  candidate: string;
  sdpMid: string;
  sdpMLineIndex: number;
  createdAt?: Timestamp;
}

export interface BarberComplaint {
  id: string;
  barberId: string;
  barberUid: string;
  shopName: string;
  customerUid: string;
  customerName: string;
  complaintType: string;
  details: string;
  status: ComplaintStatus;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}
