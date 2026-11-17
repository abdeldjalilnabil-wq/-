import React, { useMemo, useState } from 'react';
import {
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  ExternalLink,
  Globe,
  Lock,
  ShieldCheck,
  X,
} from 'lucide-react';
import {
  type BarberShop,
  type PaymentMethodId,
  type PaymentRegion,
  type PlatformSettings,
  VALIDATION_LIMITS,
} from '../types';
import { useI18n } from '../i18n/I18nContext';
import { submitBarberPayment } from '../services/queueService';
import {
  ALGERIAN_PAYMENT_METHODS,
  INTERNATIONAL_PAYMENT_METHODS,
  detectCardBrand,
  formatCardNumber,
  formatExpiryInput,
  getPaymentMethodMeta,
  isValidExpiry,
  passesLuhnCheck,
} from '../utils/paymentCards';

interface BarberPaymentModalProps {
  barberShop: BarberShop;
  platformSettings: PlatformSettings;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const BarberPaymentModal: React.FC<BarberPaymentModalProps> = ({
  barberShop,
  platformSettings,
  onClose,
  onSuccess,
}) => {
  const { lang, t, getLocalizedBillingLabel } = useI18n();
  const [region, setRegion] = useState<PaymentRegion>('algeria');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodId>('edahabia');

  // Card fields (strictly client-side in memory; never persisted in full)
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState(barberShop.barberName || '');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  // Transfer / wallet receipt fields
  const [referenceCode, setReferenceCode] = useState('');
  const [note, setNote] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const methodList =
    region === 'algeria' ? ALGERIAN_PAYMENT_METHODS : INTERNATIONAL_PAYMENT_METHODS;

  const activeMeta = useMemo(
    () => getPaymentMethodMeta(selectedMethod),
    [selectedMethod]
  );

  const detectedBrand = useMemo(
    () => detectCardBrand(cardNumber, selectedMethod),
    [cardNumber, selectedMethod]
  );

  const handleRegionChange = (nextRegion: PaymentRegion) => {
    setRegion(nextRegion);
    setErrorMsg(null);
    if (nextRegion === 'algeria') {
      setSelectedMethod('edahabia');
    } else {
      setSelectedMethod('visa');
    }
  };

  const handleCopyText = async (key: string, val: string) => {
    try {
      await navigator.clipboard.writeText(val);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(null), 1800);
    } catch {
      // Fallback ignored
    }
  };

  const isCardEntryMode = activeMeta.kind === 'card';
  const canAutoApproveCards = platformSettings.autoApproveCardPayments !== false;
  const externalLinks = [
    platformSettings.chargilyPayUrl?.trim()
      ? {
          id: 'chargily',
          label: t.payOpenChargily,
          url: platformSettings.chargilyPayUrl.trim(),
        }
      : null,
    platformSettings.stripeCheckoutUrl?.trim()
      ? {
          id: 'stripe',
          label: t.payOpenStripe,
          url: platformSettings.stripeCheckoutUrl.trim(),
        }
      : null,
    platformSettings.paypalLink?.trim()
      ? {
          id: 'paypal',
          label: t.payOpenPaypal,
          url: platformSettings.paypalLink.trim().startsWith('http')
            ? platformSettings.paypalLink.trim()
            : `https://${platformSettings.paypalLink.trim()}`,
        }
      : null,
  ].filter(Boolean) as Array<{ id: string; label: string; url: string }>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (cardHolder.trim().length < 2) {
      setErrorMsg(t.payErrHolder);
      return;
    }

    let finalMethod = selectedMethod;
    let cardBrandName = activeMeta.shortCode;
    let cardLast4 = '';
    let finalRef = referenceCode.trim();
    let instantActivate = false;

