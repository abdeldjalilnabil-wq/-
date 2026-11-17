import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import {
  PhoneCall,
  Play,
  MapPin,
  Upload,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Users,
  Clock,
  Store,
  Scissors,
  UserCheck,
  MessageCircle,
  Send,
  Phone,
  MessageSquare,
  AlertTriangle,
  ExternalLink,
  ShieldAlert,
  CreditCard,
  Globe,
  Code2,
  Copy,
  Check,
  X,
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  ADMIN_OWNER_EMAIL,
  DEFAULT_PLATFORM_SETTINGS,
  DEFAULT_WHATSAPP_COUNTRY_CODE,
  PRESET_BARBER_AVATARS,
  QUICK_BARBER_MESSAGES,
  SERVICE_OPTIONS,
  VALIDATION_LIMITS,
  WHATSAPP_COUNTRY_PRESETS,
  type BarberComplaint,
  type BarberShop,
  type PlatformSettings,
  type QueueTicket,
  type ServiceType,
  type SubscriptionPayment,
  type TicketMessage,
  type UserProfile,
  type VoiceCall,
  type VoiceCallStatus,
} from '../types';
import {
  barberSetTicketStatus,
  callNextCustomer,
  recallCustomer,
  saveBarberShop,
  sendTicketMessage,
  syncBarberWaitingCount,
  toggleBarberOpenState,
  updateComplaintStatus,
  upsertUserProfile,
} from '../services/queueService';
import {
  startOutgoingVoiceCall,
  type ActiveVoiceSession,
} from '../services/voiceCallService';
import { useI18n } from '../i18n/I18nContext';
import { ALL_COUNTRIES, COUNTRY_STATES, getCountryByCode } from '../data/locations';
import { compressAvatarFile } from '../utils/imageResize';
import { ringtoneController } from '../utils/audioAlert';
import { getPaymentMethodMeta } from '../utils/paymentCards';
import { normalizeSocialUrl } from '../utils/socialLinks';
import { buildTurnWhatsAppMessage, buildWhatsAppUrl } from '../utils/whatsapp';
import { ActiveVoiceCallOverlay } from './ActiveVoiceCallOverlay';
import { BarberPaymentModal } from './BarberPaymentModal';
import { CountryFlag } from './CountryFlag';

interface BarberDashboardProps {
  user: User;
  userProfile: UserProfile | null;
  platformSettings: PlatformSettings;
}

