import React, { useEffect, useState } from 'react';
import {
  collection,
  collectionGroup,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import {
  ShieldCheck,
  Tag,
  User,
  Sparkles,
  Store,
  CheckCircle2,
  PauseCircle,
  Clock,
  MapPin,
  AlertTriangle,
  Sliders,
  Palette,
  Globe,
  CreditCard,
  XCircle,
  Copy,
  Check,
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  DEFAULT_PLATFORM_SETTINGS,
  PRIMARY_CUSTOM_DOMAIN,
  PRIMARY_CUSTOM_HOSTNAME,
  VALIDATION_LIMITS,
  type BarberComplaint,
  type BarberShop,
  type BillingCycle,
  type PlatformSettings,
  type SubscriptionPayment,
  type SubscriptionStatus,
  type ThemeColorId,
} from '../types';
import {
  adminReviewBarberPayment,
  adminUpdateBarberSubscription,
  savePlatformSettings,
  updateComplaintStatus,
} from '../services/queueService';
import { WORLD_LANGUAGES } from '../i18n/languages';
import { useI18n } from '../i18n/I18nContext';
import { getPaymentMethodMeta } from '../utils/paymentCards';
import { APP_THEMES } from '../utils/theme';
import { CountryFlag } from './CountryFlag';

interface OwnerAdminPanelProps {
  platformSettings: PlatformSettings;
}

export const OwnerAdminPanel: React.FC<OwnerAdminPanelProps> = ({
  platformSettings,
}) => {
  const {
    t,
    getLocalizedCountryName,
    getLocalizedBillingLabel,
    getLocalizedSubscriptionLabel,
    getLocalizedComplaintStatus,
  } = useI18n();

  const [adminTab, setAdminTab] = useState<'identity' | 'features' | 'pricing'>('identity');

  // Identity, Texts, Language & Theme state
  const [appName, setAppName] = useState(platformSettings.appName);
  const [appTagline, setAppTagline] = useState(platformSettings.appTagline);
  const [heroTitle, setHeroTitle] = useState(
    platformSettings.heroTitle || DEFAULT_PLATFORM_SETTINGS.heroTitle || ''
  );
  const [heroSubtitle, setHeroSubtitle] = useState(
    platformSettings.heroSubtitle || DEFAULT_PLATFORM_SETTINGS.heroSubtitle || ''
  );
  const [footerNote, setFooterNote] = useState(platformSettings.footerNote || '');
  const [defaultTheme, setDefaultTheme] = useState<ThemeColorId>(
    platformSettings.defaultTheme || 'gold'
  );
  const [defaultLanguage, setDefaultLanguage] = useState<string>(
    platformSettings.defaultLanguage || 'ar'
  );
  const [ownerName, setOwnerName] = useState(platformSettings.ownerName);
  const [ownerPhone, setOwnerPhone] = useState(
    platformSettings.ownerPhone || DEFAULT_PLATFORM_SETTINGS.ownerPhone || '0557052602'
  );
  const [designerName, setDesignerName] = useState(platformSettings.designerName);
  const [designerLocation, setDesignerLocation] = useState(
    platformSettings.designerLocation ||
      DEFAULT_PLATFORM_SETTINGS.designerLocation ||
      'الجزائر - معسكر'
  );
  const [designerInstagram, setDesignerInstagram] = useState(
    platformSettings.designerInstagram ||
      DEFAULT_PLATFORM_SETTINGS.designerInstagram ||
      '@nabil_tb_29'
  );

  // Global Feature Controls state
  const [allowVoiceCalls, setAllowVoiceCalls] = useState(
    platformSettings.allowVoiceCalls !== false
  );
  const [allowWhatsApp, setAllowWhatsApp] = useState(
    platformSettings.allowWhatsApp !== false
  );
  const [allowInAppMessages, setAllowInAppMessages] = useState(
    platformSettings.allowInAppMessages !== false
  );
  const [allowDeferTurn, setAllowDeferTurn] = useState(
    platformSettings.allowDeferTurn !== false
  );
  const [allowComplaints, setAllowComplaints] = useState(
    platformSettings.allowComplaints !== false
  );
  const [allowBarberSocials, setAllowBarberSocials] = useState(
    platformSettings.allowBarberSocials !== false
  );
  const [allowLocationFilter, setAllowLocationFilter] = useState(
    platformSettings.allowLocationFilter !== false
  );
  const [allowNewBarberRegistration, setAllowNewBarberRegistration] = useState(
    platformSettings.allowNewBarberRegistration !== false
  );
  const [allowAppDownload, setAllowAppDownload] = useState(
    platformSettings.allowAppDownload !== false
  );
  const [androidDownloadUrl, setAndroidDownloadUrl] = useState(
    platformSettings.androidDownloadUrl || ''
  );
  const [iosDownloadUrl, setIosDownloadUrl] = useState(
    platformSettings.iosDownloadUrl || ''
  );
  const [desktopDownloadUrl, setDesktopDownloadUrl] = useState(
    platformSettings.desktopDownloadUrl || ''
  );
  const [maintenanceMode, setMaintenanceMode] = useState(
    Boolean(platformSettings.maintenanceMode)
  );
  const [maintenanceMessage, setMaintenanceMessage] = useState(
    platformSettings.maintenanceMessage || DEFAULT_PLATFORM_SETTINGS.maintenanceMessage || ''
  );

  // Custom Service Labels
  const [serviceHaircutLabel, setServiceHaircutLabel] = useState(
    platformSettings.serviceHaircutLabel || DEFAULT_PLATFORM_SETTINGS.serviceHaircutLabel || 'حلاقة'
  );
  const [serviceProteinLabel, setServiceProteinLabel] = useState(
    platformSettings.serviceProteinLabel ||
      DEFAULT_PLATFORM_SETTINGS.serviceProteinLabel ||
      'وضع بروتين'
  );
  const [serviceBlowdryLabel, setServiceBlowdryLabel] = useState(
    platformSettings.serviceBlowdryLabel ||
      DEFAULT_PLATFORM_SETTINGS.serviceBlowdryLabel ||
      'تجفيف شعر'
  );
  const [serviceAllLabel, setServiceAllLabel] = useState(
    platformSettings.serviceAllLabel ||
      DEFAULT_PLATFORM_SETTINGS.serviceAllLabel ||
      'كلهم (الباقة الشاملة)'
  );

  // Pricing & Electronic Payment Gateway state
  const [pricingEnabled, setPricingEnabled] = useState(platformSettings.pricingEnabled);
  const [usagePrice, setUsagePrice] = useState(String(platformSettings.usagePrice));
  const [currency, setCurrency] = useState(platformSettings.currency);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(platformSettings.billingCycle);
  const [paymentInstructions, setPaymentInstructions] = useState(
    platformSettings.paymentInstructions
  );
  const [autoApproveCardPayments, setAutoApproveCardPayments] = useState(
    platformSettings.autoApproveCardPayments !== false
  );
  const [baridiMobRip, setBaridiMobRip] = useState(platformSettings.baridiMobRip || '');
  const [ccpAccount, setCcpAccount] = useState(platformSettings.ccpAccount || '');
  const [chargilyPayUrl, setChargilyPayUrl] = useState(platformSettings.chargilyPayUrl || '');
  const [stripeCheckoutUrl, setStripeCheckoutUrl] = useState(
    platformSettings.stripeCheckoutUrl || ''
  );
  const [paypalLink, setPaypalLink] = useState(platformSettings.paypalLink || '');
  const [wiseIban, setWiseIban] = useState(platformSettings.wiseIban || '');

  const [saving, setSaving] = useState(false);
  const [updatingBarberId, setUpdatingBarberId] = useState<string | null>(null);
  const [updatingComplaintId, setUpdatingComplaintId] = useState<string | null>(null);
  const [updatingPaymentId, setUpdatingPaymentId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );
  const [barbers, setBarbers] = useState<BarberShop[]>([]);
  const [allComplaints, setAllComplaints] = useState<BarberComplaint[]>([]);
  const [allPayments, setAllPayments] = useState<SubscriptionPayment[]>([]);
  const [copiedDomain, setCopiedDomain] = useState(false);

  useEffect(() => {
    setAppName(platformSettings.appName);
    setAppTagline(platformSettings.appTagline);
    setHeroTitle(platformSettings.heroTitle || DEFAULT_PLATFORM_SETTINGS.heroTitle || '');
    setHeroSubtitle(
      platformSettings.heroSubtitle || DEFAULT_PLATFORM_SETTINGS.heroSubtitle || ''
    );
    setFooterNote(platformSettings.footerNote || '');
    setDefaultTheme(platformSettings.defaultTheme || 'gold');
    setDefaultLanguage(platformSettings.defaultLanguage || 'ar');
    setOwnerName(platformSettings.ownerName);
    setOwnerPhone(
      platformSettings.ownerPhone || DEFAULT_PLATFORM_SETTINGS.ownerPhone || '0557052602'
    );
    setDesignerName(platformSettings.designerName);
    setDesignerLocation(
      platformSettings.designerLocation ||
        DEFAULT_PLATFORM_SETTINGS.designerLocation ||
        'الجزائر - معسكر'
    );
    setDesignerInstagram(
      platformSettings.designerInstagram ||
        DEFAULT_PLATFORM_SETTINGS.designerInstagram ||
        '@nabil_tb_29'
    );
    setAllowVoiceCalls(platformSettings.allowVoiceCalls !== false);
    setAllowWhatsApp(platformSettings.allowWhatsApp !== false);
    setAllowInAppMessages(platformSettings.allowInAppMessages !== false);
    setAllowDeferTurn(platformSettings.allowDeferTurn !== false);
    setAllowComplaints(platformSettings.allowComplaints !== false);
    setAllowBarberSocials(platformSettings.allowBarberSocials !== false);
    setAllowLocationFilter(platformSettings.allowLocationFilter !== false);
    setAllowNewBarberRegistration(platformSettings.allowNewBarberRegistration !== false);
    setAllowAppDownload(platformSettings.allowAppDownload !== false);
    setAndroidDownloadUrl(platformSettings.androidDownloadUrl || '');
    setIosDownloadUrl(platformSettings.iosDownloadUrl || '');
    setDesktopDownloadUrl(platformSettings.desktopDownloadUrl || '');
    setMaintenanceMode(Boolean(platformSettings.maintenanceMode));
    setMaintenanceMessage(
      platformSettings.maintenanceMessage || DEFAULT_PLATFORM_SETTINGS.maintenanceMessage || ''
    );
    setServiceHaircutLabel(
      platformSettings.serviceHaircutLabel || DEFAULT_PLATFORM_SETTINGS.serviceHaircutLabel || 'حلاقة'
    );
    setServiceProteinLabel(
      platformSettings.serviceProteinLabel ||
        DEFAULT_PLATFORM_SETTINGS.serviceProteinLabel ||
        'وضع بروتين'
    );
    setServiceBlowdryLabel(
      platformSettings.serviceBlowdryLabel ||
        DEFAULT_PLATFORM_SETTINGS.serviceBlowdryLabel ||
        'تجفيف شعر'
    );
    setServiceAllLabel(
      platformSettings.serviceAllLabel ||
        DEFAULT_PLATFORM_SETTINGS.serviceAllLabel ||
        'كلهم (الباقة الشاملة)'
    );
    setPricingEnabled(platformSettings.pricingEnabled);
    setUsagePrice(String(platformSettings.usagePrice));
    setCurrency(platformSettings.currency);
    setBillingCycle(platformSettings.billingCycle);
    setPaymentInstructions(platformSettings.paymentInstructions);
    setAutoApproveCardPayments(platformSettings.autoApproveCardPayments !== false);
    setBaridiMobRip(platformSettings.baridiMobRip || '');
    setCcpAccount(platformSettings.ccpAccount || '');
    setChargilyPayUrl(platformSettings.chargilyPayUrl || '');
    setStripeCheckoutUrl(platformSettings.stripeCheckoutUrl || '');
    setPaypalLink(platformSettings.paypalLink || '');
    setWiseIban(platformSettings.wiseIban || '');
  }, [platformSettings]);

  useEffect(() => {
    const path = 'barbers';
    const q = query(collection(db, 'barbers'), where('isPublished', '==', true));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as BarberShop);
        setBarbers(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
    return () => unsub();
  }, []);

  useEffect(() => {
    const path = 'complaints';
    const unsub = onSnapshot(
      collectionGroup(db, 'complaints'),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as BarberComplaint);
        list.sort((a, b) => {
          const at = a.createdAt?.toMillis?.() ?? 0;
          const bt = b.createdAt?.toMillis?.() ?? 0;
          return bt - at;
        });
        setAllComplaints(list);
      },
      (error) => {
        console.warn(`Admin complaints listener (${path}):`, error.message);
      }
    );
    return () => unsub();
  }, []);

  useEffect(() => {
    const path = 'payments';
    const unsub = onSnapshot(
      collectionGroup(db, 'payments'),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as SubscriptionPayment);
        list.sort((a, b) => {
          const at = a.createdAt?.toMillis?.() ?? 0;
          const bt = b.createdAt?.toMillis?.() ?? 0;
          return bt - at;
        });
        setAllPayments(list);
      },
      (error) => {
        console.warn(`Admin payments listener (${path}):`, error.message);
      }
    );
    return () => unsub();
  }, []);

  const handleSaveAll = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      await savePlatformSettings({
        appName,
        appTagline,
        ownerName,
        ownerPhone,
        designerName,
        designerLocation,
        designerInstagram,
        pricingEnabled,
        usagePrice: Number(usagePrice) || 0,
        currency,
        billingCycle,
        paymentInstructions,
        autoApproveCardPayments,
        baridiMobRip,
        ccpAccount,
        chargilyPayUrl,
        stripeCheckoutUrl,
        paypalLink,
        wiseIban,
        heroTitle,
        heroSubtitle,
        footerNote,
        defaultTheme,
        defaultLanguage,
        allowVoiceCalls,
        allowWhatsApp,
        allowInAppMessages,
        allowDeferTurn,
        allowComplaints,
        allowBarberSocials,
        allowLocationFilter,
        allowNewBarberRegistration,
        allowAppDownload,
        androidDownloadUrl,
        iosDownloadUrl,
        desktopDownloadUrl,
        maintenanceMode,
        maintenanceMessage,
        serviceHaircutLabel,
        serviceProteinLabel,
        serviceBlowdryLabel,
        serviceAllLabel,
      });
      setFeedback({
        type: 'success',
        text: 'تم حفظ إعدادات صاحب التطبيق ومميزاته ونصوصه وبوابات الدفع وتعميمها فوراً.',
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'تعذر حفظ الإعدادات.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSubscriptionChange = async (
    barberId: string,
    status: SubscriptionStatus
  ) => {
    setUpdatingBarberId(barberId);
    setFeedback(null);
    try {
      await adminUpdateBarberSubscription({
        barberId,
        subscriptionStatus: status,
        isOpen: status === 'suspended' ? false : undefined,
      });
      setFeedback({
        type: 'success',
        text: `${t.barberSubscriptionLabel} ${getLocalizedSubscriptionLabel(status)}`,
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'تعذر تحديث حالة الاشتراك.',
      });
    } finally {
      setUpdatingBarberId(null);
    }
  };

  const handleReviewPayment = async (
    pay: SubscriptionPayment,
    decision: 'paid' | 'rejected'
  ) => {
    setUpdatingPaymentId(pay.id);
    setFeedback(null);
    try {
      await adminReviewBarberPayment({
        barberId: pay.barberId,
        paymentId: pay.id,
        decision,
        note: decision === 'paid' ? 'Confirmed by Owner' : 'Rejected by Owner',
      });
      setFeedback({
        type: 'success',
        text:
          decision === 'paid'
            ? `تم تأكيد دفعة ${pay.shopName} وتفعيل الاشتراك بنجاح.`
            : `تم رفض وصل الدفع للمحل ${pay.shopName}.`,
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'تعذر تحديث حالة الدفع.',
      });
    } finally {
      setUpdatingPaymentId(null);
    }
  };

  const activeBarbersCount = barbers.filter(
    (b) => (b.subscriptionStatus || 'active') === 'active'
  ).length;
  const pendingBarbersCount = barbers.filter(
    (b) => b.subscriptionStatus === 'pending'
  ).length;

  const featureToggleItems = [
    {
      id: 'allowVoiceCalls',
      title: 'المكالمات الصوتية أونلاين (WebRTC)',
      desc: 'السماح للعامل بإجراء اتصال صوتي مباشر مع الزبون عبر الإنترنت.',
      value: allowVoiceCalls,
      setter: setAllowVoiceCalls,
    },
    {
      id: 'allowWhatsApp',
      title: 'التواصل عبر واتساب',
      desc: 'إظهار أزرار المراسلة والاتصال السريع عبر واتساب للزبون والعامل.',
      value: allowWhatsApp,
      setter: setAllowWhatsApp,
    },
    {
      id: 'allowInAppMessages',
      title: 'الرسائل الفورية داخل التطبيق',
      desc: 'تمكين إرسال رسائل «حان دورك يمكنك التقرب للمحل» والردود الفورية.',
      value: allowInAppMessages,
      setter: setAllowInAppMessages,
    },
    {
      id: 'allowDeferTurn',
      title: 'ميزة «قم بتقديم زبون قبلي»',
      desc: 'السماح للزبون بتأجيل دوره وتقديم الزبون الذي يليه عند عدم القدرة على الالتحاق.',
      value: allowDeferTurn,
      setter: setAllowDeferTurn,
    },
    {
      id: 'allowComplaints',
      title: 'نظام تقديم الشكاوى والبلاغات',
      desc: 'تمكين الزبون من تقديم شكوى عن العامل وإرسال بلاغ فوري له.',
      value: allowComplaints,
      setter: setAllowComplaints,
    },
    {
      id: 'allowBarberSocials',
      title: 'روابط التواصل الاجتماعي للعامل',
      desc: 'السماح للحلاقين بإضافة وعرض حسابات فيسبوك وتيك توك وإنستغرام.',
      value: allowBarberSocials,
      setter: setAllowBarberSocials,
    },
    {
      id: 'allowLocationFilter',
      title: 'اختيار البلد والولاية وأعلام الدول',
      desc: 'تفعيل شريط تصفية البلدان والولايات وصور الأعلام في الواجهة.',
      value: allowLocationFilter,
      setter: setAllowLocationFilter,
    },
    {
      id: 'allowNewBarberRegistration',
      title: 'تسجيل محلات وعاملين جدد',
      desc: 'السماح بإنشاء حسابات محلات جديدة (إيقافه يمنع أي تسجيل جديد دون إذنك).',
      value: allowNewBarberRegistration,
      setter: setAllowNewBarberRegistration,
    },
    {
      id: 'allowAppDownload',
      title: 'زر «تحميل التطبيق» (Android / iOS / الحاسوب)',
      desc: 'إظهار نافذة تحميل وتثبيت التطبيق على الهواتف وأجهزة الكمبيوتر.',
      value: allowAppDownload,
      setter: setAllowAppDownload,
    },
  ];

  const themeLabels: Record<ThemeColorId, string> = {
    gold: t.themeGold,
    emerald: t.themeEmerald,
    blue: t.themeBlue,
    burgundy: t.themeBurgundy,
    dark: t.themeDark,
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Owner Header Banner */}
      <div className="bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[var(--theme-primary)] text-[var(--theme-primary-text)] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-extrabold text-[var(--theme-text)]">
              {t.adminHeaderTitle}
            </h1>
            <p className="text-sm text-[var(--theme-muted)] mt-1">
              {t.adminHeaderDesc}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm">
          <div>
            <div className="text-xs text-[var(--theme-muted)]">{t.adminStatShops}</div>
            <div className="font-mono-num text-xl font-extrabold text-[var(--theme-text)]">
              {barbers.length}
            </div>
          </div>
          <div>
            <div className="text-xs text-[var(--theme-muted)]">{t.adminStatActive}</div>
            <div className="font-mono-num text-xl font-extrabold text-[#15803D]">
              {activeBarbersCount}
            </div>
          </div>
          <div>
            <div className="text-xs text-[var(--theme-muted)]">{t.adminStatPending}</div>
            <div className="font-mono-num text-xl font-extrabold text-[var(--theme-accent)]">
              {pendingBarbersCount}
            </div>
          </div>
        </div>
      </div>

      {/* Owner Segmented Navigation */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-2xl w-fit">
        <button
          type="button"
          onClick={() => setAdminTab('identity')}
          className={`px-4 py-2 text-xs font-bold rounded-xl inline-flex items-center gap-2 transition-colors min-h-[40px] ${
            adminTab === 'identity'
              ? 'bg-[var(--theme-primary)] text-[var(--theme-primary-text)]'
              : 'text-[var(--theme-muted)] hover:text-[var(--theme-text)]'
          }`}
        >
          <User className="w-4 h-4" />
          <span>{t.adminTabIdentity}</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminTab('features')}
          className={`px-4 py-2 text-xs font-bold rounded-xl inline-flex items-center gap-2 transition-colors min-h-[40px] ${
            adminTab === 'features'
              ? 'bg-[var(--theme-primary)] text-[var(--theme-primary-text)]'
              : 'text-[var(--theme-muted)] hover:text-[var(--theme-text)]'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>{t.adminTabFeatures}</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminTab('pricing')}
          className={`px-4 py-2 text-xs font-bold rounded-xl inline-flex items-center gap-2 transition-colors min-h-[40px] ${
            adminTab === 'pricing'
              ? 'bg-[var(--theme-primary)] text-[var(--theme-primary-text)]'
              : 'text-[var(--theme-muted)] hover:text-[var(--theme-text)]'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>{t.adminTabPricing}</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-sm ${
            feedback.type === 'error'
              ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
              : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
          }`}
        >
          {feedback.text}
        </div>
      )}

      {adminTab === 'identity' && (
        <form
          onSubmit={(e) => void handleSaveAll(e)}
          className="bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-2xl p-6 sm:p-8 space-y-6"
        >
          <div className="flex items-center gap-2 pb-3 border-b border-[var(--theme-border)]">
            <User className="w-4 h-4 text-[var(--theme-accent)]" />
            <h2 className="font-display text-lg font-extrabold text-[var(--theme-text)]">
              {t.adminTabIdentity}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="platformAppName" className="block text-sm font-semibold text-[var(--theme-text)] mb-1.5">
                اسم التطبيق
              </label>
              <input
                id="platformAppName"
                type="text"
                required
                minLength={VALIDATION_LIMITS.APP_NAME_MIN}
                maxLength={VALIDATION_LIMITS.APP_NAME_MAX}
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                className="w-full px-4 py-2.5 bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] rounded-xl text-sm text-[var(--theme-text)] focus:outline-none focus:border-[var(--theme-accent)]"
              />
            </div>

            <div>
              <label htmlFor="platformTagline" className="block text-sm font-semibold text-[var(--theme-text)] mb-1.5">
                الشعار النصي المختصر
              </label>
              <input
                id="platformTagline"
                type="text"
                maxLength={VALIDATION_LIMITS.TAGLINE_MAX}
                value={appTagline}
                onChange={(e) => setAppTagline(e.target.value)}
                className="w-full px-4 py-2.5 bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] rounded-xl text-sm text-[var(--theme-text)] focus:outline-none focus:border-[var(--theme-accent)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="platformHeroTitle" className="block text-sm font-semibold text-[var(--theme-text)] mb-1.5">
                عنوان الواجهة الرئيسية (صفحة الدخول)
              </label>
              <input
                id="platformHeroTitle"
                type="text"
                maxLength={VALIDATION_LIMITS.HERO_TITLE_MAX}
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] rounded-xl text-sm text-[var(--theme-text)] focus:outline-none focus:border-[var(--theme-accent)]"
              />
            </div>

            <div>
              <label htmlFor="platformFooterNote" className="block text-sm font-semibold text-[var(--theme-text)] mb-1.5">
                ملاحظة إضافية في أسفل التطبيق (اختياري)
              </label>
              <input
                id="platformFooterNote"
                type="text"
                maxLength={VALIDATION_LIMITS.FOOTER_NOTE_MAX}
                value={footerNote}
                onChange={(e) => setFooterNote(e.target.value)}
                placeholder="مثال: خدمة العملاء متوفرة يومياً"
                className="w-full px-4 py-2.5 bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] rounded-xl text-sm text-[var(--theme-text)] focus:outline-none focus:border-[var(--theme-accent)]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="platformHeroSubtitle" className="block text-sm font-semibold text-[var(--theme-text)] mb-1.5">
              الوصف التفصيلي في واجهة البداية
            </label>
            <textarea
              id="platformHeroSubtitle"
              rows={2}
              maxLength={VALIDATION_LIMITS.HERO_SUBTITLE_MAX}
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] rounded-xl text-sm text-[var(--theme-text)] focus:outline-none focus:border-[var(--theme-accent)]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-2 border-t border-[var(--theme-border)]">
            <div>
              <label htmlFor="platformOwnerName" className="block text-sm font-semibold text-[var(--theme-text)] mb-1.5">
                اسم صاحب التطبيق
              </label>
              <input
                id="platformOwnerName"
                type="text"
                required
                maxLength={VALIDATION_LIMITS.OWNER_NAME_MAX}
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full px-4 py-2.5 bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] rounded-xl text-sm text-[var(--theme-text)] focus:outline-none focus:border-[var(--theme-accent)]"
              />
            </div>

            <div>
              <label htmlFor="platformOwnerPhone" className="block text-sm font-semibold text-[var(--theme-text)] mb-1.5">
                رقم الهاتف الشخصي لصاحب التطبيق
              </label>
              <input
                id="platformOwnerPhone"
                type="tel"
                dir="ltr"
                maxLength={VALIDATION_LIMITS.PHONE_MAX}
                value={ownerPhone}
                onChange={(e) => setOwnerPhone(e.target.value)}
                className="w-full px-4 py-2.5 bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] rounded-xl text-sm font-mono-num text-[var(--theme-text)] text-start focus:outline-none focus:border-[var(--theme-accent)]"
              />
            </div>

            <div>
              <label htmlFor="platformDesignerName" className="block text-sm font-semibold text-[var(--theme-text)] mb-1.5">
                اسم مصمم التطبيق
              </label>
              <input
                id="platformDesignerName"
                type="text"
                required
                maxLength={VALIDATION_LIMITS.DESIGNER_NAME_MAX}
                value={designerName}
                onChange={(e) => setDesignerName(e.target.value)}
                className="w-full px-4 py-2.5 bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] rounded-xl text-sm text-[var(--theme-text)] focus:outline-none focus:border-[var(--theme-accent)]"
              />
            </div>

            <div>
              <label htmlFor="platformDesignerLocation" className="block text-sm font-semibold text-[var(--theme-text)] mb-1.5">
                بلد مصمم التطبيق
              </label>
              <input
                id="platformDesignerLocation"
                type="text"
                maxLength={VALIDATION_LIMITS.DESIGNER_LOCATION_MAX}
                value={designerLocation}
                onChange={(e) => setDesignerLocation(e.target.value)}
                className="w-full px-4 py-2.5 bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] rounded-xl text-sm text-[var(--theme-text)] focus:outline-none focus:border-[var(--theme-accent)]"
              />
            </div>

            <div>
              <label htmlFor="platformDesignerIg" className="block text-sm font-semibold text-[var(--theme-text)] mb-1.5">
                حساب إنستغرام المصمم
              </label>
              <input
                id="platformDesignerIg"
                type="text"
                dir="ltr"
                maxLength={VALIDATION_LIMITS.DESIGNER_INSTAGRAM_MAX}
                value={designerInstagram}
                onChange={(e) => setDesignerInstagram(e.target.value)}
                className="w-full px-4 py-2.5 bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] rounded-xl text-sm text-[var(--theme-text)] text-left focus:outline-none focus:border-[var(--theme-accent)]"
              />
            </div>

            <div>
              <label htmlFor="platformDefaultLang" className="block text-sm font-semibold text-[var(--theme-text)] mb-1.5">
                <span className="inline-flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[var(--theme-accent)]" />
                  <span>{t.adminDefaultLangLabel}</span>
                </span>
              </label>
              <select
                id="platformDefaultLang"
                value={defaultLanguage}
                onChange={(e) => setDefaultLanguage(e.target.value)}
                className="w-full px-4 py-2.5 bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] rounded-xl text-sm text-[var(--theme-text)] focus:outline-none focus:border-[var(--theme-accent)]"
              >
                {WORLD_LANGUAGES.map((wl) => (
                  <option key={wl.code} value={wl.code}>
                    {wl.nativeName} — {wl.enName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Default Platform Theme Color */}
          <div className="pt-3 border-t border-[var(--theme-border)] space-y-3">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-[var(--theme-accent)]" />
              <p className="text-sm font-semibold text-[var(--theme-text)]">
                {t.adminDefaultThemeLabel}
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {APP_THEMES.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setDefaultTheme(theme.id)}
                  className={`p-3 rounded-xl border text-start flex items-center gap-2.5 transition-colors ${
                    defaultTheme === theme.id
                      ? 'border-[var(--theme-accent)] bg-[var(--theme-surface-muted)] font-bold'
                      : 'border-[var(--theme-border)] bg-[var(--theme-surface)]'
                  }`}
                >
                  <span
                    className="w-5 h-5 rounded-full border border-black/15 shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${theme.swatchAccent} 55%, ${theme.swatchBg} 55%)`,
                    }}
                  />
                  <span className="text-xs text-[var(--theme-text)]">
                    {themeLabels[theme.id] || theme.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto py-3.5 px-8 bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-[var(--theme-primary-text)] text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 min-h-[48px] disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{saving ? t.custSaving : t.adminSaveIdentity}</span>
          </button>
        </form>
      )}

      {adminTab === 'features' && (
        <form
          onSubmit={(e) => void handleSaveAll(e)}
          className="bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-2xl p-6 sm:p-8 space-y-6"
        >
          <div className="flex items-center justify-between gap-4 pb-3 border-b border-[var(--theme-border)]">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[var(--theme-accent)]" />
              <h2 className="font-display text-lg font-extrabold text-[var(--theme-text)]">
                التحكم الكامل بمميزات وخصائص التطبيق
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featureToggleItems.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] flex items-center justify-between gap-4"
              >
                <div>
                  <p className="text-sm font-bold text-[var(--theme-text)]">{item.title}</p>
                  <p className="text-xs text-[var(--theme-muted)] mt-0.5 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => item.setter(!item.value)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 min-w-[78px] transition-colors ${
                    item.value
                      ? 'bg-[#15803D] text-white'
                      : 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                  }`}
                >
                  {item.value ? 'مفعّل' : 'متوقف'}
                </button>
              </div>
            ))}
          </div>

          {/* Service Names Customization */}
          <div className="pt-4 border-t border-[var(--theme-border)] space-y-4">
            <div>
              <h3 className="font-display text-base font-bold text-[var(--theme-text)]">
                تعديل مسميات خدمات الحلاقة في التطبيق
              </h3>
              <p className="text-xs text-[var(--theme-muted)] mt-0.5">
                لا يمكن لأي عامل أو زبون تغيير مسميات الخدمات — أنت فقط تتحكم بها.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label htmlFor="svcHaircut" className="block text-xs font-semibold text-[var(--theme-text)] mb-1">
                  الخدمة الأولى
                </label>
                <input
                  id="svcHaircut"
                  type="text"
                  maxLength={VALIDATION_LIMITS.SERVICE_LABEL_MAX}
                  value={serviceHaircutLabel}
                  onChange={(e) => setServiceHaircutLabel(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] rounded-xl text-sm text-[var(--theme-text)]"
                />
              </div>
              <div>
                <label htmlFor="svcProtein" className="block text-xs font-semibold text-[var(--theme-text)] mb-1">
                  الخدمة الثانية
                </label>
                <input
                  id="svcProtein"
                  type="text"
                  maxLength={VALIDATION_LIMITS.SERVICE_LABEL_MAX}
                  value={serviceProteinLabel}
                  onChange={(e) => setServiceProteinLabel(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] rounded-xl text-sm text-[var(--theme-text)]"
                />
              </div>
              <div>
                <label htmlFor="svcBlowdry" className="block text-xs font-semibold text-[var(--theme-text)] mb-1">
                  الخدمة الثالثة
                </label>
                <input
                  id="svcBlowdry"
                  type="text"
                  maxLength={VALIDATION_LIMITS.SERVICE_LABEL_MAX}
                  value={serviceBlowdryLabel}
                  onChange={(e) => setServiceBlowdryLabel(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] rounded-xl text-sm text-[var(--theme-text)]"
                />
              </div>
              <div>
                <label htmlFor="svcAll" className="block text-xs font-semibold text-[var(--theme-text)] mb-1">
                  الباقة الشاملة
                </label>
                <input
                  id="svcAll"
                  type="text"
                  maxLength={VALIDATION_LIMITS.SERVICE_ALL_LABEL_MAX}
                  value={serviceAllLabel}
                  onChange={(e) => setServiceAllLabel(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] rounded-xl text-sm text-[var(--theme-text)]"
                />
              </div>
            </div>
          </div>

          {/* Maintenance Mode */}
          <div className="pt-4 border-t border-[var(--theme-border)] space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-base font-bold text-[var(--theme-text)]">
                  وضع الصيانة والتنبيه العام
                </h3>
                <p className="text-xs text-[var(--theme-muted)] mt-0.5">
                  عند تفعيله يظهر تنبيه إداري أعلى شاشة الزبائن والعاملين.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMaintenanceMode((prev) => !prev)}
                className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 ${
                  maintenanceMode
                    ? 'bg-amber-600 text-white'
                    : 'bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] text-[var(--theme-text)]'
                }`}
              >
                {maintenanceMode ? 'وضع الصيانة مفعّل' : 'إيقاف وضع الصيانة'}
              </button>
            </div>
            {maintenanceMode && (
              <input
                type="text"
                maxLength={VALIDATION_LIMITS.MAINTENANCE_MSG_MAX}
                value={maintenanceMessage}
                onChange={(e) => setMaintenanceMessage(e.target.value)}
                placeholder="رسالة التنبيه التي تظهر للمستخدمين..."
                className="w-full px-4 py-2.5 bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] rounded-xl text-sm text-[var(--theme-text)]"
              />
            )}
          </div>

          {/* Optional Custom Download URLs for Android / iOS / Desktop */}
          <div className="pt-4 border-t border-[var(--theme-border)] space-y-3">
            <div>
              <h3 className="font-display text-base font-bold text-[var(--theme-text)]">
                روابط تحميل التطبيق المباشرة (اختياري)
              </h3>
              <p className="text-xs text-[var(--theme-muted)] mt-0.5">
                التثبيت الفوري (PWA) يعمل تلقائياً بدون روابط، ويمكنك هنا إضافة روابط متجر أو APK أو ملف سطح مكتب مخصصة.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="androidDlUrl" className="block text-xs font-semibold text-[var(--theme-text)] mb-1">
                  رابط أندرويد (APK / Google Play)
                </label>
                <input
                  id="androidDlUrl"
                  type="url"
                  dir="ltr"
                  maxLength={VALIDATION_LIMITS.DOWNLOAD_URL_MAX}
                  value={androidDownloadUrl}
                  onChange={(e) => setAndroidDownloadUrl(e.target.value)}
                  placeholder="https://play.google.com/..."
                  className="w-full px-3.5 py-2 bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] rounded-xl text-xs text-[var(--theme-text)]"
                />
              </div>
              <div>
                <label htmlFor="iosDlUrl" className="block text-xs font-semibold text-[var(--theme-text)] mb-1">
                  رابط آيفون (App Store / iOS)
                </label>
                <input
                  id="iosDlUrl"
                  type="url"
                  dir="ltr"
                  maxLength={VALIDATION_LIMITS.DOWNLOAD_URL_MAX}
                  value={iosDownloadUrl}
                  onChange={(e) => setIosDownloadUrl(e.target.value)}
                  placeholder="https://apps.apple.com/..."
                  className="w-full px-3.5 py-2 bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] rounded-xl text-xs text-[var(--theme-text)]"
                />
              </div>
              <div>
                <label htmlFor="desktopDlUrl" className="block text-xs font-semibold text-[var(--theme-text)] mb-1">
                  رابط الحاسوب (Windows / Mac)
                </label>
                <input
                  id="desktopDlUrl"
                  type="url"
                  dir="ltr"
                  maxLength={VALIDATION_LIMITS.DOWNLOAD_URL_MAX}
                  value={desktopDownloadUrl}
                  onChange={(e) => setDesktopDownloadUrl(e.target.value)}
                  placeholder="https://example.com/setup.exe"
                  className="w-full px-3.5 py-2 bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] rounded-xl text-xs text-[var(--theme-text)]"
                />
              </div>
            </div>
          </div>

          {/* Custom Domain & Google Search / Browser Publishing Card */}
          <div className="pt-4 border-t border-[var(--theme-border)] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[var(--theme-accent)]" />
                <h3 className="font-display text-base font-bold text-[var(--theme-text)]">
                  تشغيل التطبيق على متصفح Google عبر النطاق ({PRIMARY_CUSTOM_HOSTNAME})
                </h3>
              </div>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(PRIMARY_CUSTOM_DOMAIN);
                    setCopiedDomain(true);
                    setTimeout(() => setCopiedDomain(false), 2000);
                  } catch {
                    // ignore clipboard block
                  }
                }}
                className="px-3 py-1.5 rounded-lg border border-[var(--theme-border)] bg-[var(--theme-surface-muted)] hover:bg-[var(--theme-surface-hover)] text-xs font-semibold text-[var(--theme-text)] inline-flex items-center gap-1.5"
              >
                {copiedDomain ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#15803D]" />
                    <span>{t.payCopied}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span dir="ltr">{PRIMARY_CUSTOM_HOSTNAME}</span>
                  </>
                )}
              </button>
            </div>
            <div className="p-4 rounded-xl bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] text-xs text-[var(--theme-muted)] space-y-1.5 leading-relaxed">
              <p className="font-semibold text-[var(--theme-text)]">
                تم تجهيز ملفات SEO (Canonical + OpenGraph + Schema.org + robots.txt + sitemap.xml) وإعداد الاستضافة لهذا النطاق.
              </p>
              <p>
                لتشغيل الرابط <span dir="ltr" className="font-mono-num font-bold text-[var(--theme-text)]">{PRIMARY_CUSTOM_HOSTNAME}</span> فعلياً عند كتابته في متصفح Google للجميع:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-[var(--theme-text)]">
                <li>تأكد من امتلاك النطاق <span dir="ltr" className="font-mono-num">salon-ntb.com</span> في مسجل النطاقات (Domain Registrar).</li>
                <li>اربط النطاق في <strong>Firebase Hosting → Custom Domain</strong> (أو عبر Cloud Run Domain Mapping) وأضف سجلات DNS (A / CNAME) في لوحة نطاقك.</li>
                <li>أضف <span dir="ltr" className="font-mono-num">www.salon-ntb.com</span> و <span dir="ltr" className="font-mono-num">salon-ntb.com</span> داخل <strong>Firebase Console → Authentication → Settings → Authorized domains</strong> ليعمل تسجيل الدخول بحساب Google مباشرة.</li>
              </ol>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto py-3.5 px-8 bg-[var(--theme-accent)] hover:bg-[var(--theme-accent-hover)] text-[var(--theme-accent-text)] text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 min-h-[48px] disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{saving ? t.custSaving : t.adminSaveFeatures}</span>
          </button>
        </form>
      )}

      {adminTab === 'pricing' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Pricing & E-Payment Gateway Controls */}
            <form
              onSubmit={(e) => void handleSaveAll(e)}
              className="lg:col-span-6 bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-2xl p-6 sm:p-7 space-y-6"
            >
              <div className="flex items-center gap-2 pb-3 border-b border-[var(--theme-border)]">
                <Tag className="w-4 h-4 text-[var(--theme-accent)]" />
                <h2 className="font-display text-lg font-extrabold text-[var(--theme-text)]">
                  {t.adminPricingTitle}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPricingEnabled(false)}
                  className={`p-3.5 rounded-xl border text-start transition-colors min-h-[56px] ${
                    !pricingEnabled
                      ? 'border-[var(--theme-primary)] bg-[var(--theme-primary)] text-[var(--theme-primary-text)]'
                      : 'border-[var(--theme-border)] bg-[var(--theme-surface-muted)] text-[var(--theme-text)]'
                  }`}
                >
                  <div className="text-sm font-bold">{t.adminFreeMode}</div>
                  <div className="text-xs opacity-80">جميع الحلاقين يعملون مجاناً</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPricingEnabled(true)}
                  className={`p-3.5 rounded-xl border text-start transition-colors min-h-[56px] ${
                    pricingEnabled
                      ? 'border-[var(--theme-accent)] bg-[var(--theme-accent)] text-[var(--theme-accent-text)]'
                      : 'border-[var(--theme-border)] bg-[var(--theme-surface-muted)] text-[var(--theme-text)]'
                  }`}
                >
                  <div className="text-sm font-bold">{t.adminPaidMode}</div>
                  <div className="text-xs opacity-85">تحديد سعر اشتراك لحسابات الحلاقين</div>
                </button>
              </div>

              {pricingEnabled && (
                <div className="space-y-4 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label htmlFor="usagePrice" className="block text-xs font-semibold text-[var(--theme-text)] mb-1.5">
                        السعر
                      </label>
                      <input
                        id="usagePrice"
                        type="number"
                        min={0}
                        max={1000000}
                        step="any"
                        value={usagePrice}
                        onChange={(e) => setUsagePrice(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] rounded-xl text-sm font-mono-num text-[var(--theme-text)]"
                      />
                    </div>

                    <div>
                      <label htmlFor="currency" className="block text-xs font-semibold text-[var(--theme-text)] mb-1.5">
                        العملة
                      </label>
                      <input
                        id="currency"
                        type="text"
                        required
                        maxLength={VALIDATION_LIMITS.CURRENCY_MAX}
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] rounded-xl text-sm text-[var(--theme-text)]"
                      />
                    </div>

                    <div>
                      <label htmlFor="billingCycle" className="block text-xs font-semibold text-[var(--theme-text)] mb-1.5">
                        نظام الدفع
                      </label>
                      <select
                        id="billingCycle"
                        value={billingCycle}
                        onChange={(e) => setBillingCycle(e.target.value as BillingCycle)}
                        className="w-full px-3.5 py-2.5 bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] rounded-xl text-sm text-[var(--theme-text)]"
                      >
                        {(['monthly', 'yearly', 'per_booking'] as BillingCycle[]).map((cycle) => (
                          <option key={cycle} value={cycle}>
                            {getLocalizedBillingLabel(cycle)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="paymentInstructions"
                      className="block text-xs font-semibold text-[var(--theme-text)] mb-1.5"
                    >
                      تعليمات الدفع والتواصل لتفعيل الاشتراك
                    </label>
                    <textarea
                      id="paymentInstructions"
                      rows={2}
                      maxLength={VALIDATION_LIMITS.PAYMENT_INSTRUCTIONS_MAX}
                      value={paymentInstructions}
                      onChange={(e) => setPaymentInstructions(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] rounded-xl text-sm text-[var(--theme-text)]"
                    />
                  </div>
                </div>
              )}

              {/* Algerian & International E-Payment Receiving Configuration */}
              <div className="pt-4 border-t border-[var(--theme-border)] space-y-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[var(--theme-accent)]" />
                  <h3 className="font-display text-sm font-extrabold text-[var(--theme-text)]">
                    {t.adminPaymentMethodsTitle}
                  </h3>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-[var(--theme-text)]">
                      {t.adminAutoApproveLabel}
                    </p>
                    <p className="text-[11px] text-[var(--theme-muted)] mt-0.5">
                      {t.adminAutoApproveDesc}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAutoApproveCardPayments((prev) => !prev)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 ${
                      autoApproveCardPayments
                        ? 'bg-[#15803D] text-white'
                        : 'bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-text)]'
                    }`}
                  >
                    {autoApproveCardPayments ? 'مفعّل' : 'مراجعة يدوية'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="baridiMobRip" className="block text-xs font-semibold text-[var(--theme-text)] mb-1">
                      RIP بريدي موب (BaridiMob)
                    </label>
                    <input
                      id="baridiMobRip"
                      type="text"
                      dir="ltr"
                      maxLength={VALIDATION_LIMITS.BARIDIMOB_RIP_MAX}
                      value={baridiMobRip}
                      onChange={(e) => setBaridiMobRip(e.target.value)}
                      placeholder="0079999900..."
                      className="w-full px-3.5 py-2 bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] rounded-xl text-xs font-mono-num text-[var(--theme-text)]"
                    />
                  </div>

                  <div>
                    <label htmlFor="ccpAccount" className="block text-xs font-semibold text-[var(--theme-text)] mb-1">
                      حساب CCP + المفتاح
                    </label>
                    <input
                      id="ccpAccount"
                      type="text"
                      dir="ltr"
                      maxLength={VALIDATION_LIMITS.CCP_ACCOUNT_MAX}
                      value={ccpAccount}
                      onChange={(e) => setCcpAccount(e.target.value)}
                      placeholder="12345678 Clé 90"
                      className="w-full px-3.5 py-2 bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] rounded-xl text-xs font-mono-num text-[var(--theme-text)]"
                    />
                  </div>

                  <div>
                    <label htmlFor="chargilyPayUrl" className="block text-xs font-semibold text-[var(--theme-text)] mb-1">
                      رابط بوابة Chargily Pay (الجزائر)
                    </label>
                    <input
                      id="chargilyPayUrl"
                      type="url"
                      dir="ltr"
                      maxLength={VALIDATION_LIMITS.PAYMENT_ACCOUNT_MAX}
                      value={chargilyPayUrl}
                      onChange={(e) => setChargilyPayUrl(e.target.value)}
                      placeholder="https://pay.chargily.com/..."
                      className="w-full px-3.5 py-2 bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] rounded-xl text-xs text-[var(--theme-text)]"
                    />
                  </div>

                  <div>
                    <label htmlFor="stripeCheckoutUrl" className="block text-xs font-semibold text-[var(--theme-text)] mb-1">
                      رابط Stripe / بطاقات دولية (اختياري)
                    </label>
                    <input
                      id="stripeCheckoutUrl"
                      type="url"
                      dir="ltr"
                      maxLength={VALIDATION_LIMITS.PAYMENT_ACCOUNT_MAX}
                      value={stripeCheckoutUrl}
                      onChange={(e) => setStripeCheckoutUrl(e.target.value)}
                      placeholder="https://buy.stripe.com/..."
                      className="w-full px-3.5 py-2 bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] rounded-xl text-xs text-[var(--theme-text)]"
                    />
                  </div>

                  <div>
                    <label htmlFor="paypalLink" className="block text-xs font-semibold text-[var(--theme-text)] mb-1">
                      حساب / رابط PayPal (خارج الجزائر)
                    </label>
                    <input
                      id="paypalLink"
                      type="text"
                      dir="ltr"
                      maxLength={VALIDATION_LIMITS.PAYPAL_LINK_MAX}
                      value={paypalLink}
                      onChange={(e) => setPaypalLink(e.target.value)}
                      placeholder="https://paypal.me/..."
                      className="w-full px-3.5 py-2 bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] rounded-xl text-xs text-[var(--theme-text)]"
                    />
                  </div>

                  <div>
                    <label htmlFor="wiseIban" className="block text-xs font-semibold text-[var(--theme-text)] mb-1">
                      حساب Wise / Paysera / IBAN
                    </label>
                    <input
                      id="wiseIban"
                      type="text"
                      dir="ltr"
                      maxLength={VALIDATION_LIMITS.WISE_IBAN_MAX}
                      value={wiseIban}
                      onChange={(e) => setWiseIban(e.target.value)}
                      placeholder="LT... / BE... / @redotpay"
                      className="w-full px-3.5 py-2 bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] rounded-xl text-xs font-mono-num text-[var(--theme-text)]"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3.5 px-6 bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-[var(--theme-primary-text)] text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 min-h-[48px] disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{saving ? t.custSaving : t.adminSavePricing}</span>
              </button>
            </form>

            {/* Barber Subscriptions Management */}
            <div className="lg:col-span-6 bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-[var(--theme-border)]">
                <h2 className="font-display text-lg font-extrabold text-[var(--theme-text)]">
                  {t.adminShopsManageTitle}
                </h2>
                <p className="text-xs text-[var(--theme-muted)] mt-1">
                  يمكنك تفعيل أو إيقاف أي محل مسجل في المنصة بضغطة واحدة.
                </p>
              </div>

              {barbers.length === 0 ? (
                <div className="p-12 text-center">
                  <Store className="w-10 h-10 text-[var(--theme-muted)]/40 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-[var(--theme-text)]">
                    لا توجد محلات مسجلة بعد
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[var(--theme-border)]">
                  {barbers.map((barber) => {
                    const subStatus: SubscriptionStatus = barber.subscriptionStatus || 'active';
                    const busy = updatingBarberId === barber.id;

                    return (
                      <div key={barber.id} className="p-5 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-bold text-sm text-[var(--theme-text)]">
                              {barber.shopName}
                            </h3>
                            <p className="text-xs text-[var(--theme-muted)] mt-0.5 flex flex-wrap items-center gap-1.5">
                              <span>{barber.barberName}</span>
                              <span aria-hidden="true">·</span>
                              <CountryFlag countryCode={barber.countryCode || 'DZ'} size="sm" />
                              <span>
                                {getLocalizedCountryName(barber.countryCode, barber.countryName)}
                                {barber.stateName ? ` — ${barber.stateName}` : ''}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-[var(--theme-accent)]" />
                                {barber.location}
                              </span>
                            </p>
                          </div>

                          <span
                            className={`text-xs font-bold whitespace-nowrap ${
                              subStatus === 'active'
                                ? 'text-[#15803D]'
                                : subStatus === 'pending'
                                  ? 'text-[var(--theme-accent)]'
                                  : 'text-red-700 dark:text-red-400'
                            }`}
                          >
                            {getLocalizedSubscriptionLabel(subStatus)}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            disabled={busy || subStatus === 'active'}
                            onClick={() => void handleSubscriptionChange(barber.id, 'active')}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 disabled:opacity-40 min-h-[36px]"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>تفعيل الاشتراك</span>
                          </button>

                          <button
                            type="button"
                            disabled={busy || subStatus === 'pending'}
                            onClick={() => void handleSubscriptionChange(barber.id, 'pending')}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 disabled:opacity-40 min-h-[36px]"
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>بانتظار الدفع</span>
                          </button>

                          <button
                            type="button"
                            disabled={busy || subStatus === 'suspended'}
                            onClick={() => void handleSubscriptionChange(barber.id, 'suspended')}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 disabled:opacity-40 min-h-[36px]"
                          >
                            <PauseCircle className="w-3.5 h-3.5" />
                            <span>إيقاف مؤقت</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Incoming Electronic Payments Monitor */}
          <section className="bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-[var(--theme-border)] flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-5 h-5 text-[var(--theme-accent)]" />
                <div>
                  <h2 className="font-display text-lg font-extrabold text-[var(--theme-text)]">
                    {t.adminIncomingPaymentsTitle} ({allPayments.length})
                  </h2>
                  <p className="text-xs text-[var(--theme-muted)] mt-0.5">
                    مدفوعات الذهبية، CIB، بريدي موب، Visa، Mastercard، PayPal، Wise وباقي البطاقات.
                  </p>
                </div>
              </div>
            </div>

            {allPayments.length === 0 ? (
              <div className="p-10 text-center text-sm text-[var(--theme-muted)]">
                {t.adminNoPayments}
              </div>
            ) : (
              <div className="divide-y divide-[var(--theme-border)]">
                {allPayments.map((pay) => {
                  const meta = getPaymentMethodMeta(pay.paymentMethod);
                  const busy = updatingPaymentId === pay.id;
                  return (
                    <div
                      key={pay.id}
                      className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span
                            className="px-2 py-0.5 rounded-md text-[10px] font-extrabold font-mono-num"
                            style={{ backgroundColor: meta.accentBg, color: meta.accentText }}
                          >
                            {meta.shortCode}
                          </span>
                          <span className="font-bold text-[var(--theme-text)]">{pay.shopName}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono-num font-extrabold text-[var(--theme-accent)]">
                            {pay.amount} {pay.currency}
                          </span>
                          {pay.cardLast4 && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="font-mono-num text-[var(--theme-muted)]" dir="ltr">
                                •••• {pay.cardLast4}
                              </span>
                            </>
                          )}
                          <span aria-hidden="true">·</span>
                          <span
                            className={`font-bold ${
                              pay.status === 'paid'
                                ? 'text-[#15803D]'
                                : pay.status === 'pending_review'
                                  ? 'text-[var(--theme-accent)]'
                                  : 'text-red-700 dark:text-red-400'
                            }`}
                          >
                            {pay.status === 'paid'
                              ? t.payStatusPaid
                              : pay.status === 'pending_review'
                                ? t.payStatusPending
                                : t.payStatusRejected}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--theme-muted)]">
                          {pay.payerName} · Ref:{' '}
                          <span className="font-mono-num font-semibold" dir="ltr">
                            {pay.referenceCode}
                          </span>
                          {pay.note ? ` · ${pay.note}` : ''}
                        </p>
                      </div>

                      {pay.status === 'pending_review' && (
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void handleReviewPayment(pay, 'paid')}
                            className="px-3.5 py-2 bg-[#15803D] text-white text-xs font-bold rounded-xl hover:bg-[#166534] inline-flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{t.adminApprovePayment}</span>
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void handleReviewPayment(pay, 'rejected')}
                            className="px-3 py-2 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl hover:bg-red-100 inline-flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>{t.adminRejectPayment}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Platform-wide Complaints Monitor */}
          <section className="bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-[var(--theme-border)] flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-red-700 dark:text-red-400" />
                <div>
                  <h2 className="font-display text-lg font-extrabold text-[var(--theme-text)]">
                    {t.adminComplaintsTitle} ({allComplaints.length})
                  </h2>
                  <p className="text-xs text-[var(--theme-muted)] mt-0.5">
                    جميع الشكاوى المقدمة من الزبائن في مختلف المحلات والولايات.
                  </p>
                </div>
              </div>
            </div>

            {allComplaints.length === 0 ? (
              <div className="p-10 text-center text-sm text-[var(--theme-muted)]">
                لا توجد أي شكاوى مسجلة حتى الآن.
              </div>
            ) : (
              <div className="divide-y divide-[var(--theme-border)]">
                {allComplaints.map((cmp) => (
                  <div
                    key={cmp.id}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-bold text-[var(--theme-text)]">{cmp.shopName}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-semibold text-red-700 dark:text-red-400">
                          {cmp.complaintType}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="text-[var(--theme-muted)]">{cmp.customerName}</span>
                        <span aria-hidden="true">·</span>
                        <span
                          className={`font-bold ${
                            cmp.status === 'open'
                              ? 'text-red-700 dark:text-red-400'
                              : cmp.status === 'reviewed'
                                ? 'text-[var(--theme-accent)]'
                                : 'text-[#15803D]'
                          }`}
                        >
                          {getLocalizedComplaintStatus(cmp.status)}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--theme-muted)] leading-relaxed">
                        {cmp.details}
                      </p>
                    </div>

                    {cmp.status !== 'resolved' && (
                      <div className="flex items-center gap-2 shrink-0">
                        {cmp.status === 'open' && (
                          <button
                            type="button"
                            disabled={updatingComplaintId === cmp.id}
                            onClick={async () => {
                              setUpdatingComplaintId(cmp.id);
                              try {
                                await updateComplaintStatus({
                                  barberId: cmp.barberId,
                                  complaintId: cmp.id,
                                  status: 'reviewed',
                                });
                              } finally {
                                setUpdatingComplaintId(null);
                              }
                            }}
                            className="px-3 py-1.5 bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] text-xs font-semibold rounded-xl text-[var(--theme-text)] hover:bg-[var(--theme-surface-hover)]"
                          >
                            {t.barberMarkReviewed}
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={updatingComplaintId === cmp.id}
                          onClick={async () => {
                            setUpdatingComplaintId(cmp.id);
                            try {
                              await updateComplaintStatus({
                                barberId: cmp.barberId,
                                complaintId: cmp.id,
                                status: 'resolved',
                              });
                            } finally {
                              setUpdatingComplaintId(null);
                            }
                          }}
                          className="px-3 py-1.5 bg-[#15803D] text-white text-xs font-bold rounded-xl hover:bg-[#166534]"
                        >
                          {t.barberMarkResolved}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};