    if (isCardEntryMode) {
      const digits = cardNumber.replace(/\D/g, '');
      const validEdahabiaOrCib =
        (detectedBrand.brandId === 'edahabia' ||
          detectedBrand.brandId === 'cib' ||
          selectedMethod === 'edahabia' ||
          selectedMethod === 'cib') &&
        digits.length >= 16 &&
        digits.length <= 19;

      if (!passesLuhnCheck(digits) && !validEdahabiaOrCib) {
        setErrorMsg(t.payErrCardNumber);
        return;
      }
      if (!isValidExpiry(expiry)) {
        setErrorMsg(t.payErrExpiry);
        return;
      }
      const cvvDigits = cvv.replace(/\D/g, '');
      if (cvvDigits.length < 3 || cvvDigits.length > 4) {
        setErrorMsg(t.payErrCvv);
        return;
      }

      finalMethod = detectedBrand.brandId;
      cardBrandName = detectedBrand.label;
      cardLast4 = digits.slice(-4);
      finalRef = `AUTH-${cardLast4}-${Date.now().toString().slice(-6)}`;
      instantActivate = canAutoApproveCards;
    } else {
      if (finalRef.length < 2) {
        setErrorMsg(t.payErrReference);
        return;
      }
      instantActivate = false;
    }

    setSubmitting(true);
    try {
      await submitBarberPayment({
        barber: barberShop,
        payerName: cardHolder,
        region,
        paymentMethod: finalMethod,
        cardBrand: cardBrandName,
        cardLast4,
        referenceCode: finalRef,
        amount: platformSettings.usagePrice,
        currency: platformSettings.currency,
        billingCycle: platformSettings.billingCycle,
        instantActivate,
        note,
      });

      onSuccess(instantActivate ? t.paySuccessInstant : t.paySuccessReview);
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Payment error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full sm:max-w-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-t-3xl sm:rounded-3xl p-6 sm:p-7 max-h-[92vh] overflow-y-auto space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[var(--theme-border)]">
          <div>
            <p className="text-xs font-semibold text-[var(--theme-accent)]">
              {t.payModalKicker}
            </p>
            <h2 className="font-display text-xl font-extrabold text-[var(--theme-text)] mt-0.5">
              {t.payModalTitle}
            </h2>
            <p className="text-xs text-[var(--theme-muted)] mt-1 leading-relaxed">
              {t.payModalSubtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-[var(--theme-surface-muted)] text-[var(--theme-muted)] min-h-[40px] min-w-[40px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount Summary */}
        <div className="p-4 rounded-2xl bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-xs text-[var(--theme-muted)] block">{t.payAmountDue}</span>
            <span className="font-display font-bold text-sm text-[var(--theme-text)]">
              {barberShop.shopName}
            </span>
          </div>
          <div className="text-end">
            <span className="font-mono-num text-2xl font-extrabold text-[var(--theme-accent)]">
              {platformSettings.usagePrice} {platformSettings.currency}
            </span>
            <span className="text-xs text-[var(--theme-muted)] block">
              {getLocalizedBillingLabel(platformSettings.billingCycle)}
            </span>
          </div>
        </div>

        {/* Region Tabs: Algeria vs International */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-1.5 bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] rounded-2xl">
          <button
            type="button"
            onClick={() => handleRegionChange('algeria')}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 min-h-[42px] ${
              region === 'algeria'
                ? 'bg-[var(--theme-primary)] text-[var(--theme-primary-text)]'
                : 'text-[var(--theme-text)] hover:bg-[var(--theme-surface)]'
            }`}
          >
            <CreditCard className="w-4 h-4 shrink-0" />
            <span>{t.payRegionAlgeria}</span>
          </button>

          <button
            type="button"
            onClick={() => handleRegionChange('international')}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 min-h-[42px] ${
              region === 'international'
                ? 'bg-[var(--theme-primary)] text-[var(--theme-primary-text)]'
                : 'text-[var(--theme-text)] hover:bg-[var(--theme-surface)]'
            }`}
          >
            <Globe className="w-4 h-4 shrink-0" />
            <span>{t.payRegionInternational}</span>
          </button>
        </div>

        {/* Supported Payment Methods / Cards Grid */}
        <div>
          <p className="text-xs font-semibold text-[var(--theme-text)] mb-2">
            {t.paySelectMethod}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {methodList.map((m) => {
              const active = selectedMethod === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setSelectedMethod(m.id);
                    setErrorMsg(null);
                  }}
                  className={`p-3 rounded-xl border text-start transition-colors flex items-center gap-2.5 min-h-[54px] ${
                    active
                      ? 'border-[var(--theme-accent)] bg-[var(--theme-surface-muted)] ring-1 ring-[var(--theme-accent)]'
                      : 'border-[var(--theme-border)] bg-[var(--theme-surface)] hover:border-[var(--theme-accent)]/60'
                  }`}
                >
                  <span
                    className="px-1.5 py-1 rounded-md text-[10px] font-extrabold font-mono-num shrink-0"
                    style={{ backgroundColor: m.accentBg, color: m.accentText }}
                  >
                    {m.shortCode}
                  </span>
                  <span className="text-xs font-semibold text-[var(--theme-text)] leading-tight">
                    {lang === 'ar' ? m.nameAr : m.nameEn}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          {isCardEntryMode ? (
            <div className="space-y-4 p-4 rounded-2xl bg-[var(--theme-surface-muted)] border border-[var(--theme-border)]">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--theme-text)]">
                  <Lock className="w-3.5 h-3.5 text-[var(--theme-accent)]" />
                  <span>{t.payDetectedCard}</span>
                </span>
                <span className="font-mono-num font-extrabold text-[var(--theme-accent)]">
                  {detectedBrand.label}
                </span>
              </div>

              <div>
                <label
                  htmlFor="payCardNumber"
                  className="block text-xs font-semibold text-[var(--theme-text)] mb-1"
                >
                  {t.payCardNumberLabel}
                </label>
                <input
                  id="payCardNumber"
                  type="text"
                  inputMode="numeric"
                  dir="ltr"
                  autoComplete="cc-number"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  placeholder="6280 •••• •••• ••••  /  4532 •••• •••• ••••"
                  className="w-full px-4 py-2.5 bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-xl text-sm font-mono-num text-[var(--theme-text)] focus:outline-none focus:border-[var(--theme-accent)]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label
                    htmlFor="payCardHolder"
                    className="block text-xs font-semibold text-[var(--theme-text)] mb-1"
                  >
                    {t.payCardHolderLabel}
                  </label>
                  <input
                    id="payCardHolder"
                    type="text"
                    required
                    maxLength={VALIDATION_LIMITS.DISPLAY_NAME_MAX}
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-xl text-xs text-[var(--theme-text)] focus:outline-none focus:border-[var(--theme-accent)]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="payExpiry"
                    className="block text-xs font-semibold text-[var(--theme-text)] mb-1"
                  >
                    {t.payExpiryLabel}
                  </label>
                  <input
                    id="payExpiry"
                    type="text"
                    inputMode="numeric"
                    dir="ltr"
                    maxLength={5}
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiryInput(e.target.value))}
                    placeholder="MM/YY"
                    className="w-full px-3.5 py-2.5 bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-xl text-xs font-mono-num text-[var(--theme-text)] focus:outline-none focus:border-[var(--theme-accent)]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="payCvv"
                    className="block text-xs font-semibold text-[var(--theme-text)] mb-1"
                  >
                    {t.payCvvLabel}
                  </label>
                  <input
                    id="payCvv"
                    type="password"
                    inputMode="numeric"
                    dir="ltr"
                    maxLength={4}
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="•••"
                    className="w-full px-3.5 py-2.5 bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-xl text-xs font-mono-num text-[var(--theme-text)] focus:outline-none focus:border-[var(--theme-accent)]"
                  />
                </div>
              </div>

