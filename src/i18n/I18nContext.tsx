import React, { createContext, useContext } from 'react';
import {
  BILLING_CYCLE_LABELS,
  COMPLAINT_STATUS_LABELS,
  SERVICE_LABELS,
  STATUS_LABELS,
  SUBSCRIPTION_STATUS_LABELS,
  type BillingCycle,
  type ComplaintStatus,
  type PlatformSettings,
  type ServiceType,
  type SubscriptionStatus,
  type TicketStatus,
} from '../types';
import { getCountryByCode } from '../data/locations';
import { getWorldLanguage, type WorldLanguage } from './languages';
import type { TranslationDict } from './translationsCore';
import { DICTIONARIES } from './translationsGlobal';

export interface I18nContextValue {
  lang: string;
  worldLang: WorldLanguage;
  dir: 'rtl' | 'ltr';
  isRtl: boolean;
  t: TranslationDict;
  setLanguage: (code: string) => void;
  getLocalizedCountryName: (countryCode?: string, fallbackAr?: string) => string;
  getLocalizedServiceName: (serviceType: ServiceType, settings?: PlatformSettings) => string;
  getLocalizedStatusLabel: (status: TicketStatus) => string;
  getLocalizedBillingLabel: (cycle: BillingCycle) => string;
  getLocalizedSubscriptionLabel: (status: SubscriptionStatus) => string;
  getLocalizedComplaintStatus: (status: ComplaintStatus) => string;
}

const defaultLangObj = getWorldLanguage('ar');

const I18nContext = createContext<I18nContextValue>({
  lang: 'ar',
  worldLang: defaultLangObj,
  dir: 'rtl',
  isRtl: true,
  t: DICTIONARIES.ar,
  setLanguage: () => {},
  getLocalizedCountryName: (code, fallbackAr) =>
    fallbackAr || getCountryByCode(code).nameAr,
  getLocalizedServiceName: (svc) => SERVICE_LABELS[svc],
  getLocalizedStatusLabel: (st) => STATUS_LABELS[st],
  getLocalizedBillingLabel: (c) => BILLING_CYCLE_LABELS[c],
  getLocalizedSubscriptionLabel: (s) => SUBSCRIPTION_STATUS_LABELS[s],
  getLocalizedComplaintStatus: (s) => COMPLAINT_STATUS_LABELS[s],
});

interface I18nProviderProps {
  languageCode: string;
  onChangeLanguage: (code: string) => void;
  children: React.ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({
  languageCode,
  onChangeLanguage,
  children,
}) => {
  const worldLang = getWorldLanguage(languageCode);
  const dict = DICTIONARIES[worldLang.dictLocale] || DICTIONARIES.ar;
  const dir = worldLang.dir;
  const isRtl = dir === 'rtl';

  const getLocalizedCountryName = (countryCode?: string, fallbackAr?: string): string => {
    const code = (countryCode || 'DZ').toUpperCase();
    if (worldLang.code === 'ar') {
      return fallbackAr || getCountryByCode(code).nameAr;
    }
    try {
      const displayNames = new Intl.DisplayNames([worldLang.code, worldLang.dictLocale, 'en'], {
        type: 'region',
      });
      const localized = displayNames.of(code);
      if (localized && localized !== code) return localized;
    } catch {
      // Fallback gracefully below
    }
    return fallbackAr || getCountryByCode(code).nameAr || code;
  };

  const getLocalizedServiceName = (
    serviceType: ServiceType,
    settings?: PlatformSettings
  ): string => {
    // If Arabic is active, honor owner's custom Arabic service labels first
    if (worldLang.code === 'ar' && settings) {
      switch (serviceType) {
        case 'haircut':
          return settings.serviceHaircutLabel?.trim() || dict.svcHaircut;
        case 'protein':
          return settings.serviceProteinLabel?.trim() || dict.svcProtein;
        case 'blowdry':
          return settings.serviceBlowdryLabel?.trim() || dict.svcBlowdry;
        case 'all':
          return settings.serviceAllLabel?.trim() || dict.svcAll;
      }
    }
    switch (serviceType) {
      case 'haircut':
        return dict.svcHaircut;
      case 'protein':
        return dict.svcProtein;
      case 'blowdry':
        return dict.svcBlowdry;
      case 'all':
        return dict.svcAll;
    }
  };

  const getLocalizedStatusLabel = (status: TicketStatus): string => {
    switch (status) {
      case 'waiting':
        return dict.statusWaiting;
      case 'called':
        return dict.statusCalled;
      case 'in_chair':
        return dict.statusInChair;
      case 'completed':
        return dict.statusCompleted;
      case 'cancelled':
        return dict.statusCancelled;
    }
  };

  const getLocalizedBillingLabel = (cycle: BillingCycle): string => {
    switch (cycle) {
      case 'monthly':
        return dict.cycleMonthly;
      case 'yearly':
        return dict.cycleYearly;
      case 'per_booking':
        return dict.cyclePerBooking;
    }
  };

  const getLocalizedSubscriptionLabel = (status: SubscriptionStatus): string => {
    switch (status) {
      case 'active':
        return dict.subActive;
      case 'pending':
        return dict.subPending;
      case 'suspended':
        return dict.subSuspended;
    }
  };

  const getLocalizedComplaintStatus = (status: ComplaintStatus): string => {
    switch (status) {
      case 'open':
        return dict.cmpOpen;
      case 'reviewed':
        return dict.cmpReviewed;
      case 'resolved':
        return dict.cmpResolved;
    }
  };

  return (
    <I18nContext.Provider
      value={{
        lang: worldLang.code,
        worldLang,
        dir,
        isRtl,
        t: dict,
        setLanguage: onChangeLanguage,
        getLocalizedCountryName,
        getLocalizedServiceName,
        getLocalizedStatusLabel,
        getLocalizedBillingLabel,
        getLocalizedSubscriptionLabel,
        getLocalizedComplaintStatus,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
};

export function useI18n(): I18nContextValue {
  return useContext(I18nContext);
}
