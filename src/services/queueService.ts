import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  type AccountMode,
  type BarberShop,
  type BillingCycle,
  type LanguageCode,
  type PaymentMethodId,
  type PaymentRegion,
  type QueueSlot,
  type QueueTicket,
  type ServiceType,
  type SubscriptionStatus,
  type ThemeColorId,
  type UserProfile,
  VALIDATION_LIMITS,
} from '../types';

function sanitizeString(value: string, maxLen: number): string {
  return value.trim().slice(0, maxLen);
}

export async function savePlatformSettings(params: {
  appName: string;
  appTagline: string;
  ownerName: string;
  ownerPhone: string;
  designerName: string;
  designerLocation: string;
  designerInstagram: string;
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
}): Promise<void> {
  const path = 'platform/settings';
  const appName = sanitizeString(params.appName, VALIDATION_LIMITS.APP_NAME_MAX);
  const appTagline = sanitizeString(params.appTagline, VALIDATION_LIMITS.TAGLINE_MAX);
  const ownerName = sanitizeString(params.ownerName, VALIDATION_LIMITS.OWNER_NAME_MAX);
  const ownerPhone = sanitizeString(params.ownerPhone, VALIDATION_LIMITS.PHONE_MAX);
  const designerName = sanitizeString(params.designerName, VALIDATION_LIMITS.DESIGNER_NAME_MAX);
  const designerLocation = sanitizeString(
    params.designerLocation,
    VALIDATION_LIMITS.DESIGNER_LOCATION_MAX
  );
  const designerInstagram = sanitizeString(
    params.designerInstagram,
    VALIDATION_LIMITS.DESIGNER_INSTAGRAM_MAX
  );
  const currency = sanitizeString(params.currency, VALIDATION_LIMITS.CURRENCY_MAX) || 'دج';
  const paymentInstructions = sanitizeString(
    params.paymentInstructions,
    VALIDATION_LIMITS.PAYMENT_INSTRUCTIONS_MAX
  );
  const usagePrice = Math.max(0, Math.min(1000000, Number(params.usagePrice) || 0));
  const defaultLangClean =
    sanitizeString(params.defaultLanguage || 'ar', VALIDATION_LIMITS.LANGUAGE_CODE_MAX) || 'ar';

  if (appName.length < VALIDATION_LIMITS.APP_NAME_MIN) {
    throw new Error('يرجى إدخال اسم التطبيق (حرفان على الأقل).');
  }
  if (ownerName.length < 1 || designerName.length < 1) {
    throw new Error('يرجى إدخال اسم صاحب التطبيق واسم المصمم.');
  }

  try {
    await setDoc(doc(db, 'platform', 'settings'), {
      appName,
      appTagline,
      ownerName,
      ownerPhone,
      designerName,
      designerLocation,
      designerInstagram,
      pricingEnabled: Boolean(params.pricingEnabled),
      usagePrice,
      currency,
      billingCycle: params.billingCycle,
      paymentInstructions,
      autoApproveCardPayments: params.autoApproveCardPayments !== false,
      baridiMobRip: sanitizeString(params.baridiMobRip || '', VALIDATION_LIMITS.BARIDIMOB_RIP_MAX),
      ccpAccount: sanitizeString(params.ccpAccount || '', VALIDATION_LIMITS.CCP_ACCOUNT_MAX),
      chargilyPayUrl: sanitizeString(params.chargilyPayUrl || '', VALIDATION_LIMITS.PAYMENT_ACCOUNT_MAX),
      stripeCheckoutUrl: sanitizeString(params.stripeCheckoutUrl || '', VALIDATION_LIMITS.PAYMENT_ACCOUNT_MAX),
      paypalLink: sanitizeString(params.paypalLink || '', VALIDATION_LIMITS.PAYPAL_LINK_MAX),
      wiseIban: sanitizeString(params.wiseIban || '', VALIDATION_LIMITS.WISE_IBAN_MAX),
      heroTitle: sanitizeString(params.heroTitle || '', VALIDATION_LIMITS.HERO_TITLE_MAX),
      heroSubtitle: sanitizeString(params.heroSubtitle || '', VALIDATION_LIMITS.HERO_SUBTITLE_MAX),
      footerNote: sanitizeString(params.footerNote || '', VALIDATION_LIMITS.FOOTER_NOTE_MAX),
      defaultTheme: params.defaultTheme || 'gold',
      defaultLanguage: defaultLangClean.length >= 2 ? defaultLangClean : 'ar',
      allowVoiceCalls: params.allowVoiceCalls !== false,
      allowWhatsApp: params.allowWhatsApp !== false,
      allowInAppMessages: params.allowInAppMessages !== false,
      allowDeferTurn: params.allowDeferTurn !== false,
      allowComplaints: params.allowComplaints !== false,
      allowBarberSocials: params.allowBarberSocials !== false,
      allowLocationFilter: params.allowLocationFilter !== false,
      allowNewBarberRegistration: params.allowNewBarberRegistration !== false,
      allowAppDownload: params.allowAppDownload !== false,
      androidDownloadUrl: sanitizeString(
        params.androidDownloadUrl || '',
        VALIDATION_LIMITS.DOWNLOAD_URL_MAX
      ),
      iosDownloadUrl: sanitizeString(
        params.iosDownloadUrl || '',
        VALIDATION_LIMITS.DOWNLOAD_URL_MAX
      ),
      desktopDownloadUrl: sanitizeString(
        params.desktopDownloadUrl || '',
        VALIDATION_LIMITS.DOWNLOAD_URL_MAX
      ),
      maintenanceMode: Boolean(params.maintenanceMode),
      maintenanceMessage: sanitizeString(
        params.maintenanceMessage || '',
        VALIDATION_LIMITS.MAINTENANCE_MSG_MAX
      ),
      serviceHaircutLabel: sanitizeString(
        params.serviceHaircutLabel || 'حلاقة',
        VALIDATION_LIMITS.SERVICE_LABEL_MAX
      ),
      serviceProteinLabel: sanitizeString(
        params.serviceProteinLabel || 'وضع بروتين',
        VALIDATION_LIMITS.SERVICE_LABEL_MAX
      ),
      serviceBlowdryLabel: sanitizeString(
        params.serviceBlowdryLabel || 'تجفيف شعر',
        VALIDATION_LIMITS.SERVICE_LABEL_MAX
      ),
      serviceAllLabel: sanitizeString(
        params.serviceAllLabel || 'كلهم (الباقة الشاملة)',
        VALIDATION_LIMITS.SERVICE_ALL_LABEL_MAX
      ),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function adminUpdateBarberSubscription(params: {
  barberId: string;
  subscriptionStatus: SubscriptionStatus;
  isOpen?: boolean;
}): Promise<void> {
  const path = `barbers/${params.barberId}`;
  const payload: Record<string, unknown> = {
    subscriptionStatus: params.subscriptionStatus,
    updatedAt: serverTimestamp(),
  };
  if (params.isOpen !== undefined) {
    payload.isOpen = params.isOpen;
  }
  try {
    await updateDoc(doc(db, 'barbers', params.barberId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function submitBarberPayment(params: {
  barber: BarberShop;
  payerName: string;
  region: PaymentRegion;
  paymentMethod: PaymentMethodId;
  cardBrand?: string;
  cardLast4?: string;
  referenceCode: string;
  amount: number;
  currency: string;
  billingCycle: BillingCycle;
  instantActivate: boolean;
  note?: string;
}): Promise<string> {
  const payerName = sanitizeString(params.payerName, VALIDATION_LIMITS.DISPLAY_NAME_MAX);
  const referenceCode = sanitizeString(params.referenceCode, VALIDATION_LIMITS.PAYMENT_REF_MAX);
  const cardBrand = sanitizeString(params.cardBrand || '', 30);
  const rawLast4 = (params.cardLast4 || '').replace(/\D/g, '').slice(-4);
  const cardLast4 = rawLast4.length === 4 ? rawLast4 : '';
  const currency = sanitizeString(params.currency || 'DZD', VALIDATION_LIMITS.CURRENCY_MAX) || 'DZD';
  const amount = Math.max(0, Math.min(10000000, Number(params.amount) || 0));
  const note = sanitizeString(params.note || '', VALIDATION_LIMITS.PAYMENT_NOTE_MAX);

  if (payerName.length < 2) {
    throw new Error('يرجى إدخال اسم صاحب البطاقة أو المرسل.');
  }
  if (referenceCode.length < 2) {
    throw new Error('يرجى إدخال مرجع العملية.');
  }

  const paymentId = `pay_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const paymentRef = doc(db, 'barbers', params.barber.id, 'payments', paymentId);
  const barberRef = doc(db, 'barbers', params.barber.id);

  const canInstantActivate =
    params.instantActivate && params.barber.subscriptionStatus !== 'suspended';

  const batch = writeBatch(db);
  batch.set(paymentRef, {
    id: paymentId,
    barberId: params.barber.id,
    barberUid: params.barber.ownerUid,
    shopName: sanitizeString(params.barber.shopName, VALIDATION_LIMITS.SHOP_NAME_MAX) || 'Shop',
    payerName,
    region: params.region,
    paymentMethod: params.paymentMethod,
    cardBrand,
    cardLast4,
    referenceCode,
    amount,
    currency,
    billingCycle: params.billingCycle,
    status: canInstantActivate ? 'paid' : 'pending_review',
    note,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  if (canInstantActivate) {
    batch.update(barberRef, {
      lastPaymentId: paymentId,
      subscriptionStatus: 'active',
      isOpen: true,
      updatedAt: serverTimestamp(),
    });
  } else {
    batch.update(barberRef, {
      lastPaymentId: paymentId,
      updatedAt: serverTimestamp(),
    });
  }

  try {
    await batch.commit();
    return paymentId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `barbers/${params.barber.id}/payments/${paymentId}`);
  }
}

export async function adminReviewBarberPayment(params: {
  barberId: string;
  paymentId: string;
  decision: 'paid' | 'rejected';
  note?: string;
}): Promise<void> {
  const paymentRef = doc(db, 'barbers', params.barberId, 'payments', params.paymentId);
  const barberRef = doc(db, 'barbers', params.barberId);
  const batch = writeBatch(db);

  batch.update(paymentRef, {
    status: params.decision,
    note: sanitizeString(params.note || '', VALIDATION_LIMITS.PAYMENT_NOTE_MAX),
    updatedAt: serverTimestamp(),
  });

  if (params.decision === 'paid') {
    batch.update(barberRef, {
      subscriptionStatus: 'active',
      isOpen: true,
      updatedAt: serverTimestamp(),
    });
  }

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(
      error,
      OperationType.UPDATE,
      `barbers/${params.barberId}/payments/${params.paymentId}`
    );
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return null;
    return snap.data() as UserProfile;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function upsertUserProfile(params: {
  uid: string;
  displayName: string;
  phone: string;
  accountMode: AccountMode;
  barberId?: string;
  themeColor?: ThemeColorId;
  preferredLanguage?: LanguageCode;
}): Promise<void> {
  const path = `users/${params.uid}`;
  const ref = doc(db, 'users', params.uid);
  const displayName =
    sanitizeString(params.displayName || 'مستخدم', VALIDATION_LIMITS.DISPLAY_NAME_MAX) || 'مستخدم';
  const phone = sanitizeString(params.phone || '', VALIDATION_LIMITS.PHONE_MAX);
  const prefLang = params.preferredLanguage
    ? sanitizeString(params.preferredLanguage, VALIDATION_LIMITS.LANGUAGE_CODE_MAX)
    : undefined;

  try {
    const existing = await getDoc(ref);
    if (!existing.exists()) {
      const payload: Record<string, unknown> = {
        uid: params.uid,
        displayName,
        phone,
        accountMode: params.accountMode,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      if (params.barberId) {
        payload.barberId = sanitizeString(params.barberId, 128);
      }
      if (params.themeColor) {
        payload.themeColor = params.themeColor;
      }
      if (prefLang && prefLang.length >= 2) {
        payload.preferredLanguage = prefLang;
      }
      await setDoc(ref, payload);
    } else {
      const updatePayload: Record<string, unknown> = {
        displayName,
        phone,
        accountMode: params.accountMode,
        updatedAt: serverTimestamp(),
      };
      if (params.barberId !== undefined) {
        updatePayload.barberId = sanitizeString(params.barberId, 128);
      }
      if (params.themeColor) {
        updatePayload.themeColor = params.themeColor;
      }
      if (prefLang && prefLang.length >= 2) {
        updatePayload.preferredLanguage = prefLang;
      }
      await updateDoc(ref, updatePayload);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateUserPersonalProfile(params: {
  uid: string;
  displayName: string;
  phone: string;
  themeColor?: ThemeColorId;
  preferredLanguage?: LanguageCode;
}): Promise<void> {
  const path = `users/${params.uid}`;
  const displayName = sanitizeString(params.displayName, VALIDATION_LIMITS.DISPLAY_NAME_MAX);
  const phone = sanitizeString(params.phone, VALIDATION_LIMITS.PHONE_MAX);

  if (displayName.length < 2) {
    throw new Error('يرجى إدخال اسمك الكامل (حرفان على الأقل).');
  }
  if (phone && !VALIDATION_LIMITS.PHONE_PATTERN.test(phone)) {
    throw new Error('يرجى إدخال رقم هاتف صحيح.');
  }

  const payload: Record<string, unknown> = {
    displayName,
    phone,
    updatedAt: serverTimestamp(),
  };
  if (params.themeColor) {
    payload.themeColor = params.themeColor;
  }
  if (params.preferredLanguage && params.preferredLanguage.trim().length >= 2) {
    payload.preferredLanguage = sanitizeString(
      params.preferredLanguage,
      VALIDATION_LIMITS.LANGUAGE_CODE_MAX
    );
  }

  try {
    await updateDoc(doc(db, 'users', params.uid), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function saveUserThemeColor(
  uid: string,
  themeColor: ThemeColorId
): Promise<void> {
  const path = `users/${uid}`;
  try {
    await updateDoc(doc(db, 'users', uid), {
      themeColor,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.warn(`Unable to persist theme color (${path}):`, error);
  }
}

export async function saveUserLanguagePreference(
  uid: string,
  languageCode: LanguageCode
): Promise<void> {
  const clean = sanitizeString(languageCode, VALIDATION_LIMITS.LANGUAGE_CODE_MAX);
  if (clean.length < 2) return;
  const path = `users/${uid}`;
  try {
    await updateDoc(doc(db, 'users', uid), {
      preferredLanguage: clean,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.warn(`Unable to persist language preference (${path}):`, error);
  }
}

export async function saveBarberShop(params: {
  ownerUid: string;
  shopName: string;
  barberName: string;
  countryCode: string;
  countryName: string;
  stateName: string;
  location: string;
  avatarUrl: string;
  whatsappCountryCode?: string;
  barberPhone?: string;
  facebookUrl?: string;
  tiktokUrl?: string;
  instagramUrl?: string;
  isOpen: boolean;
  avgMinutesPerClient: number;
  services: ServiceType[];
  initialSubscriptionStatus?: SubscriptionStatus;
}): Promise<void> {
  const path = `barbers/${params.ownerUid}`;
  const ref = doc(db, 'barbers', params.ownerUid);

  const shopName = sanitizeString(params.shopName, VALIDATION_LIMITS.SHOP_NAME_MAX);
  const barberName = sanitizeString(params.barberName, VALIDATION_LIMITS.DISPLAY_NAME_MAX);
  const countryCode = sanitizeString(params.countryCode || 'DZ', VALIDATION_LIMITS.COUNTRY_CODE_MAX).toUpperCase();
  const countryName = sanitizeString(params.countryName || 'الجزائر', VALIDATION_LIMITS.COUNTRY_NAME_MAX);
  const stateName = sanitizeString(params.stateName || '', VALIDATION_LIMITS.STATE_NAME_MAX);
  const location = sanitizeString(params.location, VALIDATION_LIMITS.LOCATION_MAX);
  const avatarUrl = params.avatarUrl.slice(0, VALIDATION_LIMITS.AVATAR_MAX);
  const whatsappCountryCode = (params.whatsappCountryCode || '213').replace(/\D/g, '').slice(0, 6) || '213';
  const barberPhone = sanitizeString(params.barberPhone || '', VALIDATION_LIMITS.PHONE_MAX);
  const facebookUrl = sanitizeString(params.facebookUrl || '', VALIDATION_LIMITS.SOCIAL_URL_MAX);
  const tiktokUrl = sanitizeString(params.tiktokUrl || '', VALIDATION_LIMITS.SOCIAL_URL_MAX);
  const instagramUrl = sanitizeString(params.instagramUrl || '', VALIDATION_LIMITS.SOCIAL_URL_MAX);
  const avgMinutesPerClient = Math.max(5, Math.min(180, Math.round(params.avgMinutesPerClient || 20)));
  const services: ServiceType[] =
    params.services.length > 0 ? params.services.slice(0, 4) : ['haircut', 'protein', 'blowdry', 'all'];

  try {
    const existing = await getDoc(ref);
    if (!existing.exists()) {
      await setDoc(ref, {
        ownerUid: params.ownerUid,
        shopName,
        barberName,
        countryCode,
        countryName,
        stateName,
        location,
        avatarUrl,
        whatsappCountryCode,
        barberPhone,
        facebookUrl,
        tiktokUrl,
        instagramUrl,
        isOpen: params.isOpen,
        isPublished: true,
        subscriptionStatus:
          params.initialSubscriptionStatus === 'pending' ? 'pending' : 'active',
        waitingCount: 0,
        nowServingNumber: 0,
        nextTicketCounter: 1,
        activeCallTicketId: '',
        activeCallNumber: 0,
        avgMinutesPerClient,
        services,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(ref, {
        shopName,
        barberName,
        countryCode,
        countryName,
        stateName,
        location,
        avatarUrl,
        whatsappCountryCode,
        barberPhone,
        facebookUrl,
        tiktokUrl,
        instagramUrl,
        isOpen: params.isOpen,
        isPublished: true,
        avgMinutesPerClient,
        services,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function toggleBarberOpenState(barberId: string, isOpen: boolean): Promise<void> {
  const path = `barbers/${barberId}`;
  try {
    await updateDoc(doc(db, 'barbers', barberId), {
      isOpen,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function bookCustomerSeat(params: {
  barberId: string;
  customerUid: string;
  customerName: string;
  customerPhone: string;
  serviceType: ServiceType;
}): Promise<{ ticketId: string; ticketNumber: number }> {
  const barberRef = doc(db, 'barbers', params.barberId);
  const customerName = sanitizeString(params.customerName, VALIDATION_LIMITS.CUSTOMER_NAME_MAX);
  const customerPhone = sanitizeString(params.customerPhone, VALIDATION_LIMITS.PHONE_MAX);

  if (customerName.length < VALIDATION_LIMITS.CUSTOMER_NAME_MIN) {
    throw new Error('يرجى إدخال الاسم الكامل (حرفان على الأقل).');
  }
  if (!VALIDATION_LIMITS.PHONE_PATTERN.test(customerPhone)) {
    throw new Error('يرجى إدخال رقم هاتف صحيح.');
  }

  try {
    const result = await runTransaction(db, async (tx) => {
      const barberSnap = await tx.get(barberRef);
      if (!barberSnap.exists()) {
        throw new Error('الحلاق غير موجود.');
      }
      const barber = barberSnap.data() as BarberShop;
      if (!barber.isOpen || barber.subscriptionStatus === 'suspended') {
        throw new Error('هذا المحل مغلق مؤقتاً ولا يستقبل حجوزات جديدة حالياً.');
      }

      const ticketNumber = barber.nextTicketCounter;
      const ticketId = `${params.customerUid}_${ticketNumber}`;
      const queueOrder = ticketNumber * 1000;

      const queueRef = doc(db, 'barbers', params.barberId, 'queue', ticketId);
      const slotRef = doc(db, 'barbers', params.barberId, 'slots', ticketId);

      tx.set(queueRef, {
        id: ticketId,
        barberId: params.barberId,
        barberUid: barber.ownerUid,
        shopName: sanitizeString(barber.shopName, VALIDATION_LIMITS.SHOP_NAME_MAX),
        barberLocation: sanitizeString(barber.location, VALIDATION_LIMITS.LOCATION_MAX),
        customerUid: params.customerUid,
        customerName,
        customerPhone,
        serviceType: params.serviceType,
        status: 'waiting',
        ticketNumber,
        queueOrder,
        deferCount: 0,
        callCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      tx.set(slotRef, {
        ticketId,
        barberId: params.barberId,
        barberUid: barber.ownerUid,
        customerUid: params.customerUid,
        ticketNumber,
        queueOrder,
        serviceType: params.serviceType,
        status: 'waiting',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      tx.update(barberRef, {
        waitingCount: barber.waitingCount + 1,
        nextTicketCounter: barber.nextTicketCounter + 1,
        updatedAt: serverTimestamp(),
      });

      return { ticketId, ticketNumber };
    });

    return result;
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes('الحلاق') ||
        error.message.includes('مغلق') ||
        error.message.includes('يرجى'))
    ) {
      throw error;
    }
    handleFirestoreError(error, OperationType.WRITE, `barbers/${params.barberId}/queue`);
  }
}

export async function sendTicketMessage(params: {
  ticket: QueueTicket;
  senderUid: string;
  senderRole: 'barber' | 'customer';
  senderName: string;
  text: string;
}): Promise<void> {
  const cleanText = sanitizeString(params.text, VALIDATION_LIMITS.MESSAGE_MAX);
  if (!cleanText) {
    throw new Error('يرجى كتابة نص الرسالة أولاً.');
  }
  const cleanSenderName =
    sanitizeString(params.senderName, VALIDATION_LIMITS.DISPLAY_NAME_MAX) || 'مستخدم';
  const msgId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const msgRef = doc(
    db,
    'barbers',
    params.ticket.barberId,
    'queue',
    params.ticket.id,
    'messages',
    msgId
  );

  const batch = writeBatch(db);
  batch.set(msgRef, {
    id: msgId,
    ticketId: params.ticket.id,
    barberId: params.ticket.barberId,
    barberUid: params.ticket.barberUid,
    customerUid: params.ticket.customerUid,
    senderUid: params.senderUid,
    senderRole: params.senderRole,
    senderName: cleanSenderName,
    text: cleanText,
    createdAt: serverTimestamp(),
  });

  if (params.senderRole === 'barber') {
    batch.update(doc(db, 'barbers', params.ticket.barberId, 'queue', params.ticket.id), {
      lastBarberMessage: cleanText,
      lastBarberMessageAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(
      error,
      OperationType.WRITE,
      `barbers/${params.ticket.barberId}/queue/${params.ticket.id}/messages/${msgId}`
    );
  }
}

export async function callNextCustomer(params: {
  barber: BarberShop;
  tickets: QueueTicket[];
}): Promise<QueueTicket | null> {
  const { barber, tickets } = params;
  const sorted = [...tickets].sort((a, b) => a.queueOrder - b.queueOrder);

  const activeCurrent = sorted.filter(
    (t) => t.status === 'in_chair' || t.status === 'called'
  );
  const waitingList = sorted.filter((t) => t.status === 'waiting');
  const nextTicket = waitingList[0] ?? null;

  const batch = writeBatch(db);
  const barberRef = doc(db, 'barbers', barber.id);

  for (const t of activeCurrent) {
    batch.update(doc(db, 'barbers', barber.id, 'queue', t.id), {
      status: 'completed',
      updatedAt: serverTimestamp(),
    });
    batch.update(doc(db, 'barbers', barber.id, 'slots', t.id), {
      status: 'completed',
      updatedAt: serverTimestamp(),
    });
  }

  if (nextTicket) {
    const turnMessage = 'حان دورك الآن، يمكنك التقرب للمحل.';
    const msgId = `msg_turn_${Date.now()}`;

    batch.update(doc(db, 'barbers', barber.id, 'queue', nextTicket.id), {
      status: 'called',
      callCount: Math.min(20, (nextTicket.callCount || 0) + 1),
      lastCalledAt: serverTimestamp(),
      lastBarberMessage: turnMessage,
      lastBarberMessageAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    batch.update(doc(db, 'barbers', barber.id, 'slots', nextTicket.id), {
      status: 'called',
      updatedAt: serverTimestamp(),
    });
    batch.set(
      doc(db, 'barbers', barber.id, 'queue', nextTicket.id, 'messages', msgId),
      {
        id: msgId,
        ticketId: nextTicket.id,
        barberId: barber.id,
        barberUid: barber.ownerUid,
        customerUid: nextTicket.customerUid,
        senderUid: barber.ownerUid,
        senderRole: 'barber',
        senderName: sanitizeString(barber.shopName, VALIDATION_LIMITS.DISPLAY_NAME_MAX),
        text: turnMessage,
        createdAt: serverTimestamp(),
      }
    );

    const remainingCount = waitingList.length;
    batch.update(barberRef, {
      waitingCount: remainingCount,
      nowServingNumber: nextTicket.ticketNumber,
      activeCallTicketId: nextTicket.id,
      activeCallNumber: nextTicket.ticketNumber,
      updatedAt: serverTimestamp(),
    });
  } else {
    batch.update(barberRef, {
      waitingCount: 0,
      activeCallTicketId: '',
      activeCallNumber: 0,
      updatedAt: serverTimestamp(),
    });
  }

  try {
    await batch.commit();
    return nextTicket;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `barbers/${barber.id}`);
  }
}

export async function recallCustomer(barberId: string, ticket: QueueTicket): Promise<void> {
  const batch = writeBatch(db);
  batch.update(doc(db, 'barbers', barberId, 'queue', ticket.id), {
    status: 'called',
    callCount: Math.min(20, (ticket.callCount || 0) + 1),
    lastCalledAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  batch.update(doc(db, 'barbers', barberId, 'slots', ticket.id), {
    status: 'called',
    updatedAt: serverTimestamp(),
  });
  batch.update(doc(db, 'barbers', barberId), {
    activeCallTicketId: ticket.id,
    activeCallNumber: ticket.ticketNumber,
    nowServingNumber: ticket.ticketNumber,
    updatedAt: serverTimestamp(),
  });

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `barbers/${barberId}/queue/${ticket.id}`);
  }
}

export async function barberSetTicketStatus(params: {
  barber: BarberShop;
  ticket: QueueTicket;
  newStatus: 'in_chair' | 'completed' | 'cancelled';
  allTickets: QueueTicket[];
}): Promise<void> {
  const { barber, ticket, newStatus, allTickets } = params;
  const batch = writeBatch(db);

  batch.update(doc(db, 'barbers', barber.id, 'queue', ticket.id), {
    status: newStatus,
    updatedAt: serverTimestamp(),
  });
  batch.update(doc(db, 'barbers', barber.id, 'slots', ticket.id), {
    status: newStatus,
    updatedAt: serverTimestamp(),
  });

  const remainingWaiting = allTickets.filter(
    (t) => t.id !== ticket.id && (t.status === 'waiting' || t.status === 'called')
  ).length;

  const barberUpdate: Record<string, unknown> = {
    waitingCount: remainingWaiting,
    updatedAt: serverTimestamp(),
  };

  if (newStatus === 'in_chair') {
    barberUpdate.nowServingNumber = ticket.ticketNumber;
    if (barber.activeCallTicketId === ticket.id) {
      barberUpdate.activeCallTicketId = '';
      barberUpdate.activeCallNumber = 0;
    }
  } else if (barber.activeCallTicketId === ticket.id) {
    barberUpdate.activeCallTicketId = '';
    barberUpdate.activeCallNumber = 0;
  }

  batch.update(doc(db, 'barbers', barber.id), barberUpdate);

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `barbers/${barber.id}/queue/${ticket.id}`);
  }
}

export async function syncBarberWaitingCount(barberId: string, actualCount: number): Promise<void> {
  try {
    await updateDoc(doc(db, 'barbers', barberId), {
      waitingCount: Math.max(0, actualCount),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `barbers/${barberId}`);
  }
}

export async function deferCustomerTurn(params: {
  ticket: QueueTicket;
  slots: QueueSlot[];
  barber: BarberShop | undefined;
}): Promise<void> {
  const { ticket, slots, barber } = params;
  const waitingSlots = slots
    .filter((s) => s.status === 'waiting' && s.ticketId !== ticket.id)
    .sort((a, b) => a.queueOrder - b.queueOrder);

  const behindSlots =
    ticket.status === 'called'
      ? waitingSlots
      : waitingSlots.filter((s) => s.queueOrder > ticket.queueOrder);

  if (behindSlots.length === 0) {
    throw new Error('لا يوجد زبون بعدك في الطابور حالياً لتقديمه قبلك.');
  }

  const nextCustomerSlot = behindSlots[0];
  const afterNextSlot = behindSlots[1];
  const newQueueOrder = afterNextSlot
    ? (nextCustomerSlot.queueOrder + afterNextSlot.queueOrder) / 2
    : nextCustomerSlot.queueOrder + 1000;

  const batch = writeBatch(db);
  batch.update(doc(db, 'barbers', ticket.barberId, 'queue', ticket.id), {
    queueOrder: newQueueOrder,
    deferCount: Math.min(20, (ticket.deferCount || 0) + 1),
    status: 'waiting',
    updatedAt: serverTimestamp(),
  });
  batch.update(doc(db, 'barbers', ticket.barberId, 'slots', ticket.id), {
    queueOrder: newQueueOrder,
    status: 'waiting',
    updatedAt: serverTimestamp(),
  });

  if (barber && barber.activeCallTicketId === ticket.id) {
    batch.update(doc(db, 'barbers', ticket.barberId), {
      waitingCount: barber.waitingCount,
      activeCallTicketId: '',
      activeCallNumber: 0,
      updatedAt: serverTimestamp(),
    });
  }

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(
      error,
      OperationType.UPDATE,
      `barbers/${ticket.barberId}/queue/${ticket.id}`
    );
  }
}

export async function confirmCustomerArrival(params: {
  ticket: QueueTicket;
  barber: BarberShop | undefined;
}): Promise<void> {
  const { ticket, barber } = params;
  const batch = writeBatch(db);

  batch.update(doc(db, 'barbers', ticket.barberId, 'queue', ticket.id), {
    status: 'in_chair',
    updatedAt: serverTimestamp(),
  });
  batch.update(doc(db, 'barbers', ticket.barberId, 'slots', ticket.id), {
    status: 'in_chair',
    updatedAt: serverTimestamp(),
  });

  if (barber && barber.activeCallTicketId === ticket.id) {
    batch.update(doc(db, 'barbers', ticket.barberId), {
      waitingCount: Math.max(0, barber.waitingCount - 1),
      activeCallTicketId: '',
      activeCallNumber: 0,
      updatedAt: serverTimestamp(),
    });
  }

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(
      error,
      OperationType.UPDATE,
      `barbers/${ticket.barberId}/queue/${ticket.id}`
    );
  }
}

export async function submitBarberComplaint(params: {
  barber: BarberShop;
  customerUid: string;
  customerName: string;
  complaintType: string;
  details: string;
}): Promise<string> {
  const complaintType = sanitizeString(
    params.complaintType,
    VALIDATION_LIMITS.COMPLAINT_TYPE_MAX
  );
  const details = sanitizeString(params.details, VALIDATION_LIMITS.COMPLAINT_DETAILS_MAX);
  const customerName =
    sanitizeString(params.customerName || 'زبون', VALIDATION_LIMITS.CUSTOMER_NAME_MAX) ||
    'زبون';

  if (complaintType.length < VALIDATION_LIMITS.COMPLAINT_TYPE_MIN) {
    throw new Error('يرجى كتابة أو اختيار نوع الشكوى.');
  }
  if (details.length < VALIDATION_LIMITS.COMPLAINT_DETAILS_MIN) {
    throw new Error('يرجى كتابة تفاصيل الشكوى (5 أحرف على الأقل).');
  }

  const complaintId = `cmp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const path = `barbers/${params.barber.id}/complaints/${complaintId}`;

  try {
    await setDoc(doc(db, 'barbers', params.barber.id, 'complaints', complaintId), {
      id: complaintId,
      barberId: params.barber.id,
      barberUid: params.barber.ownerUid,
      shopName: sanitizeString(params.barber.shopName, VALIDATION_LIMITS.SHOP_NAME_MAX),
      customerUid: params.customerUid,
      customerName,
      complaintType,
      details,
      status: 'open',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return complaintId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateComplaintStatus(params: {
  barberId: string;
  complaintId: string;
  status: 'reviewed' | 'resolved';
}): Promise<void> {
  const path = `barbers/${params.barberId}/complaints/${params.complaintId}`;
  try {
    await updateDoc(doc(db, 'barbers', params.barberId, 'complaints', params.complaintId), {
      status: params.status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function cancelCustomerTicket(params: {
  ticket: QueueTicket;
  barber: BarberShop | undefined;
}): Promise<void> {
  const { ticket, barber } = params;
  const batch = writeBatch(db);

  batch.update(doc(db, 'barbers', ticket.barberId, 'queue', ticket.id), {
    status: 'cancelled',
    updatedAt: serverTimestamp(),
  });
  batch.update(doc(db, 'barbers', ticket.barberId, 'slots', ticket.id), {
    status: 'cancelled',
    updatedAt: serverTimestamp(),
  });

  if (barber) {
    if (barber.activeCallTicketId === ticket.id) {
      batch.update(doc(db, 'barbers', ticket.barberId), {
        waitingCount: Math.max(0, barber.waitingCount - 1),
        activeCallTicketId: '',
        activeCallNumber: 0,
        updatedAt: serverTimestamp(),
      });
    } else if (ticket.status === 'waiting') {
      batch.update(doc(db, 'barbers', ticket.barberId), {
        waitingCount: Math.max(0, barber.waitingCount - 1),
        updatedAt: serverTimestamp(),
      });
    }
  }

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(
      error,
      OperationType.UPDATE,
      `barbers/${ticket.barberId}/queue/${ticket.id}`
    );
  }
}
