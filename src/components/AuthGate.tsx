import React, { useState } from 'react';
import { Scissors, UserCheck, Store, PhoneCall, Clock, MapPin } from 'lucide-react';
import {
  DEFAULT_PLATFORM_SETTINGS,
  type AccountMode,
  type PlatformSettings,
  type ThemeColorId,
} from '../types';
import { useI18n } from '../i18n/I18nContext';
import { normalizeSocialUrl } from '../utils/socialLinks';
import { AppDownloadTrigger } from './AppDownloadModal';
import { CountryFlag } from './CountryFlag';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeSwitcher } from './ThemeSwitcher';

interface AuthGateProps {
  platformSettings: PlatformSettings;
  currentTheme: ThemeColorId;
  onSelectTheme: (themeId: ThemeColorId) => void;
  onSignIn: (preferredMode: AccountMode) => Promise<void>;
  isLoading: boolean;
  errorMessage: string | null;
  isEmbedMode?: boolean;
}

export const AuthGate: React.FC<AuthGateProps> = ({
  platformSettings,
  currentTheme,
  onSelectTheme,
  onSignIn,
  isLoading,
  errorMessage,
  isEmbedMode = false,
}) => {
  const { lang, dir, t, getLocalizedBillingLabel } = useI18n();
  const [selectedMode, setSelectedMode] = useState<AccountMode>('customer');
  const [heroImgFailed, setHeroImgFailed] = useState(false);

  const heroTitle =
    lang === 'ar'
      ? platformSettings.heroTitle?.trim() ||
        DEFAULT_PLATFORM_SETTINGS.heroTitle ||
        ''
      : platformSettings.heroTitle && platformSettings.heroTitle !== DEFAULT_PLATFORM_SETTINGS.heroTitle
        ? platformSettings.heroTitle
        : t.heroCardTitle;

  const heroSubtitle =
    lang === 'ar'
      ? platformSettings.heroSubtitle?.trim() ||
        DEFAULT_PLATFORM_SETTINGS.heroSubtitle ||
        ''
      : platformSettings.heroSubtitle && platformSettings.heroSubtitle !== DEFAULT_PLATFORM_SETTINGS.heroSubtitle
        ? platformSettings.heroSubtitle
        : `${t.featAutoCallDesc} ${t.featDeferDesc}`;

  return (
    <div dir={dir} className="min-h-screen bg-[var(--theme-bg)] text-[var(--theme-text)] flex flex-col">
      {/* Strict 3-zone Top Navigation Bar */}
      <header
        className="border-b border-[var(--theme-border)] backdrop-blur-md"
        style={{ backgroundColor: 'var(--theme-header-bg)' }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          <span className="font-display text-xl font-extrabold tracking-tight text-[var(--theme-text)] whitespace-nowrap shrink-0">
            {platformSettings.appName}
          </span>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[var(--theme-muted)]">
            <a
              href="#features"
              className="hover:text-[var(--theme-text)] transition-colors whitespace-nowrap shrink-0"
            >
              {t.navFeatures}
            </a>
            <a
              href="#pricing-info"
              className="hover:text-[var(--theme-text)] transition-colors whitespace-nowrap shrink-0"
            >
              {t.navPricing}
            </a>
          </nav>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => void onSignIn(selectedMode)}
            className="px-4 py-2 bg-[var(--theme-primary)] text-[var(--theme-primary-text)] text-sm font-medium rounded-xl hover:bg-[var(--theme-primary-hover)] transition-colors disabled:opacity-50 whitespace-nowrap shrink-0 min-h-[40px]"
          >
            {isLoading ? t.signingIn : t.signIn}
          </button>
        </div>
      </header>

      {/* Theme & All-Languages Switcher strip directly below header */}
      <div className="border-b border-[var(--theme-border)] bg-[var(--theme-surface)]">
        <div className="max-w-7xl mx-auto px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <ThemeSwitcher currentTheme={currentTheme} onSelectTheme={onSelectTheme} />
            <LanguageSwitcher />
            <AppDownloadTrigger platformSettings={platformSettings} compact />
          </div>
          <span className="hidden lg:inline text-xs text-[var(--theme-muted)] truncate">
            {platformSettings.appTagline}
          </span>
        </div>
      </div>

      <main className="flex-1">
        {platformSettings.maintenanceMode && (
          <div className="max-w-7xl mx-auto px-6 pt-6">
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-xs sm:text-sm font-semibold text-amber-950 dark:text-amber-100">
              {platformSettings.maintenanceMessage || DEFAULT_PLATFORM_SETTINGS.maintenanceMessage}
            </div>
          </div>
        )}

        <section
          className={`max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch ${
            isEmbedMode ? 'py-6 lg:py-8' : 'py-12 lg:py-20'
          }`}
        >
          <div className="lg:col-span-6 flex flex-col justify-center">
            <p className="text-xs font-medium text-[var(--theme-accent)] mb-3">
              {platformSettings.appTagline}
            </p>
            <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-[var(--theme-text)] leading-[1.2] mb-5 [text-wrap:balance]">
              {heroTitle}
            </h1>
            <p className="text-base text-[var(--theme-muted)] leading-relaxed max-w-xl mb-8">
              {heroSubtitle}
            </p>

            <div className="bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-2xl p-5 mb-6 max-w-xl">
              <p className="text-sm font-semibold text-[var(--theme-text)] mb-3">
                {t.chooseAccountType}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => setSelectedMode('customer')}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border text-start transition-colors min-h-[56px] ${
                    selectedMode === 'customer'
                      ? 'border-[var(--theme-primary)] bg-[var(--theme-primary)] text-[var(--theme-primary-text)]'
                      : 'border-[var(--theme-border)] bg-[var(--theme-surface-muted)] text-[var(--theme-text)] hover:border-[var(--theme-accent)]'
                  }`}
                >
                  <UserCheck className="w-5 h-5 shrink-0" />
                  <div>
                    <div className="text-sm font-bold whitespace-nowrap">{t.accountCustomerTitle}</div>
                    <div
                      className={`text-xs ${
                        selectedMode === 'customer' ? 'opacity-80' : 'text-[var(--theme-muted)]'
                      }`}
                    >
                      {t.accountCustomerDesc}
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMode('barber')}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border text-start transition-colors min-h-[56px] ${
                    selectedMode === 'barber'
                      ? 'border-[var(--theme-primary)] bg-[var(--theme-primary)] text-[var(--theme-primary-text)]'
                      : 'border-[var(--theme-border)] bg-[var(--theme-surface-muted)] text-[var(--theme-text)] hover:border-[var(--theme-accent)]'
                  }`}
                >
                  <Store className="w-5 h-5 shrink-0" />
                  <div>
                    <div className="text-sm font-bold whitespace-nowrap">{t.accountBarberTitle}</div>
                    <div
                      className={`text-xs ${
                        selectedMode === 'barber' ? 'opacity-80' : 'text-[var(--theme-muted)]'
                      }`}
                    >
                      {t.accountBarberDesc}
                    </div>
                  </div>
                </button>
              </div>

              {errorMessage && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-200">
                  {errorMessage}
                </div>
              )}

              <button
                type="button"
                disabled={isLoading}
                onClick={() => void onSignIn(selectedMode)}
                className="w-full py-3.5 px-6 bg-[var(--theme-accent)] hover:bg-[var(--theme-accent-hover)] text-[var(--theme-accent-text)] text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 min-h-[48px] disabled:opacity-50"
              >
                <Scissors className="w-4 h-4" />
                <span>
                  {isLoading
                    ? t.signingIn
                    : selectedMode === 'barber'
                      ? t.continueWithGoogleBarber
                      : t.continueWithGoogleCustomer}
                </span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 flex">
            <div className="relative w-full min-h-[320px] lg:min-h-[540px] rounded-2xl overflow-hidden border border-[var(--theme-border)] bg-[#0E1622] flex items-center justify-center">
              {!heroImgFailed ? (
                <img
                  src="/assets/aistudio/Gemini_Generated_Image_b1vy6ib1vy6ib1vy__1__aa591cd4.jpg"
                  alt={platformSettings.appName}
                  referrerPolicy="no-referrer"
                  onError={() => setHeroImgFailed(true)}
                  className="w-full h-full max-h-[600px] object-contain"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-white/80 bg-gradient-to-br from-[#1C1D22] to-[#2C251B]">
                  <Scissors className="w-12 h-12 mb-3 text-[#C2883A]" />
                  <p className="font-display text-lg font-bold">{platformSettings.appName}</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {!isEmbedMode && (
          <section
            id="features"
            className="border-t border-[var(--theme-border)] bg-[var(--theme-surface)] py-12 lg:py-16"
          >
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] flex items-center justify-center text-[var(--theme-text)] mb-3">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <h3 className="font-display text-base font-bold text-[var(--theme-text)]">
                  {t.featAutoCallTitle}
                </h3>
                <p className="text-sm text-[var(--theme-muted)] leading-relaxed">
                  {t.featAutoCallDesc}
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] flex items-center justify-center text-[var(--theme-text)] mb-3">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="font-display text-base font-bold text-[var(--theme-text)]">
                  {t.featDeferTitle}
                </h3>
                <p className="text-sm text-[var(--theme-muted)] leading-relaxed">
                  {t.featDeferDesc}
                </p>
              </div>

              <div className="space-y-2" id="pricing-info">
                <div className="w-10 h-10 rounded-xl bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] flex items-center justify-center text-[var(--theme-text)] mb-3">
                  <MapPin className="w-5 h-5" />
                </div>
                <h3 className="font-display text-base font-bold text-[var(--theme-text)]">
                  {platformSettings.pricingEnabled
                    ? `${t.featPricingPrefix} ${platformSettings.usagePrice} ${platformSettings.currency} / ${getLocalizedBillingLabel(platformSettings.billingCycle)}`
                    : t.featIdentityTitle}
                </h3>
                <p className="text-sm text-[var(--theme-muted)] leading-relaxed">
                  {platformSettings.pricingEnabled
                    ? platformSettings.paymentInstructions
                    : t.featIdentityDesc}
                </p>
              </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {!isEmbedMode && (
        <footer className="border-t border-[var(--theme-border)] bg-[var(--theme-bg)] py-5 px-6 text-center text-xs text-[var(--theme-muted)] space-y-1.5">
          {platformSettings.footerNote && (
            <p className="font-medium text-[var(--theme-text)]">{platformSettings.footerNote}</p>
          )}
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5">
            <span className="font-bold text-[var(--theme-text)]">{platformSettings.appName}</span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1.5">
              <span>{t.designedBy} {platformSettings.designerName}</span>
              <CountryFlag countryCode="DZ" size="sm" />
              <span>
                {platformSettings.designerLocation ||
                  DEFAULT_PLATFORM_SETTINGS.designerLocation ||
                  'الجزائر - معسكر'}
              </span>
            </span>
            <span aria-hidden="true">·</span>
            <a
              href={normalizeSocialUrl(
                platformSettings.designerInstagram ||
                  DEFAULT_PLATFORM_SETTINGS.designerInstagram ||
                  '@nabil_tb_29',
                'instagram'
              )}
              target="_blank"
              rel="noopener noreferrer"
              dir="ltr"
              className="font-semibold text-[var(--theme-accent)] hover:underline"
            >
              {platformSettings.designerInstagram ||
                DEFAULT_PLATFORM_SETTINGS.designerInstagram ||
                '@nabil_tb_29'}
            </a>
            <span aria-hidden="true">·</span>
            <span>
              {t.ownerSupport} {platformSettings.ownerName}{' '}
              <a
                href={`tel:${(
                  platformSettings.ownerPhone ||
                  DEFAULT_PLATFORM_SETTINGS.ownerPhone ||
                  '0557052602'
                ).replace(/[^\d+]/g, '')}`}
                dir="ltr"
                className="font-mono-num font-bold text-[var(--theme-text)] hover:underline"
              >
                {platformSettings.ownerPhone ||
                  DEFAULT_PLATFORM_SETTINGS.ownerPhone ||
                  '0557052602'}
              </a>
            </span>
          </div>
        </footer>
      )}
    </div>
  );
};