export const BarberDashboard: React.FC<BarberDashboardProps> = ({
  user,
  userProfile,
  platformSettings,
}) => {
  const {
    t,
    getLocalizedCountryName,
    getLocalizedServiceName,
    getLocalizedStatusLabel,
    getLocalizedBillingLabel,
    getLocalizedSubscriptionLabel,
    getLocalizedComplaintStatus,
  } = useI18n();

  const [barberShop, setBarberShop] = useState<BarberShop | null>(null);
  const [loadingShop, setLoadingShop] = useState(true);
  const [tickets, setTickets] = useState<QueueTicket[]>([]);
  const [payments, setPayments] = useState<SubscriptionPayment[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [copiedEmbedField, setCopiedEmbedField] = useState<'direct' | 'widget' | 'code' | null>(null);
  const [activeTab, setActiveTab] = useState<'queue' | 'settings'>('queue');
  const [queueFilter, setQueueFilter] = useState<'active' | 'history'>('active');

  // Online internet call & messaging state
  const [autoOnlineCallOnNext, setAutoOnlineCallOnNext] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [focusMessages, setFocusMessages] = useState<TicketMessage[]>([]);

  // WebRTC active call state
  const voiceSessionRef = useRef<ActiveVoiceSession | null>(null);
  const [activeVoiceCall, setActiveVoiceCall] = useState<VoiceCall | null>(null);
  const [voiceCallStatus, setVoiceCallStatus] = useState<VoiceCallStatus>('ringing');
  const [remoteAudioStream, setRemoteAudioStream] = useState<MediaStream | null>(null);
  const [isMicMuted, setIsMicMuted] = useState(false);

  // Real-time customer complaints against this barber
  const [complaints, setComplaints] = useState<BarberComplaint[]>([]);
  const [updatingComplaintId, setUpdatingComplaintId] = useState<string | null>(null);
  const seenOpenComplaintIdsRef = useRef<Set<string>>(new Set());
  const complaintsLoadedRef = useRef(false);

  // Shop profile form state
  const [shopName, setShopName] = useState('');
  const [barberName, setBarberName] = useState('');
  const [countryCode, setCountryCode] = useState('DZ');
  const [stateName, setStateName] = useState('29 - معسكر');
  const [customStateMode, setCustomStateMode] = useState(false);
  const [location, setLocation] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string>(PRESET_BARBER_AVATARS[0].url);
  const [whatsappCountryCode, setWhatsappCountryCode] = useState<string>(DEFAULT_WHATSAPP_COUNTRY_CODE);
  const [barberPhone, setBarberPhone] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const [avgMinutes, setAvgMinutes] = useState(20);
  const [selectedServices, setSelectedServices] = useState<ServiceType[]>([
    'haircut',
    'protein',
    'blowdry',
    'all',
  ]);
  const [savingShop, setSavingShop] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarImgError, setAvatarImgError] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const allowVoiceCalls = platformSettings.allowVoiceCalls !== false;
  const allowWhatsApp = platformSettings.allowWhatsApp !== false;
  const allowInAppMessages = platformSettings.allowInAppMessages !== false;
  const allowComplaints = platformSettings.allowComplaints !== false;
  const allowBarberSocials = platformSettings.allowBarberSocials !== false;
  const allowNewBarberRegistration = platformSettings.allowNewBarberRegistration !== false;
  const isOwner = user.email?.toLowerCase() === ADMIN_OWNER_EMAIL.toLowerCase();
  const ownerPhoneDisplay =
    platformSettings.ownerPhone || DEFAULT_PLATFORM_SETTINGS.ownerPhone || '0557052602';

  useEffect(() => {
    return () => {
      voiceSessionRef.current?.cleanupLocalOnly();
    };
  }, []);

  // Subscribe to barber's own shop doc
  useEffect(() => {
    const path = `barbers/${user.uid}`;
    const unsub = onSnapshot(
      doc(db, 'barbers', user.uid),
      (snap) => {
        if (snap.exists()) {
          const data = { id: snap.id, ...snap.data() } as BarberShop;
          const resolvedCountry = (data.countryCode || 'DZ').toUpperCase();
          const resolvedState = data.stateName || '';
          const statesForCountry = COUNTRY_STATES[resolvedCountry] || [];

          setBarberShop(data);
          setShopName(data.shopName);
          setBarberName(data.barberName);
          setCountryCode(resolvedCountry);
          setStateName(resolvedState);
          setCustomStateMode(
            Boolean(resolvedState) &&
              statesForCountry.length > 0 &&
              !statesForCountry.includes(resolvedState)
          );
          setLocation(data.location);
          setAvatarUrl(data.avatarUrl || PRESET_BARBER_AVATARS[0].url);
          setWhatsappCountryCode(data.whatsappCountryCode || DEFAULT_WHATSAPP_COUNTRY_CODE);
          setBarberPhone(data.barberPhone || '');
          setFacebookUrl(data.facebookUrl || '');
          setTiktokUrl(data.tiktokUrl || '');
          setInstagramUrl(data.instagramUrl || '');
          setIsOpen(data.isOpen);
          setAvgMinutes(data.avgMinutesPerClient || 20);
          setSelectedServices(data.services || ['haircut', 'protein', 'blowdry', 'all']);
        } else {
          setBarberShop(null);
          setBarberName((prev) => prev || userProfile?.displayName || user.displayName || '');
        }
        setLoadingShop(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
    return () => unsub();
  }, [user.uid, user.displayName, userProfile?.displayName]);

  // Subscribe to barber's queue tickets
  useEffect(() => {
    if (!barberShop) {
      setTickets([]);
      return;
    }
    const path = `barbers/${user.uid}/queue`;
    const q = query(
      collection(db, 'barbers', user.uid, 'queue'),
      where('barberUid', '==', user.uid)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as QueueTicket);
        list.sort((a, b) => a.queueOrder - b.queueOrder);
        setTickets(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
    return () => unsub();
  }, [barberShop?.id, user.uid]);

  // Subscribe to barber's electronic payment history
  useEffect(() => {
    if (!barberShop) {
      setPayments([]);
      return;
    }
    const path = `barbers/${user.uid}/payments`;
    const q = query(
      collection(db, 'barbers', user.uid, 'payments'),
      where('barberUid', '==', user.uid)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as SubscriptionPayment);
        list.sort((a, b) => {
          const at = a.createdAt?.toMillis?.() ?? 0;
          const bt = b.createdAt?.toMillis?.() ?? 0;
          return bt - at;
        });
        setPayments(list);
      },
      (error) => {
        console.warn(`Payments listener (${path}):`, error.message);
      }
    );
    return () => unsub();
  }, [barberShop?.id, user.uid]);

  // Subscribe to customer complaints submitted against this barber
  useEffect(() => {
    if (!barberShop) {
      setComplaints([]);
      complaintsLoadedRef.current = false;
      seenOpenComplaintIdsRef.current.clear();
      return;
    }
    const path = `barbers/${user.uid}/complaints`;
    const q = query(
      collection(db, 'barbers', user.uid, 'complaints'),
      where('barberUid', '==', user.uid)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as BarberComplaint);
        list.sort((a, b) => {
          const at = a.createdAt?.toMillis?.() ?? 0;
          const bt = b.createdAt?.toMillis?.() ?? 0;
          return bt - at;
        });
        setComplaints(list);

        const openOnes = list.filter((c) => c.status === 'open');
        if (complaintsLoadedRef.current) {
          const newlyArrived = openOnes.find(
            (c) => !seenOpenComplaintIdsRef.current.has(c.id)
          );
          if (newlyArrived) {
            ringtoneController.playSoftChime();
            if (
              typeof window !== 'undefined' &&
              'Notification' in window &&
              Notification.permission === 'granted'
            ) {
              try {
                new Notification(t.barberUrgentComplaintTitle, {
                  body: `${newlyArrived.complaintType} — ${newlyArrived.customerName}`,
                });
              } catch {
                // Ignore Notification errors inside iframe
              }
            }
          }
        }
        openOnes.forEach((c) => seenOpenComplaintIdsRef.current.add(c.id));
        complaintsLoadedRef.current = true;
      },
      (error) => {
        console.warn(`Complaints listener (${path}):`, error.message);
      }
    );
    return () => unsub();
  }, [barberShop?.id, user.uid, t.barberUrgentComplaintTitle]);

  const activeWaitingTickets = useMemo(
    () => tickets.filter((tItem) => tItem.status === 'waiting'),
    [tickets]
  );
  const calledTicket = useMemo(
    () => tickets.find((tItem) => tItem.status === 'called') || null,
    [tickets]
  );
  const inChairTicket = useMemo(
    () => tickets.find((tItem) => tItem.status === 'in_chair') || null,
    [tickets]
  );
  const historyTickets = useMemo(
    () => tickets.filter((tItem) => tItem.status === 'completed' || tItem.status === 'cancelled'),
    [tickets]
  );

  const activeFocusTicket = calledTicket || inChairTicket || activeWaitingTickets[0] || null;
  const activeSeatTicket = calledTicket || inChairTicket || null;

  // Listen to messages on the focused ticket
  useEffect(() => {
    if (!barberShop || !activeFocusTicket || !allowInAppMessages) {
      setFocusMessages([]);
      return;
    }
    const path = `barbers/${barberShop.id}/queue/${activeFocusTicket.id}/messages`;
    const q = query(
      collection(db, 'barbers', barberShop.id, 'queue', activeFocusTicket.id, 'messages'),
      where('barberUid', '==', user.uid)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => d.data() as TicketMessage);
        list.sort((a, b) => {
          const at = a.createdAt?.toMillis?.() ?? 0;
          const bt = b.createdAt?.toMillis?.() ?? 0;
          return at - bt;
        });
        setFocusMessages(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
    return () => unsub();
  }, [barberShop?.id, activeFocusTicket?.id, allowInAppMessages, user.uid]);

  useEffect(() => {
    if (!barberShop) return;
    const actualWaitingOrCalled = tickets.filter(
      (tItem) => tItem.status === 'waiting' || tItem.status === 'called'
    ).length;
    if (tickets.length > 0 && barberShop.waitingCount !== actualWaitingOrCalled) {
      void syncBarberWaitingCount(barberShop.id, actualWaitingOrCalled);
    }
  }, [barberShop, tickets]);

  const handleToggleService = (svc: ServiceType) => {
    setSelectedServices((prev) => {
      if (prev.includes(svc)) {
        if (prev.length === 1) return prev;
        return prev.filter((item) => item !== svc);
      }
      return [...prev, svc];
    });
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    setFeedbackMsg(null);
    try {
      const compressed = await compressAvatarFile(file);
      setAvatarUrl(compressed);
      setAvatarImgError(false);
    } catch (err) {
      setFeedbackMsg({
        type: 'error',
        text: err instanceof Error ? err.message : 'تعذر تحميل الصورة.',
      });
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleCountrySelectChange = (newCode: string) => {
    setCountryCode(newCode);
    const countryObj = getCountryByCode(newCode);
    if (countryObj.dialCode) {
      setWhatsappCountryCode(countryObj.dialCode);
    }
    const nextStates = COUNTRY_STATES[newCode] || [];
    if (nextStates.length > 0) {
      setStateName(nextStates[0]);
      setCustomStateMode(false);
    } else {
      setStateName('');
      setCustomStateMode(true);
    }
  };

  const handleSaveShop = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMsg(null);

    if (shopName.trim().length < 2) {
      setFeedbackMsg({ type: 'error', text: 'يرجى إدخال اسم البراند أو المحل (حرفان على الأقل).' });
      return;
    }
    if (barberName.trim().length < 2) {
      setFeedbackMsg({ type: 'error', text: 'يرجى إدخال اسم الحلاق / العامل.' });
      return;
    }
    if (!stateName.trim()) {
      setFeedbackMsg({ type: 'error', text: 'يرجى اختيار أو كتابة الولاية / المنطقة التي تعمل فيها.' });
      return;
    }
    if (location.trim().length < 2) {
      setFeedbackMsg({ type: 'error', text: 'يرجى إدخال مكان العمل / عنوان المحل.' });
      return;
    }

    setSavingShop(true);
    try {
      const countryObj = getCountryByCode(countryCode);
      await saveBarberShop({
        ownerUid: user.uid,
        shopName,
        barberName,
        countryCode: countryObj.code,
        countryName: countryObj.nameAr,
        stateName: stateName.trim(),
        location,
        avatarUrl,
        whatsappCountryCode,
        barberPhone,
        facebookUrl: normalizeSocialUrl(facebookUrl, 'facebook'),
        tiktokUrl: normalizeSocialUrl(tiktokUrl, 'tiktok'),
        instagramUrl: normalizeSocialUrl(instagramUrl, 'instagram'),
        isOpen,
        avgMinutesPerClient: avgMinutes,
        services: selectedServices,
        initialSubscriptionStatus:
          platformSettings.pricingEnabled && !isOwner ? 'pending' : 'active',
      });
      await upsertUserProfile({
        uid: user.uid,
        displayName: barberName.trim(),
        phone: barberPhone.trim() || userProfile?.phone || '',
        accountMode: 'barber',
        barberId: user.uid,
      });
      setFeedbackMsg({ type: 'success', text: 'تم حفظ بيانات المحل والهوية بنجاح.' });
      setActiveTab('queue');
    } catch (err) {
      setFeedbackMsg({
        type: 'error',
        text: err instanceof Error ? err.message : 'تعذر حفظ بيانات المحل.',
      });
    } finally {
      setSavingShop(false);
    }
  };

  const handleComplaintStatusUpdate = async (
    complaintId: string,
    status: 'reviewed' | 'resolved'
  ) => {
    if (!barberShop) return;
    setUpdatingComplaintId(complaintId);
    try {
      await updateComplaintStatus({
        barberId: barberShop.id,
        complaintId,
        status,
      });
    } catch (err) {
      setFeedbackMsg({
        type: 'error',
        text: err instanceof Error ? err.message : 'تعذر تحديث حالة الشكوى.',
      });
    } finally {
      setUpdatingComplaintId(null);
    }
  };

  const startOnlineCall = async (ticket: QueueTicket) => {
    if (!barberShop || !allowVoiceCalls) return;
    if (voiceSessionRef.current) {
      await voiceSessionRef.current.endCall();
      voiceSessionRef.current = null;
    }
    setIsMicMuted(false);
    setRemoteAudioStream(null);
    setVoiceCallStatus('ringing');

    try {
      const session = await startOutgoingVoiceCall({
        barber: barberShop,
        ticket,
        onRemoteStream: (stream) => setRemoteAudioStream(stream),
        onCallDocCreated: (callDoc) => setActiveVoiceCall(callDoc),
        onStatusChange: (status) => {
          setVoiceCallStatus(status);
          if (status === 'ended' || status === 'declined' || status === 'missed') {
            setTimeout(() => {
              setActiveVoiceCall(null);
              setRemoteAudioStream(null);
              voiceSessionRef.current = null;
            }, 1200);
          }
        },
      });
      voiceSessionRef.current = session;
      setFeedbackMsg({
        type: 'success',
        text: `تم بدء مكالمة صوتية عبر الإنترنت مع ${ticket.customerName}.`,
      });
    } catch (err) {
      setActiveVoiceCall(null);
      setFeedbackMsg({
        type: 'error',
        text:
          err instanceof Error
            ? err.message
            : 'تعذر بدء المكالمة الصوتية عبر الإنترنت.',
      });
    }
  };

  const handleSendMessageToTicket = async (ticket: QueueTicket, textToSend: string) => {
    if (!barberShop || !allowInAppMessages) return;
    const clean = textToSend.trim();
    if (!clean) return;
    setSendingMsg(true);
    setFeedbackMsg(null);
    try {
      await sendTicketMessage({
        ticket,
        senderUid: user.uid,
        senderRole: 'barber',
        senderName: barberShop.shopName,
        text: clean,
      });
      ringtoneController.playSoftChime();
      setCustomMessage('');
      setFeedbackMsg({
        type: 'success',
        text: `تم إرسال الرسالة إلى ${ticket.customerName} فوراً.`,
      });
    } catch (err) {
      setFeedbackMsg({
        type: 'error',
        text: err instanceof Error ? err.message : 'تعذر إرسال الرسالة.',
      });
    } finally {
      setSendingMsg(false);
    }
  };

  const handleContinueWork = async () => {
    if (!barberShop) return;
    setActionBusy(true);
    setFeedbackMsg(null);
    try {
      const next = await callNextCustomer({ barber: barberShop, tickets });
      ringtoneController.playSoftChime();
      if (next) {
        setFeedbackMsg({
          type: 'success',
          text: `تم استدعاء ${next.customerName} (#${next.ticketNumber}) بنجاح.`,
        });
        if (autoOnlineCallOnNext && allowVoiceCalls) {
          await startOnlineCall(next);
        }
      } else {
        setFeedbackMsg({
          type: 'success',
          text: t.barberContinueEmpty,
        });
      }
    } catch (err) {
      setFeedbackMsg({
        type: 'error',
        text: err instanceof Error ? err.message : 'تعذر استدعاء الزبون التالي.',
      });
    } finally {
      setActionBusy(false);
    }
  };

  const handleRecall = async (ticket: QueueTicket) => {
    if (!barberShop) return;
    setActionBusy(true);
    setFeedbackMsg(null);
    try {
      await recallCustomer(barberShop.id, ticket);
      ringtoneController.playSoftChime();
      setFeedbackMsg({
        type: 'success',
        text: `${ticket.customerName} (#${ticket.ticketNumber})`,
      });
    } catch (err) {
      setFeedbackMsg({
        type: 'error',
        text: err instanceof Error ? err.message : 'تعذر إعادة التنبيه.',
      });
    } finally {
      setActionBusy(false);
    }
  };

  const handleSetStatus = async (
    ticket: QueueTicket,
    newStatus: 'in_chair' | 'completed' | 'cancelled'
  ) => {
    if (!barberShop) return;
    setActionBusy(true);
    setFeedbackMsg(null);
    try {
      await barberSetTicketStatus({
        barber: barberShop,
        ticket,
        newStatus,
        allTickets: tickets,
      });
    } catch (err) {
      setFeedbackMsg({
        type: 'error',
        text: err instanceof Error ? err.message : 'تعذر تحديث حالة التذكرة.',
      });
    } finally {
      setActionBusy(false);
    }
  };

  if (loadingShop) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-6">
        <div className="h-24 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] animate-pulse" />
        <div className="h-64 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] animate-pulse" />
      </div>
    );
  }

  if (!barberShop && !allowNewBarberRegistration && !isOwner) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-2xl p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-[var(--theme-accent)] flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h1 className="font-display text-2xl font-extrabold text-[var(--theme-text)]">
            {t.barberRegPausedTitle}
          </h1>
          <p className="text-sm text-[var(--theme-muted)] leading-relaxed">
            {t.barberRegPausedDesc}{' '}
            <a
              href={`tel:${ownerPhoneDisplay.replace(/[^\d+]/g, '')}`}
              dir="ltr"
              className="font-mono-num font-bold text-[var(--theme-text)] hover:underline"
            >
              {ownerPhoneDisplay}
            </a>
          </p>
        </div>
      </div>
    );
  }

  if (!barberShop || activeTab === 'settings') {
    return (
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-2xl font-extrabold text-[var(--theme-text)]">
              {barberShop ? t.barberEditTitle : t.barberCreateTitle}
            </h1>
            <p className="text-sm text-[var(--theme-muted)] mt-1">
              {t.barberProfileHint}
            </p>
          </div>
          {barberShop && (
            <button
              type="button"
              onClick={() => setActiveTab('queue')}
              className="px-4 py-2 text-sm font-medium bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-text)] rounded-xl hover:bg-[var(--theme-surface-muted)] transition-colors whitespace-nowrap shrink-0 min-h-[40px]"
            >
              {t.barberBackToQueue}
            </button>
          )}
        </div>

        <form
          onSubmit={(e) => void handleSaveShop(e)}
          className="bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-2xl p-6 sm:p-8 space-y-6"
        >
          {/* Avatar Selection & Upload */}
          <div>
            <label className="block text-sm font-semibold text-[var(--theme-text)] mb-3">
              {t.barberAvatarLabel}
            </label>
            <div className="flex flex-wrap items-center gap-5">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border border-[var(--theme-border)] bg-[var(--theme-surface-muted)] flex items-center justify-center shrink-0">
                {avatarUrl && !avatarImgError ? (
                  <img
                    src={avatarUrl}
                    alt={t.barberAvatarLabel}
                    referrerPolicy="no-referrer"
                    onError={() => setAvatarImgError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Scissors className="w-8 h-8 text-[var(--theme-accent)]" />
                )}
              </div>

              <div className="flex-1 space-y-3 min-w-[220px]">
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => void handleAvatarFileChange(e)}
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={avatarUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--theme-primary)] text-[var(--theme-primary-text)] text-xs font-medium rounded-xl hover:bg-[var(--theme-primary-hover)] transition-colors min-h-[40px]"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{avatarUploading ? t.barberUploading : t.barberUploadAvatar}</span>
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--theme-muted)]">{t.barberPresetAvatar}</span>
                  {PRESET_BARBER_AVATARS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setAvatarUrl(preset.url);
                        setAvatarImgError(false);
                      }}
                      title={preset.label}
                      className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition-colors ${
                        avatarUrl === preset.url
                          ? 'border-[var(--theme-accent)]'
                          : 'border-[var(--theme-border)] opacity-75 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-[var(--theme-border)]">
            <div>
              <label
                htmlFor="shopName"
                className="block text-sm font-semibold text-[var(--theme-text)] mb-1.5"
              >
                {t.barberShopNameLabel}
              </label>
              <input
                id="shopName"
                type="text"
                required
                maxLength={VALIDATION_LIMITS.SHOP_NAME_MAX}
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full px-4 py-2.5 bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] rounded-xl text-sm text-[var(--theme-text)] focus:outline-none focus:border-[var(--theme-accent)]"
              />
            </div>

            <div>
              <label
                htmlFor="barberName"
                className="block text-sm font-semibold text-[var(--theme-text)] mb-1.5"
              >
                {t.barberNameLabel}
              </label>
              <input
                id="barberName"
                type="text"
                required
                maxLength={VALIDATION_LIMITS.DISPLAY_NAME_MAX}
                value={barberName}
                onChange={(e) => setBarberName(e.target.value)}
                className="w-full px-4 py-2.5 bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] rounded-xl text-sm text-[var(--theme-text)] focus:outline-none focus:border-[var(--theme-accent)]"
              />
            </div>
          </div>

          {/* Country & Wilaya / State Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-[var(--theme-border)]">
            <div>
              <label
                htmlFor="barberCountry"
                className="block text-sm font-semibold text-[var(--theme-text)] mb-1.5"
              >
                {t.barberCountryLabel}
              </label>
              <div className="flex items-center gap-2.5">
                <CountryFlag countryCode={countryCode} size="md" />
                <select
                  id="barberCountry"
                  value={countryCode}
                  onChange={(e) => handleCountrySelectChange(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] rounded-xl text-sm text-[var(--theme-text)] focus:outline-none focus:border-[var(--theme-accent)]"
                >
                  {ALL_COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {getLocalizedCountryName(c.code, c.nameAr)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="barberState"
                className="block text-sm font-semibold text-[var(--theme-text)] mb-1.5"
              >
                {t.barberStateLabel}
              </label>
              {(COUNTRY_STATES[countryCode]?.length ?? 0) > 0 && !customStateMode ? (
                <select
                  id="barberState"
                  value={stateName || COUNTRY_STATES[countryCode][0]}
                  onChange={(e) => {
                    if (e.target.value === '__other__') {
                      setCustomStateMode(true);
                      setStateName('');
                    } else {
                      setStateName(e.target.value);
                    }
                  }}
                  className="w-full px-4 py-2.5 bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] rounded-xl text-sm text-[var(--theme-text)] focus:outline-none focus:border-[var(--theme-accent)]"
                >
                  {COUNTRY_STATES[countryCode].map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                  <option value="__other__">{t.barberCustomStateOpt}</option>
                </select>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    id="barberState"
                    type="text"
                    required
                    maxLength={VALIDATION_LIMITS.STATE_NAME_MAX}
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    placeholder={t.barberStatePlaceholder}
                    className="flex-1 px-4 py-2.5 bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] rounded-xl text-sm text-[var(--theme-text)] focus:outline-none focus:border-[var(--theme-accent)]"
                  />
                  {(COUNTRY_STATES[countryCode]?.length ?? 0) > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setCustomStateMode(false);
                        setStateName(COUNTRY_STATES[countryCode][0]);
                      }}
                      className="px-3 py-2.5 text-xs font-semibold bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] text-[var(--theme-text)] rounded-xl hover:bg-[var(--theme-surface-hover)] shrink-0"
                    >
                      {t.barberListBtn}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="location"
              className="block text-sm font-semibold text-[var(--theme-text)] mb-1.5"
            >
              {t.barberLocationLabel}
            </label>
            <input
              id="location"
              type="text"
              required
              maxLength={VALIDATION_LIMITS.LOCATION_MAX}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-2.5 bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] rounded-xl text-sm text-[var(--theme-text)] focus:outline-none focus:border-[var(--theme-accent)]"
            />
          </div>

          {allowBarberSocials && (
            <div className="pt-2 border-t border-[var(--theme-border)] space-y-3">
              <div>
                <p className="text-sm font-semibold text-[var(--theme-text)]">
                  {t.barberSocialsTitle}
                </p>
                <p className="text-xs text-[var(--theme-muted)] mt-0.5">
                  {t.barberSocialsDesc}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="fbUrl" className="block text-xs font-semibold text-[var(--theme-text)] mb-1">
                    Facebook
                  </label>
                  <input
                    id="fbUrl"
                    type="text"
                    dir="ltr"
                    maxLength={VALIDATION_LIMITS.SOCIAL_URL_MAX}
                    value={facebookUrl}
                    onChange={(e) => setFacebookUrl(e.target.value)}
                    placeholder="https://facebook.com/..."
                    className="w-full px-3.5 py-2.5 bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] rounded-xl text-xs text-[var(--theme-text)] text-left focus:outline-none focus:border-[var(--theme-accent)]"
                  />
                </div>

                <div>
                  <label htmlFor="ttUrl" className="block text-xs font-semibold text-[var(--theme-text)] mb-1">
                    TikTok
                  </label>
                  <input
                    id="ttUrl"
                    type="text"
                    dir="ltr"
                    maxLength={VALIDATION_LIMITS.SOCIAL_URL_MAX}
                    value={tiktokUrl}
                    onChange={(e) => setTiktokUrl(e.target.value)}
                    placeholder="@username"
                    className="w-full px-3.5 py-2.5 bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] rounded-xl text-xs text-[var(--theme-text)] text-left focus:outline-none focus:border-[var(--theme-accent)]"
                  />
                </div>

                <div>
                  <label htmlFor="igUrl" className="block text-xs font-semibold text-[var(--theme-text)] mb-1">
                    Instagram
                  </label>
                  <input
                    id="igUrl"
                    type="text"
                    dir="ltr"
                    maxLength={VALIDATION_LIMITS.SOCIAL_URL_MAX}
                    value={instagramUrl}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                    placeholder="@username"
                    className="w-full px-3.5 py-2.5 bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] rounded-xl text-xs text-[var(--theme-text)] text-left focus:outline-none focus:border-[var(--theme-accent)]"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-[var(--theme-border)]">
            <div>
              <label htmlFor="waCountry" className="block text-sm font-semibold text-[var(--theme-text)] mb-1.5">
                {t.barberWaCodeLabel}
              </label>
              <select
                id="waCountry"
                value={whatsappCountryCode}
                onChange={(e) => setWhatsappCountryCode(e.target.value)}
                className="w-full px-4 py-2.5 bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] rounded-xl text-sm text-[var(--theme-text)] focus:outline-none focus:border-[var(--theme-accent)]"
              >
                {WHATSAPP_COUNTRY_PRESETS.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="barberPhone" className="block text-sm font-semibold text-[var(--theme-text)] mb-1.5">
                {t.barberPhoneLabel}
              </label>
              <input
                id="barberPhone"
                type="tel"
                dir="ltr"
                maxLength={VALIDATION_LIMITS.PHONE_MAX}
                value={barberPhone}
                onChange={(e) => setBarberPhone(e.target.value)}
                placeholder="05XXXXXXXX"
                className="w-full px-4 py-2.5 bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] rounded-xl text-sm text-[var(--theme-text)] font-mono-num text-start focus:outline-none focus:border-[var(--theme-accent)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-[var(--theme-border)]">
            <div>
              <label htmlFor="avgMinutes" className="block text-sm font-semibold text-[var(--theme-text)] mb-1.5">
                {t.barberAvgMinutesLabel}
              </label>
              <select
                id="avgMinutes"
                value={avgMinutes}
                onChange={(e) => setAvgMinutes(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] rounded-xl text-sm text-[var(--theme-text)] focus:outline-none focus:border-[var(--theme-accent)]"
              >
                {[15, 20, 25, 30, 45].map((m) => (
                  <option key={m} value={m}>
                    {m} {t.barberMinutesSuffix}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className={`w-full py-2.5 px-4 rounded-xl border text-sm font-semibold transition-colors min-h-[44px] ${
                  isOpen
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200'
                    : 'bg-[var(--theme-surface-muted)] border-[var(--theme-border)] text-[var(--theme-muted)]'
                }`}
              >
                {isOpen ? t.barberStatusOpenBtn : t.barberStatusClosedBtn}
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-[var(--theme-border)]">
            <p className="text-sm font-semibold text-[var(--theme-text)] mb-3">
              {t.barberServicesOffered}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SERVICE_OPTIONS.map((svc) => {
                const active = selectedServices.includes(svc.id);
                const effectiveLabel = getLocalizedServiceName(svc.id, platformSettings);
                return (
                  <button
                    key={svc.id}
                    type="button"
                    onClick={() => handleToggleService(svc.id)}
                    className={`p-3 rounded-xl border text-start transition-colors min-h-[48px] ${
                      active
                        ? 'border-[var(--theme-primary)] bg-[var(--theme-primary)] text-[var(--theme-primary-text)]'
                        : 'border-[var(--theme-border)] bg-[var(--theme-surface-muted)] text-[var(--theme-text)] hover:border-[var(--theme-accent)]'
                    }`}
                  >
                    <div className="text-sm font-bold">{effectiveLabel}</div>
                    <div
                      className={`text-xs mt-0.5 ${
                        active ? 'opacity-80' : 'text-[var(--theme-muted)]'
                      }`}
                    >
                      {svc.shortDesc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {feedbackMsg && (
            <div
              className={`p-3.5 rounded-xl border text-xs ${
                feedbackMsg.type === 'error'
                  ? 'bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800 text-red-700 dark:text-red-200'
                  : 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              }`}
            >
              {feedbackMsg.text}
            </div>
          )}

          <button
            type="submit"
            disabled={savingShop}
            className="w-full py-3.5 px-6 bg-[var(--theme-accent)] hover:bg-[var(--theme-accent-hover)] text-[var(--theme-accent-text)] text-sm font-bold rounded-xl transition-colors min-h-[48px] disabled:opacity-50"
          >
            {savingShop ? t.custSaving : t.barberSaveShopBtn}
          </button>
        </form>
      </div>
    );
  }

  const nextWaiting = activeWaitingTickets[0] || null;
  const shopCountryCode = barberShop.whatsappCountryCode || DEFAULT_WHATSAPP_COUNTRY_CODE;
  const shopIsoCountry = barberShop.countryCode || 'DZ';
  const shopCountryLabel = getLocalizedCountryName(shopIsoCountry, barberShop.countryName);
  const openComplaints = complaints.filter((c) => c.status === 'open');
  const fbLink = allowBarberSocials
    ? normalizeSocialUrl(barberShop.facebookUrl, 'facebook')
    : '';
  const ttLink = allowBarberSocials
    ? normalizeSocialUrl(barberShop.tiktokUrl, 'tiktok')
    : '';
  const igLink = allowBarberSocials
    ? normalizeSocialUrl(barberShop.instagramUrl, 'instagram')
    : '';

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Real-time Urgent Alert Banner when Customers File Complaints */}
      {openComplaints.length > 0 && (
        <div className="bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-800 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-extrabold text-red-950 dark:text-red-100">
                {t.barberUrgentComplaintTitle} ({openComplaints.length})
              </h2>
              <p className="text-xs text-red-800 dark:text-red-200 mt-0.5">
                {t.barberUrgentComplaintDesc}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {openComplaints.map((cmp) => (
              <div
                key={cmp.id}
                className="bg-[var(--theme-surface)] border border-red-200 dark:border-red-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-bold text-red-700 dark:text-red-400">
                      {cmp.complaintType}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="text-[var(--theme-muted)]">
                      {cmp.customerName}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--theme-text)] leading-relaxed">{cmp.details}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    disabled={updatingComplaintId === cmp.id}
                    onClick={() => void handleComplaintStatusUpdate(cmp.id, 'reviewed')}
                    className="px-3.5 py-2 bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] text-[var(--theme-text)] text-xs font-semibold rounded-xl hover:bg-[var(--theme-surface-hover)] transition-colors min-h-[38px]"
                  >
                    {t.barberMarkReviewed}
                  </button>
                  <button
                    type="button"
                    disabled={updatingComplaintId === cmp.id}
                    onClick={() => void handleComplaintStatusUpdate(cmp.id, 'resolved')}
                    className="px-3.5 py-2 bg-[#15803D] text-white text-xs font-bold rounded-xl hover:bg-[#166534] transition-colors min-h-[38px]"
                  >
                    {t.barberMarkResolved}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shop Header & Mode Bar */}
      <div className="bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden border border-[var(--theme-border)] bg-[var(--theme-surface-muted)] shrink-0">
            {barberShop.avatarUrl ? (
              <img
                src={barberShop.avatarUrl}
                alt={barberShop.shopName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[var(--theme-accent)]">
                <Store className="w-7 h-7" />
              </div>
            )}
          </div>
          <div>
            <h1 className="font-display text-2xl font-extrabold text-[var(--theme-text)]">
              {barberShop.shopName}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--theme-muted)] mt-1">
              <span>{barberShop.barberName}</span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1.5">
                <CountryFlag countryCode={shopIsoCountry} size="sm" />
                <span>
                  {shopCountryLabel}
                  {barberShop.stateName ? ` — ${barberShop.stateName}` : ''}
                </span>
              </span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[var(--theme-accent)]" />
                {barberShop.location}
              </span>
              <span aria-hidden="true">·</span>
              <span
                className={
                  barberShop.isOpen
                    ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
                    : 'text-red-700 dark:text-red-400 font-semibold'
                }
              >
                {barberShop.isOpen ? t.custShopOpen : t.custShopClosed}
              </span>
            </div>

            {(fbLink || ttLink || igLink) && (
              <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--theme-muted)] mt-2">
                {fbLink && (
                  <a
                    href={fbLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[var(--theme-text)] hover:text-[var(--theme-accent)] font-medium"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Facebook</span>
                  </a>
                )}
                {ttLink && (
                  <a
                    href={ttLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[var(--theme-text)] hover:text-[var(--theme-accent)] font-medium"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>TikTok</span>
                  </a>
                )}
                {igLink && (
                  <a
                    href={igLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[var(--theme-text)] hover:text-[var(--theme-accent)] font-medium"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Instagram</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {platformSettings.pricingEnabled && (
            <span className="text-xs font-semibold text-[var(--theme-muted)]">
              {t.barberSubscriptionLabel}{' '}
              {getLocalizedSubscriptionLabel(barberShop.subscriptionStatus || 'active')} ·{' '}
              <span className="font-mono-num font-bold text-[var(--theme-text)]">
                {platformSettings.usagePrice} {platformSettings.currency}
              </span>{' '}
              / {getLocalizedBillingLabel(platformSettings.billingCycle)}
            </span>
          )}

          <button
            type="button"
            onClick={() => setShowPaymentModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl bg-[var(--theme-accent)] hover:bg-[var(--theme-accent-hover)] text-[var(--theme-accent-text)] transition-colors whitespace-nowrap min-h-[42px]"
          >
            <CreditCard className="w-4 h-4 shrink-0" />
            <span>{t.barberPayElectronicBtn}</span>
          </button>

          <button
            type="button"
            onClick={() => void toggleBarberOpenState(barberShop.id, !barberShop.isOpen)}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl border transition-colors whitespace-nowrap min-h-[42px] ${
              barberShop.isOpen
                ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100'
                : 'border-[var(--theme-border)] bg-[var(--theme-surface-muted)] text-[var(--theme-text)] hover:bg-[var(--theme-surface-hover)]'
            }`}
          >
            {barberShop.isOpen ? t.barberPauseBookings : t.barberOpenBookings}
          </button>

          <button
            type="button"
            onClick={() => setShowEmbedModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] text-[var(--theme-text)] rounded-xl hover:bg-[var(--theme-surface-hover)] transition-colors whitespace-nowrap min-h-[42px]"
          >
            <Globe className="w-4 h-4 text-[var(--theme-accent)] shrink-0" />
            <span>{t.barberEmbedBtn}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className="px-4 py-2.5 text-xs font-semibold bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] text-[var(--theme-text)] rounded-xl hover:bg-[var(--theme-surface-hover)] transition-colors whitespace-nowrap min-h-[42px]"
          >
            {t.barberEditProfileBtn}
          </button>
        </div>
      </div>

      {platformSettings.pricingEnabled &&
        (barberShop.subscriptionStatus === 'pending' ||
          barberShop.subscriptionStatus === 'suspended') && (
          <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-bold text-amber-950 dark:text-amber-100">
                {barberShop.subscriptionStatus === 'suspended'
                  ? t.barberSubSuspendedTitle
                  : t.barberSubPendingTitle}
              </p>
              <p className="text-xs text-amber-900 dark:text-amber-200">
                <span className="font-mono-num font-bold">
                  {platformSettings.usagePrice} {platformSettings.currency}
                </span>{' '}
                ({getLocalizedBillingLabel(platformSettings.billingCycle)}).{' '}
                {platformSettings.paymentInstructions}{' '}
                <span className="font-mono-num font-bold" dir="ltr">
                  {ownerPhoneDisplay}
                </span>
              </p>
            </div>
            {barberShop.subscriptionStatus === 'pending' && (
              <button
                type="button"
                onClick={() => setShowPaymentModal(true)}
                className="px-5 py-3 bg-[var(--theme-accent)] hover:bg-[var(--theme-accent-hover)] text-[var(--theme-accent-text)] text-xs font-extrabold rounded-xl inline-flex items-center gap-2 shrink-0 min-h-[44px]"
              >
                <CreditCard className="w-4 h-4" />
                <span>{t.barberPayElectronicBtn}</span>
              </button>
            )}
          </div>
        )}

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-[var(--theme-muted)] mb-2">
            <span>{t.barberMetricWaiting}</span>
            <Users className="w-4 h-4 text-[var(--theme-accent)]" />
          </div>
          <div className="font-mono-num text-3xl font-bold text-[var(--theme-text)]">
            {activeWaitingTickets.length}
          </div>
        </div>

        <div className="bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-[var(--theme-muted)] mb-2">
            <span>{t.barberMetricCurrent}</span>
            <Scissors className="w-4 h-4 text-[var(--theme-accent)]" />
          </div>
          <div className="font-mono-num text-3xl font-bold text-[var(--theme-text)]">
            #{barberShop.nowServingNumber || 0}
          </div>
        </div>

        <div className="bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-[var(--theme-muted)] mb-2">
            <span>{t.barberMetricTotalWait}</span>
            <Clock className="w-4 h-4 text-[var(--theme-accent)]" />
          </div>
          <div className="font-mono-num text-3xl font-bold text-[var(--theme-text)]">
            {activeWaitingTickets.length * barberShop.avgMinutesPerClient} {t.custMinUnit}
          </div>
        </div>

        <div className="bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-[var(--theme-muted)] mb-2">
            <span>{t.barberMetricCompleted}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          </div>
          <div className="font-mono-num text-3xl font-bold text-[var(--theme-text)]">
            {tickets.filter((tItem) => tItem.status === 'completed').length}
          </div>
        </div>
      </div>

      {feedbackMsg && (
        <div
          className={`p-4 rounded-2xl border text-sm ${
            feedbackMsg.type === 'error'
              ? 'bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800 text-red-700 dark:text-red-200'
              : 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
          }`}
        >
          {feedbackMsg.text}
        </div>
      )}

      {/* Main Split: Chair Command & Queue Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Chair Command */}
        <div className="lg:col-span-5 bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-2xl p-6 space-y-5">
          <div>
            <p className="text-xs font-semibold text-[var(--theme-accent)] mb-1">
              {t.barberChairKicker}
            </p>
            <h2 className="font-display text-xl font-extrabold text-[var(--theme-text)]">
              {t.barberChairTitle}
            </h2>
          </div>

          {activeFocusTicket ? (
            <div className="p-5 rounded-2xl bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-xs font-semibold text-[var(--theme-accent)]">
                    {getLocalizedStatusLabel(activeFocusTicket.status)}
                  </span>
                  <h3 className="font-display text-xl font-bold text-[var(--theme-text)] mt-0.5">
                    {activeFocusTicket.customerName}
                  </h3>
                  <p className="text-xs text-[var(--theme-muted)] mt-1">
                    {getLocalizedServiceName(activeFocusTicket.serviceType, platformSettings)} ·{' '}
                    <span className="font-mono-num" dir="ltr">
                      {activeFocusTicket.customerPhone}
                    </span>
                  </p>
                </div>
                <span className="font-mono-num text-2xl font-extrabold text-[var(--theme-text)]">
                  #{activeFocusTicket.ticketNumber}
                </span>
              </div>

              {(allowVoiceCalls || allowWhatsApp) && (
                <div
                  className={`grid gap-2.5 pt-2 border-t border-[var(--theme-border)] ${
                    allowVoiceCalls && allowWhatsApp
                      ? 'grid-cols-1 sm:grid-cols-2'
                      : 'grid-cols-1'
                  }`}
                >
                  {allowVoiceCalls && (
                    <button
                      type="button"
                      disabled={Boolean(activeVoiceCall)}
                      onClick={() => void startOnlineCall(activeFocusTicket)}
                      className="py-3 px-4 bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-[var(--theme-primary-text)] text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 min-h-[44px] disabled:opacity-50"
                    >
                      <Phone className="w-4 h-4 text-[var(--theme-accent)]" />
                      <span>{t.barberOnlineVoiceBtn}</span>
                    </button>
                  )}

                  {allowWhatsApp && (
                    <a
                      href={buildWhatsAppUrl({
                        phone: activeFocusTicket.customerPhone,
                        countryCode: shopCountryCode,
                        message: buildTurnWhatsAppMessage({
                          customerName: activeFocusTicket.customerName,
                          shopName: barberShop.shopName,
                          ticketNumber: activeFocusTicket.ticketNumber,
                        }),
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-3 px-4 bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 min-h-[44px]"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{t.barberWhatsAppCallMsg}</span>
                    </a>
                  )}
                </div>
              )}

              {allowInAppMessages && (
                <div className="pt-2 border-t border-[var(--theme-border)] space-y-2.5">
                  <p className="text-xs font-semibold text-[var(--theme-text)]">
                    {t.barberQuickMsgLabel}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_BARBER_MESSAGES.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        disabled={sendingMsg}
                        onClick={() => void handleSendMessageToTicket(activeFocusTicket, preset)}
                        className="px-3 py-2 bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border)] text-[var(--theme-text)] text-xs font-semibold rounded-xl transition-colors text-start"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      maxLength={VALIDATION_LIMITS.MESSAGE_MAX}
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      placeholder={t.barberCustomMsgPlaceholder}
                      className="flex-1 px-3.5 py-2.5 bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-xl text-xs text-[var(--theme-text)] focus:outline-none focus:border-[var(--theme-accent)]"
                    />
                    <button
                      type="button"
                      disabled={sendingMsg || !customMessage.trim()}
                      onClick={() => void handleSendMessageToTicket(activeFocusTicket, customMessage)}
                      className="px-4 py-2.5 bg-[var(--theme-accent)] hover:bg-[var(--theme-accent-hover)] text-[var(--theme-accent-text)] text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 min-h-[40px] disabled:opacity-40"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{t.barberSendBtn}</span>
                    </button>
                  </div>

                  {focusMessages.length > 0 && (
                    <div className="bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-xl p-3 space-y-2 max-h-36 overflow-y-auto">
                      {focusMessages.slice(-4).map((m) => (
                        <div
                          key={m.id}
                          className={`text-xs p-2 rounded-lg ${
                            m.senderRole === 'barber'
                              ? 'bg-[var(--theme-surface-muted)] text-[var(--theme-text)]'
                              : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-100'
                          }`}
                        >
                          <span className="font-bold me-1.5">
                            {m.senderRole === 'barber'
                              ? t.custYou
                              : `${activeFocusTicket.customerName}:`}
                          </span>
                          <span>{m.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeFocusTicket.status === 'called' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-[var(--theme-border)]">
                  <button
                    type="button"
                    disabled={actionBusy}
                    onClick={() => void handleSetStatus(activeFocusTicket, 'in_chair')}
                    className="py-2.5 px-3 bg-[var(--theme-primary)] text-[var(--theme-primary-text)] text-xs font-bold rounded-xl hover:bg-[var(--theme-primary-hover)] transition-colors flex items-center justify-center gap-1.5 min-h-[40px]"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>{t.barberSeatedBtn}</span>
                  </button>
                  <button
                    type="button"
                    disabled={actionBusy}
                    onClick={() => void handleRecall(activeFocusTicket)}
                    className="py-2.5 px-3 bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-text)] text-xs font-semibold rounded-xl hover:bg-[var(--theme-surface-hover)] transition-colors flex items-center justify-center gap-1.5 min-h-[40px]"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>{t.barberRecallBtn}</span>
                  </button>
                  <button
                    type="button"
                    disabled={actionBusy}
                    onClick={() => void handleSetStatus(activeFocusTicket, 'cancelled')}
                    className="py-2.5 px-3 bg-[var(--theme-surface)] border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-xs font-semibold rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors flex items-center justify-center gap-1.5 min-h-[40px]"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>{t.barberNoShowBtn}</span>
                  </button>
                </div>
              )}

              <div className="pt-1 flex justify-end">
                <a
                  href={`tel:${activeFocusTicket.customerPhone.replace(/[^\d+]/g, '')}`}
                  className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[var(--theme-muted)] hover:text-[var(--theme-text)]"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>{t.barberSimCall}</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] text-center">
              <p className="text-sm font-semibold text-[var(--theme-text)] mb-1">
                {t.barberNoCustomers}
              </p>
              <p className="text-xs text-[var(--theme-muted)]">
                {t.barberNoCustomersDesc}
              </p>
            </div>
          )}

          {/* Primary Button: Continue Work */}
          <div className="space-y-3 pt-2 border-t border-[var(--theme-border)]">
            <button
              type="button"
              disabled={actionBusy || (!nextWaiting && !activeSeatTicket)}
              onClick={() => void handleContinueWork()}
              className="w-full py-4 px-6 bg-[var(--theme-accent)] hover:bg-[var(--theme-accent-hover)] text-[var(--theme-accent-text)] text-base font-extrabold rounded-2xl transition-colors flex items-center justify-center gap-2.5 min-h-[56px] disabled:opacity-40"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>
                {nextWaiting
                  ? `${t.barberContinueNext} ${nextWaiting.customerName} (#${nextWaiting.ticketNumber})`
                  : activeSeatTicket
                    ? t.barberContinueFinish
                    : t.barberContinueEmpty}
              </span>
            </button>

            {allowVoiceCalls && (
              <label className="flex items-center justify-between gap-3 px-2 py-1 text-xs text-[var(--theme-muted)] cursor-pointer">
                <span>{t.barberAutoCallCheckbox}</span>
                <input
                  type="checkbox"
                  checked={autoOnlineCallOnNext}
                  onChange={(e) => setAutoOnlineCallOnNext(e.target.checked)}
                  className="w-4 h-4 accent-[var(--theme-accent)]"
                />
              </label>
            )}
          </div>
        </div>

        {/* Queue List */}
        <div className="lg:col-span-7 bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-[var(--theme-border)] flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-lg font-extrabold text-[var(--theme-text)]">
                {t.barberQueueTitle}
              </h2>
              <p className="text-xs text-[var(--theme-muted)] mt-0.5">
                {t.barberQueueDesc}
              </p>
            </div>

            <div className="flex items-center gap-1 p-1 bg-[var(--theme-surface-muted)] rounded-xl border border-[var(--theme-border)]">
              <button
                type="button"
                onClick={() => setQueueFilter('active')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  queueFilter === 'active'
                    ? 'bg-[var(--theme-surface)] text-[var(--theme-text)] shadow-sm'
                    : 'text-[var(--theme-muted)] hover:text-[var(--theme-text)]'
                }`}
              >
                {t.barberTabWaiting} ({activeWaitingTickets.length})
              </button>
              <button
                type="button"
                onClick={() => setQueueFilter('history')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  queueFilter === 'history'
                    ? 'bg-[var(--theme-surface)] text-[var(--theme-text)] shadow-sm'
                    : 'text-[var(--theme-muted)] hover:text-[var(--theme-text)]'
                }`}
              >
                {t.barberTabHistory} ({historyTickets.length})
              </button>
            </div>
          </div>

          {queueFilter === 'active' ? (
            activeWaitingTickets.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="w-10 h-10 text-[var(--theme-muted)] opacity-50 mx-auto mb-3" />
                <p className="text-sm font-semibold text-[var(--theme-text)] mb-1">
                  {t.barberEmptyWaiting}
                </p>
                <p className="text-xs text-[var(--theme-muted)]">
                  {t.barberNoCustomersDesc}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--theme-border)]">
                {activeWaitingTickets.map((ticket, index) => (
                  <div
                    key={ticket.id}
                    className="p-5 flex flex-col gap-3.5 hover:bg-[var(--theme-surface-muted)]/60 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-xl bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] flex flex-col items-center justify-center shrink-0">
                          <span className="font-mono-num text-sm font-bold text-[var(--theme-text)]">
                            #{ticket.ticketNumber}
                          </span>
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-sm text-[var(--theme-text)]">
                              {ticket.customerName}
                            </span>
                            <span className="text-xs text-[var(--theme-muted)]">·</span>
                            <span className="text-xs font-medium text-[var(--theme-accent)]">
                              {getLocalizedServiceName(ticket.serviceType, platformSettings)}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--theme-muted)] mt-1">
                            <span>
                              {t.barberOrderLabel} {index + 1}
                            </span>
                            <span>·</span>
                            <span className="font-mono-num" dir="ltr">
                              {ticket.customerPhone}
                            </span>
                            {ticket.deferCount > 0 && (
                              <>
                                <span>·</span>
                                <span className="text-amber-700 dark:text-amber-300 font-medium">
                                  {t.custDeferredCount} ({ticket.deferCount})
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {allowVoiceCalls && (
                          <button
                            type="button"
                            disabled={Boolean(activeVoiceCall)}
                            onClick={() => void startOnlineCall(ticket)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[var(--theme-primary)] text-[var(--theme-primary-text)] text-xs font-semibold rounded-xl hover:bg-[var(--theme-primary-hover)] transition-colors whitespace-nowrap min-h-[38px] disabled:opacity-50"
                          >
                            <Phone className="w-3.5 h-3.5 text-[var(--theme-accent)]" />
                            <span>{t.barberOnlineVoiceBtn}</span>
                          </button>
                        )}

                        {allowInAppMessages && (
                          <button
                            type="button"
                            disabled={sendingMsg}
                            onClick={() =>
                              void handleSendMessageToTicket(
                                ticket,
                                'حان دورك، يمكنك التقرب للمحل الآن.'
                              )
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[var(--theme-accent)] text-[var(--theme-accent-text)] text-xs font-semibold rounded-xl hover:bg-[var(--theme-accent-hover)] transition-colors whitespace-nowrap min-h-[38px]"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>{t.barberMsgComeBtn}</span>
                          </button>
                        )}

                        {allowWhatsApp && (
                          <a
                            href={buildWhatsAppUrl({
                              phone: ticket.customerPhone,
                              countryCode: shopCountryCode,
                              message: buildTurnWhatsAppMessage({
                                customerName: ticket.customerName,
                                shopName: barberShop.shopName,
                                ticketNumber: ticket.ticketNumber,
                              }),
                            })}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold rounded-xl hover:bg-emerald-100 transition-colors whitespace-nowrap min-h-[38px]"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>{t.custWhatsApp}</span>
                          </a>
                        )}

                        <button
                          type="button"
                          disabled={actionBusy}
                          onClick={() => void handleRecall(ticket)}
                          className="px-3 py-2 bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] text-[var(--theme-text)] text-xs font-semibold rounded-xl hover:bg-[var(--theme-surface-hover)] transition-colors whitespace-nowrap min-h-[38px]"
                        >
                          {t.barberRecallBtn}
                        </button>

                        <button
                          type="button"
                          disabled={actionBusy}
                          onClick={() => void handleSetStatus(ticket, 'cancelled')}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : historyTickets.length === 0 ? (
            <div className="p-12 text-center text-sm text-[var(--theme-muted)]">
              {t.barberEmptyHistory}
            </div>
          ) : (
            <div className="divide-y divide-[var(--theme-border)]">
              {historyTickets.slice(0, 20).map((ticket) => (
                <div
                  key={ticket.id}
                  className="p-4 flex items-center justify-between gap-4 text-sm"
                >
                  <div>
                    <span className="font-mono-num font-bold text-[var(--theme-text)] me-2">
                      #{ticket.ticketNumber}
                    </span>
                    <span className="font-medium text-[var(--theme-text)]">
                      {ticket.customerName}
                    </span>
                    <span className="text-xs text-[var(--theme-muted)] mx-2">·</span>
                    <span className="text-xs text-[var(--theme-muted)]">
                      {getLocalizedServiceName(ticket.serviceType, platformSettings)}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      ticket.status === 'completed'
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-red-700 dark:text-red-400'
                    }`}
                  >
                    {getLocalizedStatusLabel(ticket.status)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Electronic Subscription Payments History */}
      <section className="bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-[var(--theme-border)] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <CreditCard className="w-5 h-5 text-[var(--theme-accent)]" />
            <div>
              <h2 className="font-display text-lg font-extrabold text-[var(--theme-text)]">
                {t.payHistoryTitle}
              </h2>
              <p className="text-xs text-[var(--theme-muted)] mt-0.5">
                {t.payModalSubtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowPaymentModal(true)}
            className="px-4 py-2.5 bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-[var(--theme-primary-text)] text-xs font-bold rounded-xl inline-flex items-center gap-1.5 min-h-[40px]"
          >
            <CreditCard className="w-4 h-4 text-[var(--theme-accent)]" />
            <span>{t.barberPayElectronicBtn}</span>
          </button>
        </div>

        {payments.length === 0 ? (
          <div className="p-8 text-center text-xs text-[var(--theme-muted)]">
            {t.payHistoryEmpty}
          </div>
        ) : (
          <div className="divide-y divide-[var(--theme-border)]">
            {payments.map((pay) => {
              const meta = getPaymentMethodMeta(pay.paymentMethod);
              return (
                <div
                  key={pay.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex flex-wrap items-center gap-2.5 text-xs">
                    <span
                      className="px-2 py-0.5 rounded-md text-[10px] font-extrabold font-mono-num"
                      style={{ backgroundColor: meta.accentBg, color: meta.accentText }}
                    >
                      {meta.shortCode}
                    </span>
                    <span className="font-mono-num font-bold text-[var(--theme-text)]">
                      {pay.amount} {pay.currency}
                    </span>
                    {pay.cardLast4 && (
                      <span className="font-mono-num text-[var(--theme-muted)]" dir="ltr">
                        •••• {pay.cardLast4}
                      </span>
                    )}
                    <span aria-hidden="true">·</span>
                    <span className="font-mono-num text-[var(--theme-muted)]" dir="ltr">
                      {pay.referenceCode}
                    </span>
                  </div>

                  <span
                    className={`text-xs font-bold ${
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
              );
            })}
          </div>
        )}
      </section>

      {/* Complaints Archive / Status Panel */}
      {(allowComplaints || complaints.length > 0) && complaints.length > 0 && (
        <section className="bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-[var(--theme-border)] flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-extrabold text-[var(--theme-text)]">
                {t.barberComplaintsArchive}
              </h2>
              <p className="text-xs text-[var(--theme-muted)] mt-0.5">
                {t.barberTotalComplaints}{' '}
                <span className="font-mono-num font-bold">{complaints.length}</span>
              </p>
            </div>
          </div>
          <div className="divide-y divide-[var(--theme-border)]">
            {complaints.map((cmp) => (
              <div
                key={cmp.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-bold text-[var(--theme-text)]">{cmp.complaintType}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-[var(--theme-muted)]">{cmp.customerName}</span>
                    <span aria-hidden="true">·</span>
                    <span
                      className={`font-semibold ${
                        cmp.status === 'open'
                          ? 'text-red-700 dark:text-red-400'
                          : cmp.status === 'reviewed'
                            ? 'text-[var(--theme-accent)]'
                            : 'text-emerald-700 dark:text-emerald-400'
                      }`}
                    >
                      {getLocalizedComplaintStatus(cmp.status)}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--theme-muted)] leading-relaxed">{cmp.details}</p>
                </div>

                {cmp.status !== 'resolved' && (
                  <div className="flex items-center gap-2 shrink-0">
                    {cmp.status === 'open' && (
                      <button
                        type="button"
                        disabled={updatingComplaintId === cmp.id}
                        onClick={() => void handleComplaintStatusUpdate(cmp.id, 'reviewed')}
                        className="px-3 py-1.5 bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] text-[var(--theme-text)] text-xs font-semibold rounded-xl hover:bg-[var(--theme-surface-hover)]"
                      >
                        {t.barberMarkReviewed}
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={updatingComplaintId === cmp.id}
                      onClick={() => void handleComplaintStatusUpdate(cmp.id, 'resolved')}
                      className="px-3 py-1.5 bg-[#15803D] text-white text-xs font-bold rounded-xl hover:bg-[#166534]"
                    >
                      {t.barberMarkResolved}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {showPaymentModal && (
        <BarberPaymentModal
          barberShop={barberShop}
          platformSettings={platformSettings}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={(msg) => setFeedbackMsg({ type: 'success', text: msg })}
        />
      )}

      {activeVoiceCall && (
        <ActiveVoiceCallOverlay
          peerName={activeVoiceCall.customerName}
          subtitle={`${t.barberOnlineVoiceBtn} · ${barberShop.shopName}`}
          status={voiceCallStatus}
          remoteStream={remoteAudioStream}
          isMuted={isMicMuted}
          onToggleMute={() => {
            if (voiceSessionRef.current) {
              setIsMicMuted(voiceSessionRef.current.toggleMute());
            }
          }}
          onEndCall={async () => {
            await voiceSessionRef.current?.endCall();
            voiceSessionRef.current = null;
            setActiveVoiceCall(null);
            setRemoteAudioStream(null);
          }}
        />
      )}
      {showEmbedModal && (() => {
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        const directShopUrl = origin
          ? `${origin}/?barber=${barberShop.id}`
          : `/?barber=${barberShop.id}`;
        const widgetShopUrl = origin
          ? `${origin}/?embed=1&barber=${barberShop.id}`
          : `/?embed=1&barber=${barberShop.id}`;
        const shopIframeCode = `<iframe src="${widgetShopUrl}" width="100%" height="720" style="border:0;border-radius:16px;overflow:hidden;" allow="microphone; autoplay" loading="lazy" title="${barberShop.shopName.replace(/"/g, '&quot;')}"></iframe>`;

        const handleCopyEmbed = async (field: 'direct' | 'widget' | 'code', val: string) => {
          try {
            await navigator.clipboard.writeText(val);
            setCopiedEmbedField(field);
            setTimeout(() => setCopiedEmbedField((c) => (c === field ? null : c)), 2000);
          } catch {
            // clipboard blocked
          }
        };

        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-2xl p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] flex items-center justify-center text-[var(--theme-accent)] shrink-0">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-extrabold text-[var(--theme-text)]">
                      {t.barberEmbedTitle}
                    </h2>
                    <p className="text-xs text-[var(--theme-muted)] mt-0.5">
                      {t.barberEmbedSubtitle}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEmbedModal(false)}
                  aria-label={t.closeBtn}
                  className="p-2 rounded-xl hover:bg-[var(--theme-surface-muted)] text-[var(--theme-muted)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Direct booking URL */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[var(--theme-text)]">
                  {t.barberDirectLinkLabel}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    dir="ltr"
                    value={directShopUrl}
                    className="flex-1 px-3 py-2.5 rounded-xl bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] text-xs font-mono-num text-[var(--theme-text)] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => void handleCopyEmbed('direct', directShopUrl)}
                    className="px-3.5 py-2.5 rounded-xl bg-[var(--theme-primary)] text-[var(--theme-primary-text)] text-xs font-bold inline-flex items-center gap-1.5 shrink-0 min-h-[38px]"
                  >
                    {copiedEmbedField === 'direct' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{t.payCopied}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{t.downloadCopyLinkBtn}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Widget URL */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[var(--theme-text)]">
                  {t.barberWidgetLinkLabel}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    dir="ltr"
                    value={widgetShopUrl}
                    className="flex-1 px-3 py-2.5 rounded-xl bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] text-xs font-mono-num text-[var(--theme-text)] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => void handleCopyEmbed('widget', widgetShopUrl)}
                    className="px-3.5 py-2.5 rounded-xl bg-[var(--theme-surface-muted)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border)] text-[var(--theme-text)] text-xs font-bold inline-flex items-center gap-1.5 shrink-0 min-h-[38px]"
                  >
                    {copiedEmbedField === 'widget' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{t.payCopied}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{t.downloadCopyLinkBtn}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* HTML Iframe Code */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--theme-text)]">
                    <Code2 className="w-4 h-4 text-[var(--theme-accent)]" />
                    <span>{t.downloadEmbedCodeLabel}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => void handleCopyEmbed('code', shopIframeCode)}
                    className="px-3 py-1.5 rounded-lg bg-[var(--theme-accent)] hover:bg-[var(--theme-accent-hover)] text-[var(--theme-accent-text)] text-xs font-bold inline-flex items-center gap-1.5"
                  >
                    {copiedEmbedField === 'code' ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>{t.payCopied}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{t.downloadCopyEmbedBtn}</span>
                      </>
                    )}
                  </button>
                </div>
                <pre
                  dir="ltr"
                  className="p-3 rounded-xl bg-black/90 text-emerald-300 text-[11px] font-mono-num overflow-x-auto leading-relaxed border border-white/10"
                >
                  {shopIframeCode}
                </pre>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--theme-border)]">
                <a
                  href={directShopUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--theme-accent)] hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{t.downloadWebOpenBtn}</span>
                </a>
                <button
                  type="button"
                  onClick={() => setShowEmbedModal(false)}
                  className="px-4 py-2 bg-[var(--theme-surface-muted)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border)] text-xs font-bold text-[var(--theme-text)] rounded-xl"
                >
                  {t.closeBtn}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
