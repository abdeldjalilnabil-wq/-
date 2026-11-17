import { useEffect, useMemo, useRef, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import {
  collection,
  collectionGroup,
  doc,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import {
  auth,
  db,
  handleFirestoreError,
  OperationType,
  signInWithGoogle,
  signOutUser,
  testConnection,
} from './firebase';
import {
  ADMIN_OWNER_EMAIL,
  DEFAULT_PLATFORM_SETTINGS,
  type AccountMode,
  type AppViewMode,
  type BarberShop,
  type PlatformSettings,
  type QueueSlot,
  type QueueTicket,
  type ThemeColorId,
  type UserProfile,
  type VoiceCall,
  type VoiceCallStatus,
} from './types';
import {
  confirmCustomerArrival,
  deferCustomerTurn,
  getUserProfile,
  saveUserLanguagePreference,
  saveUserThemeColor,
  upsertUserProfile,
} from './services/queueService';
import {
  answerIncomingVoiceCall,
  declineIncomingVoiceCall,
  type ActiveVoiceSession,
} from './services/voiceCallService';
import { I18nProvider, useI18n } from './i18n/I18nContext';
import { getStoredLanguage, getWorldLanguage, storeLanguage } from './i18n/languages';
import { ActiveVoiceCallOverlay } from './components/ActiveVoiceCallOverlay';
import { AppDownloadTrigger, OfflineIndicator } from './components/AppDownloadModal';
import { AuthGate } from './components/AuthGate';
import { BarberDashboard } from './components/BarberDashboard';
import { CountryFlag } from './components/CountryFlag';
import { CustomerPortal } from './components/CustomerPortal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { IncomingCallModal } from './components/IncomingCallModal';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { OwnerAdminPanel } from './components/OwnerAdminPanel';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { ringtoneController, triggerTurnNotification } from './utils/audioAlert';
import { normalizeSocialUrl } from './utils/socialLinks';
import {
  applyAppTheme,
  getStoredThemeColor,
  isValidThemeId,
  storeThemeColor,
} from './utils/theme';

interface MainAppShellProps {
  authReady: boolean;
  user: User | null;
  userProfile: UserProfile | null;
  viewMode: AppViewMode;
  authLoading: boolean;
  authError: string | null;
  platformSettings: PlatformSettings;
  effectiveTheme: ThemeColorId;
  activeTicket: QueueTicket | null;
  activeBarberSlots: QueueSlot[];
  activeBarberDoc: BarberShop | undefined;
  ringingVoiceCall: VoiceCall | null;
  activeCallKey: string;
  dismissedCallKey: string;
  callActionBusy: boolean;
  connectedVoiceCall: VoiceCall | null;
  customerVoiceStatus: VoiceCallStatus;
  customerRemoteStream: MediaStream | null;
  customerMicMuted: boolean;
  voiceError: string | null;
  isOwnerAdmin: boolean;
  allowVoiceCalls: boolean;
  allowDeferTurn: boolean;
  canDeferCalledTicket: boolean;
  isEmbedMode: boolean;
  onSelectTheme: (nextTheme: ThemeColorId) => void;
  onSignIn: (mode: AccountMode) => Promise<void>;
  onSwitchView: (nextView: AppViewMode) => Promise<void>;
  onAnswerVoiceCall: () => Promise<void>;
  onDeclineVoiceCall: () => Promise<void>;
  onConfirmArrival: () => Promise<void>;
  onDeferTurn: () => Promise<void>;
  onMuteOnly: () => void;
  onToggleCustomerMic: () => void;
  onEndCustomerVoiceCall: () => Promise<void>;
}

function MainAppShell({
  authReady,
  user,
  userProfile,
  viewMode,
  authLoading,
  authError,
  platformSettings,
  effectiveTheme,
  activeTicket,
  activeBarberSlots,
  ringingVoiceCall,
  activeCallKey,
  dismissedCallKey,
  callActionBusy,
  connectedVoiceCall,
  customerVoiceStatus,
  customerRemoteStream,
  customerMicMuted,
  voiceError,
  isOwnerAdmin,
  allowVoiceCalls,
  allowDeferTurn,
  canDeferCalledTicket,
  isEmbedMode,
  onSelectTheme,
  onSignIn,
  onSwitchView,
  onAnswerVoiceCall,
  onDeclineVoiceCall,
  onConfirmArrival,
  onDeferTurn,
  onMuteOnly,
  onToggleCustomerMic,
  onEndCustomerVoiceCall,
}: MainAppShellProps) {
  const { dir, t } = useI18n();

  if (!authReady) {
    return (
      <div
        dir={dir}
        className="min-h-screen bg-[var(--theme-bg)] flex items-center justify-center p-6"
      >
        <div className="text-sm font-medium text-[var(--theme-muted)]">
          {t.initializingPlatform}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <AuthGate
        platformSettings={platformSettings}
        currentTheme={effectiveTheme}
        onSelectTheme={onSelectTheme}
        onSignIn={onSignIn}
        isLoading={authLoading}
        errorMessage={authError}
        isEmbedMode={isEmbedMode}
      />
    );
  }

  const showIncomingCallModal =
    Boolean(activeTicket) &&
    (Boolean(ringingVoiceCall) || activeTicket?.status === 'called') &&
    Boolean(activeCallKey) &&
    dismissedCallKey !== activeCallKey &&
    !connectedVoiceCall;

  return (
    <div dir={dir} className="min-h-screen bg-[var(--theme-bg)] text-[var(--theme-text)] flex flex-col">
      {/* Strict 3-zone Top Navigation Bar */}
      <header
        className="sticky top-0 z-30 border-b border-[var(--theme-border)] backdrop-blur-md"
        style={{ backgroundColor: 'var(--theme-header-bg)' }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              void onSwitchView('customer');
            }}
            className="font-display text-xl font-extrabold tracking-tight text-[var(--theme-text)] whitespace-nowrap shrink-0"
          >
            {platformSettings.appName}
          </a>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <button
              type="button"
              onClick={() => void onSwitchView('customer')}
              className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                viewMode === 'customer'
                  ? 'border-[var(--theme-text)] text-[var(--theme-text)] font-bold'
                  : 'border-transparent text-[var(--theme-muted)] hover:text-[var(--theme-text)]'
              }`}
            >
              {t.navCustomer}
            </button>
            <button
              type="button"
              onClick={() => void onSwitchView('barber')}
              className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                viewMode === 'barber'
                  ? 'border-[var(--theme-text)] text-[var(--theme-text)] font-bold'
                  : 'border-transparent text-[var(--theme-muted)] hover:text-[var(--theme-text)]'
              }`}
            >
              {t.navBarber}
            </button>
            {isOwnerAdmin && (
              <button
                type="button"
                onClick={() => void onSwitchView('admin')}
                className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                  viewMode === 'admin'
                    ? 'border-[var(--theme-accent)] text-[var(--theme-accent)] font-bold'
                    : 'border-transparent text-[var(--theme-muted)] hover:text-[var(--theme-text)]'
                }`}
              >
                {t.navOwnerSettings}
              </button>
            )}
          </nav>

          <button
            type="button"
            onClick={() => void signOutUser()}
            className="px-4 py-2 text-xs font-semibold text-[var(--theme-text)] bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] rounded-xl hover:bg-[var(--theme-surface-hover)] transition-colors whitespace-nowrap shrink-0 min-h-[38px]"
          >
            {t.signOut}
          </button>
        </div>
      </header>

      {/* Secondary Workspace Bar: Theme Switcher + All-Languages Selector + Role Scope Hint */}
      <div className="border-b border-[var(--theme-border)] bg-[var(--theme-surface)]">
        <div className="max-w-7xl mx-auto px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <ThemeSwitcher currentTheme={effectiveTheme} onSelectTheme={onSelectTheme} />
            <LanguageSwitcher />
            <AppDownloadTrigger platformSettings={platformSettings} compact />
          </div>
          <span className="text-xs text-[var(--theme-muted)]">
            {isOwnerAdmin
              ? t.roleOwnerHint
              : viewMode === 'barber'
                ? t.roleBarberHint
                : t.roleCustomerHint}
          </span>
        </div>

        {/* Mobile workspace switch bar */}
        <div className="md:hidden px-4 pb-2.5">
          <div
            className={`grid gap-1 p-1 bg-[var(--theme-surface-muted)] rounded-xl ${
              isOwnerAdmin ? 'grid-cols-3' : 'grid-cols-2'
            }`}
          >
            <button
              type="button"
              onClick={() => void onSwitchView('customer')}
              className={`py-2 text-xs font-bold rounded-lg transition-colors min-h-[40px] ${
                viewMode === 'customer'
                  ? 'bg-[var(--theme-surface)] text-[var(--theme-text)] shadow-sm'
                  : 'text-[var(--theme-muted)]'
              }`}
            >
              {t.mobileCustomer}
            </button>
            <button
              type="button"
              onClick={() => void onSwitchView('barber')}
              className={`py-2 text-xs font-bold rounded-lg transition-colors min-h-[40px] ${
                viewMode === 'barber'
                  ? 'bg-[var(--theme-surface)] text-[var(--theme-text)] shadow-sm'
                  : 'text-[var(--theme-muted)]'
              }`}
            >
              {t.mobileBarber}
            </button>
            {isOwnerAdmin && (
              <button
                type="button"
                onClick={() => void onSwitchView('admin')}
                className={`py-2 text-xs font-bold rounded-lg transition-colors min-h-[40px] ${
                  viewMode === 'admin'
                    ? 'bg-[var(--theme-surface)] text-[var(--theme-accent)] shadow-sm'
                    : 'text-[var(--theme-muted)]'
                }`}
              >
                {t.mobileOwner}
              </button>
            )}
          </div>
        </div>
      </div>

      {platformSettings.maintenanceMode && !isOwnerAdmin && (
        <div className="max-w-7xl mx-auto w-full px-6 pt-5">
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-xs sm:text-sm font-semibold text-amber-950 dark:text-amber-100">
            {platformSettings.maintenanceMessage || DEFAULT_PLATFORM_SETTINGS.maintenanceMessage}
          </div>
        </div>
      )}

      {voiceError && (
        <div className="max-w-7xl mx-auto w-full px-6 pt-4">
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-200">
            {voiceError}
          </div>
        </div>
      )}

      <main id="top" className="flex-1">
        {viewMode === 'admin' && isOwnerAdmin ? (
          <OwnerAdminPanel platformSettings={platformSettings} />
        ) : viewMode === 'barber' ? (
          <BarberDashboard
            user={user}
            userProfile={userProfile}
            platformSettings={platformSettings}
          />
        ) : (
          <CustomerPortal
            user={user}
            userProfile={userProfile}
            activeTicket={activeTicket}
            activeBarberSlots={activeBarberSlots}
            platformSettings={platformSettings}
          />
        )}
      </main>

      {!isEmbedMode && (
        <footer className="border-t border-[var(--theme-border)] bg-[var(--theme-surface)] py-5 px-6 text-center text-xs text-[var(--theme-muted)] space-y-1.5">
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

      {showIncomingCallModal && activeTicket && (
        <IncomingCallModal
          ticket={activeTicket}
          incomingVoiceCall={ringingVoiceCall}
          platformSettings={platformSettings}
          allowVoiceCalls={allowVoiceCalls}
          allowDeferTurn={allowDeferTurn}
          canDefer={canDeferCalledTicket}
          isProcessing={callActionBusy}
          onAnswerVoiceCall={ringingVoiceCall ? onAnswerVoiceCall : undefined}
          onDeclineVoiceCall={ringingVoiceCall ? onDeclineVoiceCall : undefined}
          onConfirmArrival={onConfirmArrival}
          onDeferTurn={onDeferTurn}
          onMuteOnly={onMuteOnly}
        />
      )}

      {connectedVoiceCall && (
        <ActiveVoiceCallOverlay
          peerName={connectedVoiceCall.shopName}
          subtitle={t.callVoiceIncoming}
          status={customerVoiceStatus}
          remoteStream={customerRemoteStream}
          isMuted={customerMicMuted}
          onToggleMute={onToggleCustomerMic}
          onEndCall={onEndCustomerVoiceCall}
        />
      )}

      <OfflineIndicator />
    </div>
  );
}

function MainApp() {
  const isEmbedMode = useMemo(
    () =>
      typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get('embed') === '1',
    []
  );
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [viewMode, setViewMode] = useState<AppViewMode>('customer');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const pendingModeRef = useRef<AccountMode>('customer');

  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(
    DEFAULT_PLATFORM_SETTINGS
  );

  const [localTheme, setLocalTheme] = useState<ThemeColorId>(
    () => getStoredThemeColor() || DEFAULT_PLATFORM_SETTINGS.defaultTheme || 'gold'
  );
  const [localLanguage, setLocalLanguage] = useState<string>(
    () => getStoredLanguage() || DEFAULT_PLATFORM_SETTINGS.defaultLanguage || 'ar'
  );

  // Customer active ticket & live slots for incoming call + defer
  const [myTickets, setMyTickets] = useState<QueueTicket[]>([]);
  const [activeBarberSlots, setActiveBarberSlots] = useState<QueueSlot[]>([]);
  const [activeBarberDoc, setActiveBarberDoc] = useState<BarberShop | undefined>(undefined);
  const [dismissedCallKey, setDismissedCallKey] = useState<string>('');
  const [callActionBusy, setCallActionBusy] = useState(false);
  const lastNotifiedCallKeyRef = useRef<string>('');

  // Customer incoming/connected WebRTC online voice call state
  const [incomingCalls, setIncomingCalls] = useState<VoiceCall[]>([]);
  const customerVoiceSessionRef = useRef<ActiveVoiceSession | null>(null);
  const [connectedVoiceCall, setConnectedVoiceCall] = useState<VoiceCall | null>(null);
  const [customerVoiceStatus, setCustomerVoiceStatus] = useState<VoiceCallStatus>('ringing');
  const [customerRemoteStream, setCustomerRemoteStream] = useState<MediaStream | null>(null);
  const [customerMicMuted, setCustomerMicMuted] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  useEffect(() => {
    void testConnection();
    return () => {
      customerVoiceSessionRef.current?.cleanupLocalOnly();
    };
  }, []);

  // Subscribe to global owner-controlled settings, branding, language, features & pricing
  useEffect(() => {
    const path = 'platform/settings';
    const unsub = onSnapshot(
      doc(db, 'platform', 'settings'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as PlatformSettings;
          setPlatformSettings({
            ...DEFAULT_PLATFORM_SETTINGS,
            ...data,
          });
          if (!getStoredThemeColor() && data.defaultTheme && isValidThemeId(data.defaultTheme)) {
            setLocalTheme(data.defaultTheme);
          }
          if (!getStoredLanguage() && data.defaultLanguage) {
            setLocalLanguage(data.defaultLanguage);
          }
        }
      },
      (error) => {
        console.warn(`Platform settings listener (${path}):`, error.message);
      }
    );
    return () => unsub();
  }, []);

  const effectiveTheme: ThemeColorId = useMemo(() => {
    if (userProfile?.themeColor && isValidThemeId(userProfile.themeColor)) {
      return userProfile.themeColor;
    }
    if (localTheme && isValidThemeId(localTheme)) {
      return localTheme;
    }
    if (platformSettings.defaultTheme && isValidThemeId(platformSettings.defaultTheme)) {
      return platformSettings.defaultTheme;
    }
    return 'gold';
  }, [userProfile?.themeColor, localTheme, platformSettings.defaultTheme]);

  const effectiveLanguage: string = useMemo(() => {
    if (userProfile?.preferredLanguage) {
      return userProfile.preferredLanguage;
    }
    if (localLanguage) {
      return localLanguage;
    }
    return platformSettings.defaultLanguage || 'ar';
  }, [userProfile?.preferredLanguage, localLanguage, platformSettings.defaultLanguage]);

  useEffect(() => {
    applyAppTheme(effectiveTheme);
  }, [effectiveTheme]);

  useEffect(() => {
    const wl = getWorldLanguage(effectiveLanguage);
    document.documentElement.lang = wl.code;
    document.documentElement.dir = wl.dir;
  }, [effectiveLanguage]);

  const handleSelectTheme = (nextTheme: ThemeColorId) => {
    setLocalTheme(nextTheme);
    storeThemeColor(nextTheme);
    applyAppTheme(nextTheme);
    if (user) {
      void saveUserThemeColor(user.uid, nextTheme);
    }
  };

  const handleSelectLanguage = (nextLang: string) => {
    setLocalLanguage(nextLang);
    storeLanguage(nextLang);
    if (user) {
      void saveUserLanguagePreference(user.uid, nextLang);
    }
  };

  // Sync browser tab title with owner-configured app name
  useEffect(() => {
    document.title = `${platformSettings.appName} — ${platformSettings.appTagline}`;
  }, [platformSettings.appName, platformSettings.appTagline]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setAuthReady(true);

      if (!firebaseUser) {
        setUserProfile(null);
        setMyTickets([]);
        setActiveBarberSlots([]);
        setActiveBarberDoc(undefined);
        setIncomingCalls([]);
        customerVoiceSessionRef.current?.cleanupLocalOnly();
        setConnectedVoiceCall(null);
        ringtoneController.stopRinging();
        return;
      }

      try {
        const existing = await getUserProfile(firebaseUser.uid);
        if (existing) {
          setUserProfile(existing);
          setViewMode(existing.accountMode || pendingModeRef.current);
          if (existing.themeColor && isValidThemeId(existing.themeColor)) {
            setLocalTheme(existing.themeColor);
            storeThemeColor(existing.themeColor);
          }
          if (existing.preferredLanguage) {
            setLocalLanguage(existing.preferredLanguage);
            storeLanguage(existing.preferredLanguage);
          }
        } else {
          const initialMode = pendingModeRef.current;
          const storedTheme = getStoredThemeColor();
          const storedLang = getStoredLanguage();
          await upsertUserProfile({
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName || 'مستخدم',
            phone: '',
            accountMode: initialMode,
            themeColor: storedTheme || undefined,
            preferredLanguage: storedLang || undefined,
          });
          setViewMode(initialMode);
        }
      } catch (err) {
        console.error(err);
      }
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (!authReady || !user) return;
    const path = `users/${user.uid}`;
    const unsub = onSnapshot(
      doc(db, 'users', user.uid),
      (snap) => {
        if (snap.exists()) {
          setUserProfile(snap.data() as UserProfile);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
    return () => unsub();
  }, [authReady, user]);

  useEffect(() => {
    if (!authReady || !user) return;
    const path = 'queue';
    const q = query(
      collectionGroup(db, 'queue'),
      where('customerUid', '==', user.uid)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as QueueTicket);
        setMyTickets(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
    return () => unsub();
  }, [authReady, user]);

  useEffect(() => {
    if (!authReady || !user) return;
    const path = 'calls';
    const q = query(
      collectionGroup(db, 'calls'),
      where('customerUid', '==', user.uid)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as VoiceCall);
        list.sort((a, b) => {
          const at = a.createdAt?.toMillis?.() ?? 0;
          const bt = b.createdAt?.toMillis?.() ?? 0;
          return bt - at;
        });
        setIncomingCalls(list);
      },
      (error) => {
        console.warn(`Incoming calls listener (${path}):`, error.message);
      }
    );
    return () => unsub();
  }, [authReady, user]);

  const activeTicket = useMemo(() => {
    const active = myTickets.filter(
      (t) => t.status === 'called' || t.status === 'in_chair' || t.status === 'waiting'
    );
    if (active.length === 0) return null;
    active.sort((a, b) => {
      const rank = { called: 0, in_chair: 1, waiting: 2, completed: 3, cancelled: 4 };
      return rank[a.status] - rank[b.status];
    });
    return active[0];
  }, [myTickets]);

  const allowVoiceCalls = platformSettings.allowVoiceCalls !== false;
  const allowDeferTurn = platformSettings.allowDeferTurn !== false;

  const ringingVoiceCall = useMemo(() => {
    if (!allowVoiceCalls) return null;
    return incomingCalls.find((c) => c.status === 'ringing') || null;
  }, [incomingCalls, allowVoiceCalls]);

  useEffect(() => {
    if (!authReady || !user || !activeTicket) {
      setActiveBarberSlots([]);
      setActiveBarberDoc(undefined);
      return;
    }

    const slotsPath = `barbers/${activeTicket.barberId}/slots`;
    const slotsQ = query(
      collection(db, 'barbers', activeTicket.barberId, 'slots'),
      where('barberId', '==', activeTicket.barberId)
    );
    const unsubSlots = onSnapshot(
      slotsQ,
      (snap) => {
        const list = snap.docs.map((d) => d.data() as QueueSlot);
        list.sort((a, b) => a.queueOrder - b.queueOrder);
        setActiveBarberSlots(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, slotsPath);
      }
    );

    const barberPath = `barbers/${activeTicket.barberId}`;
    const unsubBarber = onSnapshot(
      doc(db, 'barbers', activeTicket.barberId),
      (snap) => {
        if (snap.exists()) {
          setActiveBarberDoc({ id: snap.id, ...snap.data() } as BarberShop);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, barberPath);
      }
    );

    return () => {
      unsubSlots();
      unsubBarber();
    };
  }, [authReady, user, activeTicket?.barberId]);

  const activeCallKey = useMemo(() => {
    if (ringingVoiceCall) {
      return `voice_${ringingVoiceCall.id}`;
    }
    if (activeTicket && activeTicket.status === 'called') {
      return `${activeTicket.id}_${activeTicket.callCount}`;
    }
    return '';
  }, [ringingVoiceCall, activeTicket]);

  useEffect(() => {
    if (activeCallKey && activeTicket && lastNotifiedCallKeyRef.current !== activeCallKey) {
      lastNotifiedCallKeyRef.current = activeCallKey;
      triggerTurnNotification(
        activeTicket.shopName,
        activeTicket.ticketNumber,
        activeTicket.lastBarberMessage
      );
    }
    if (!activeCallKey) {
      ringtoneController.stopRinging();
    }
  }, [activeCallKey, activeTicket]);

  const canDeferCalledTicket = useMemo(() => {
    if (!activeTicket) return false;
    return activeBarberSlots.some(
      (s) =>
        s.status === 'waiting' &&
        s.ticketId !== activeTicket.id &&
        (activeTicket.status === 'called' || s.queueOrder > activeTicket.queueOrder)
    );
  }, [activeTicket, activeBarberSlots]);

  const isOwnerAdmin = Boolean(
    user?.email &&
      user.email.toLowerCase() === ADMIN_OWNER_EMAIL.toLowerCase() &&
      user.emailVerified
  );

  useEffect(() => {
    if (viewMode === 'admin' && !isOwnerAdmin) {
      setViewMode('customer');
    }
  }, [viewMode, isOwnerAdmin]);

  const handleAnswerVoiceCall = async () => {
    if (!user || !ringingVoiceCall) return;
    setVoiceError(null);
    if (customerVoiceSessionRef.current) {
      await customerVoiceSessionRef.current.endCall();
      customerVoiceSessionRef.current = null;
    }
    setCustomerMicMuted(false);
    setCustomerRemoteStream(null);
    setCustomerVoiceStatus('connected');

    try {
      const session = await answerIncomingVoiceCall({
        call: ringingVoiceCall,
        customerUid: user.uid,
        onRemoteStream: (stream) => setCustomerRemoteStream(stream),
        onStatusChange: (status) => {
          setCustomerVoiceStatus(status);
          if (status === 'ended' || status === 'declined' || status === 'missed') {
            setTimeout(() => {
              setConnectedVoiceCall(null);
              setCustomerRemoteStream(null);
              customerVoiceSessionRef.current = null;
            }, 1200);
          }
        },
      });
      customerVoiceSessionRef.current = session;
      setConnectedVoiceCall(ringingVoiceCall);
    } catch (err) {
      setConnectedVoiceCall(null);
      setVoiceError(
        err instanceof Error
          ? err.message
          : 'تعذر الرد على المكالمة الصوتية عبر الإنترنت.'
      );
    }
  };

  const handleDeclineVoiceCall = async () => {
    if (!user || !ringingVoiceCall) return;
    try {
      await declineIncomingVoiceCall(ringingVoiceCall, user.uid);
    } catch (err) {
      console.warn(err);
    }
  };

  const handleSignIn = async (preferredMode: AccountMode) => {
    pendingModeRef.current = preferredMode;
    setAuthLoading(true);
    setAuthError(null);
    try {
      const signedInUser = await signInWithGoogle();
      const existing = await getUserProfile(signedInUser.uid);
      const storedTheme = getStoredThemeColor();
      const storedLang = getStoredLanguage();
      await upsertUserProfile({
        uid: signedInUser.uid,
        displayName: existing?.displayName || signedInUser.displayName || 'مستخدم',
        phone: existing?.phone || '',
        accountMode: preferredMode,
        barberId: existing?.barberId,
        themeColor: existing?.themeColor || storedTheme || undefined,
        preferredLanguage: existing?.preferredLanguage || storedLang || undefined,
      });
      setViewMode(preferredMode);
    } catch (err) {
      setAuthError(
        err instanceof Error ? err.message : 'تعذر إتمام تسجيل الدخول بحساب Google.'
      );
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSwitchView = async (nextView: AppViewMode) => {
    if (nextView === 'admin' && !isOwnerAdmin) return;
    setViewMode(nextView);
    if (user && (nextView === 'customer' || nextView === 'barber')) {
      try {
        await upsertUserProfile({
          uid: user.uid,
          displayName: userProfile?.displayName || user.displayName || 'مستخدم',
          phone: userProfile?.phone || '',
          accountMode: nextView,
          barberId: userProfile?.barberId,
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <I18nProvider languageCode={effectiveLanguage} onChangeLanguage={handleSelectLanguage}>
      <MainAppShell
        authReady={authReady}
        user={user}
        userProfile={userProfile}
        viewMode={viewMode}
        authLoading={authLoading}
        authError={authError}
        platformSettings={platformSettings}
        effectiveTheme={effectiveTheme}
        activeTicket={activeTicket}
        activeBarberSlots={activeBarberSlots}
        activeBarberDoc={activeBarberDoc}
        ringingVoiceCall={ringingVoiceCall}
        activeCallKey={activeCallKey}
        dismissedCallKey={dismissedCallKey}
        callActionBusy={callActionBusy}
        connectedVoiceCall={connectedVoiceCall}
        customerVoiceStatus={customerVoiceStatus}
        customerRemoteStream={customerRemoteStream}
        customerMicMuted={customerMicMuted}
        voiceError={voiceError}
        isOwnerAdmin={isOwnerAdmin}
        allowVoiceCalls={allowVoiceCalls}
        allowDeferTurn={allowDeferTurn}
        canDeferCalledTicket={canDeferCalledTicket}
        isEmbedMode={isEmbedMode}
        onSelectTheme={handleSelectTheme}
        onSignIn={handleSignIn}
        onSwitchView={handleSwitchView}
        onAnswerVoiceCall={handleAnswerVoiceCall}
        onDeclineVoiceCall={handleDeclineVoiceCall}
        onConfirmArrival={async () => {
          if (!activeTicket) return;
          setCallActionBusy(true);
          try {
            await confirmCustomerArrival({
              ticket: activeTicket,
              barber: activeBarberDoc,
            });
          } finally {
            setCallActionBusy(false);
          }
        }}
        onDeferTurn={async () => {
          if (!activeTicket) return;
          setCallActionBusy(true);
          try {
            await deferCustomerTurn({
              ticket: activeTicket,
              slots: activeBarberSlots,
              barber: activeBarberDoc,
            });
          } finally {
            setCallActionBusy(false);
          }
        }}
        onMuteOnly={() => setDismissedCallKey(activeCallKey)}
        onToggleCustomerMic={() => {
          if (customerVoiceSessionRef.current) {
            setCustomerMicMuted(customerVoiceSessionRef.current.toggleMute());
          }
        }}
        onEndCustomerVoiceCall={async () => {
          await customerVoiceSessionRef.current?.endCall();
          customerVoiceSessionRef.current = null;
          setConnectedVoiceCall(null);
          setCustomerRemoteStream(null);
        }}
      />
    </I18nProvider>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <MainApp />
    </ErrorBoundary>
  );
}