              <div className="flex items-start gap-2 text-[11px] text-[var(--theme-muted)] leading-relaxed">
                <ShieldCheck className="w-4 h-4 text-[#15803D] shrink-0 mt-0.5" />
                <span>{t.payPciNotice}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4 p-4 rounded-2xl bg-[var(--theme-surface-muted)] border border-[var(--theme-border)]">
              <p className="text-xs font-bold text-[var(--theme-text)]">
                {t.payTransferInstructions}
              </p>

              <div className="space-y-2 text-xs">
                {platformSettings.baridiMobRip && (
                  <div className="p-2.5 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[11px] text-[var(--theme-muted)] block">
                        RIP BaridiMob:
                      </span>
                      <span className="font-mono-num font-bold text-[var(--theme-text)]" dir="ltr">
                        {platformSettings.baridiMobRip}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        void handleCopyText('rip', platformSettings.baridiMobRip || '')
                      }
                      className="px-2.5 py-1.5 rounded-lg bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] text-[11px] font-semibold text-[var(--theme-text)] inline-flex items-center gap-1"
                    >
                      {copiedKey === 'rip' ? (
                        <Check className="w-3.5 h-3.5 text-[#15803D]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedKey === 'rip' ? t.payCopied : t.payCopyAccount}</span>
                    </button>
                  </div>
                )}

                {platformSettings.ccpAccount && (
                  <div className="p-2.5 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[11px] text-[var(--theme-muted)] block">CCP:</span>
                      <span className="font-mono-num font-bold text-[var(--theme-text)]" dir="ltr">
                        {platformSettings.ccpAccount}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        void handleCopyText('ccp', platformSettings.ccpAccount || '')
                      }
                      className="px-2.5 py-1.5 rounded-lg bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] text-[11px] font-semibold text-[var(--theme-text)] inline-flex items-center gap-1"
                    >
                      {copiedKey === 'ccp' ? (
                        <Check className="w-3.5 h-3.5 text-[#15803D]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedKey === 'ccp' ? t.payCopied : t.payCopyAccount}</span>
                    </button>
                  </div>
                )}

                {platformSettings.wiseIban && (
                  <div className="p-2.5 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[11px] text-[var(--theme-muted)] block">
                        Wise / Paysera / IBAN:
                      </span>
                      <span
                        className="font-mono-num font-bold text-[var(--theme-text)] break-all"
                        dir="ltr"
                      >
                        {platformSettings.wiseIban}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        void handleCopyText('iban', platformSettings.wiseIban || '')
                      }
                      className="px-2.5 py-1.5 rounded-lg bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] text-[11px] font-semibold text-[var(--theme-text)] inline-flex items-center gap-1 shrink-0"
                    >
                      {copiedKey === 'iban' ? (
                        <Check className="w-3.5 h-3.5 text-[#15803D]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedKey === 'iban' ? t.payCopied : t.payCopyAccount}</span>
                    </button>
                  </div>
                )}

                <p className="text-xs text-[var(--theme-muted)] leading-relaxed">
                  {platformSettings.paymentInstructions}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="paySenderName"
                    className="block text-xs font-semibold text-[var(--theme-text)] mb-1"
                  >
                    {t.payCardHolderLabel}
                  </label>
                  <input
                    id="paySenderName"
                    type="text"
                    required
                    maxLength={VALIDATION_LIMITS.DISPLAY_NAME_MAX}
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-xl text-xs text-[var(--theme-text)]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="payRefCode"
                    className="block text-xs font-semibold text-[var(--theme-text)] mb-1"
                  >
                    {t.payReferenceLabel}
                  </label>
                  <input
                    id="payRefCode"
                    type="text"
                    required
                    dir="ltr"
                    maxLength={VALIDATION_LIMITS.PAYMENT_REF_MAX}
                    value={referenceCode}
                    onChange={(e) => setReferenceCode(e.target.value)}
                    placeholder={t.payReferencePlaceholder}
                    className="w-full px-3.5 py-2.5 bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-xl text-xs font-mono-num text-[var(--theme-text)]"
                  />
                </div>
              </div>

              <div>
                <input
                  type="text"
                  maxLength={VALIDATION_LIMITS.PAYMENT_NOTE_MAX}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="ملاحظة إضافية (اختياري)..."
                  className="w-full px-3.5 py-2 bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-xl text-xs text-[var(--theme-text)]"
                />
              </div>
            </div>
          )}

          {/* Optional Owner-configured External Checkout Links (Chargily, Stripe, PayPal) */}
          {externalLinks.length > 0 && (
            <div className="space-y-2 pt-1">
              <p className="text-[11px] font-semibold text-[var(--theme-muted)]">
                {t.payExternalGatewayLabel}
              </p>
              <div className="flex flex-wrap gap-2">
                {externalLinks.map((lnk) => (
                  <a
                    key={lnk.id}
                    href={lnk.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-[var(--theme-surface-muted)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border)] text-xs font-bold text-[var(--theme-text)] inline-flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[var(--theme-accent)]" />
                    <span>{lnk.label}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-200">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-6 bg-[var(--theme-accent)] hover:bg-[var(--theme-accent-hover)] text-[var(--theme-accent-text)] text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 min-h-[48px] disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>
              {submitting
                ? t.paySubmitting
                : isCardEntryMode
                  ? t.paySubmitCardBtn
                  : t.paySubmitTransferBtn}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};
