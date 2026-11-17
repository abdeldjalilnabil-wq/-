import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  collection,
  collectionGroup,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import {
  MapPin,
  Users,
  Clock,
  Scissors,
  Search,
  ArrowLeftRight,
  Bell,
  XCircle,
  CheckCircle2,
  X,
  PhoneIncoming,
  MessageSquare,
  MessageCircle,
  Send,
  AlertTriangle,
  Globe,
  ExternalLink,
  UserCog,
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  COMPLAINT_TYPE_PRESETS,
  DEFAULT_WHATSAPP_COUNTRY_CODE,
  QUICK_CUSTOMER_REPLIES,
  SERVICE_OPTIONS,
  VALIDATION_LIMITS,
  type BarberComplaint,
  type BarberShop,
  type PlatformSettings,
  type QueueSlot,
  type QueueTicket,
  type ServiceType,
  type TicketMessage,
  type UserProfile,
} from '../types';
import {
  bookCustomerSeat,
  cancelCustomerTicket,
  confirmCustomerArrival,
  deferCustomerTurn,
  sendTicketMessage,
  submitBarberComplaint,
  updateUserPersonalProfile,
  upsertUserProfile,
} from '../services/queueService';
import { useI18n } from '../i18n/I18nContext';
import { ALL_COUNTRIES, COUNTRY_STATES } from '../data/locations';
import {
  requestBrowserNotifications,
  ringtoneController,
  triggerTurnNotification,
} from '../utils/audioAlert';
import { normalizeSocialUrl } from '../utils/socialLinks';
import { buildWhatsAppUrl } from '../utils/whatsapp';
import { CountryFlag } from './CountryFlag';

interface CustomerPortalProps {
  user: User;
  userProfile: UserProfile | null;
  activeTicket: QueueTicket | null;
  activeBarberSlots: QueueSlot[];
  platformSettings: PlatformSettings;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({
  user,
  userProfile,
  activeTicket,
  activeBarberSlots,
  platformSettings,
}) => {
  const {
    t,
    getLocalizedCountryName,
    getLocalizedServiceName,
    getLocalizedStatusLabel,
    getLocalizedComplaintStatus,
  } = useI18n();

  const [barbers, setBarbers] = useState<BarberShop[]>([]);
  const [loadingBarbers, setLoadingBarbers] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('ALL');
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [directBarberId, setDirectBarberId] = useState<string>(() =>
    typeof window !== 'undefined'
      ? (new URLSearchParams(window.location.search).get('barber') || '').trim()
      : ''
  );

  // Booking drawer state
  const [selectedBarber, setSelectedBarber] = useState<BarberShop | null>(null);
  const [customerName, setCustomerName] = useState(
    userProfile?.displayName || user.displayName || ''
  );
  const [customerPhone, setCustomerPhone] = useState(userProfile?.phone || '');
  const [selectedService, setSelectedService] = useState<ServiceType>('haircut');
  const [bookingBusy, setBookingBusy] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Personal Profile Modal (Customer can ONLY edit their personal info + app color + language)
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileNameInput, setProfileNameInput] = useState(
    userProfile?.displayName || user.displayName || ''
  );
  const [profilePhoneInput, setProfilePhoneInput] = useState(userProfile?.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Complaint modal & submitted complaints tracker
  const [complaintTargetBarber, setComplaintTargetBarber] = useState<BarberShop | null>(null);
  const [complaintType, setComplaintType] = useState<string>(COMPLAINT_TYPE_PRESETS[0]);
  const [complaintDetails, setComplaintDetails] = useState('');
  const [complaintBusy, setComplaintBusy] = useState(false);
  const [myComplaints, setMyComplaints] = useState<BarberComplaint[]>([]);

  // Direct ticket messages state
  const [ticketMessages, setTicketMessages] = useState<TicketMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const lastBarberMsgIdRef = useRef<string>('');

  const [notifStatus, setNotifStatus] = useState<string>(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
    return Notification.permission;
  });

  const allowLocationFilter = platformSettings.allowLocationFilter !== false;
  const allowBarberSocials = platformSettings.allowBarberSocials !== false;
  const allowWhatsApp = platformSettings.allowWhatsApp !== false;
  const allowInAppMessages = platformSettings.allowInAppMessages !== false;
  const allowDeferTurn = platformSettings.allowDeferTurn !== false;
  const allowComplaints = platformSettings.allowComplaints !== false;

  useEffect(() => {
    if (userProfile?.displayName) {
      setCustomerName((prev) => prev || userProfile.displayName);
      setProfileNameInput(userProfile.displayName);
    }
    if (userProfile?.phone !== undefined) {
      setCustomerPhone((prev) => prev || userProfile.phone);
      setProfilePhoneInput(userProfile.phone);
    }
  }, [userProfile?.displayName, userProfile?.phone]);

  // Listen to all published barbershops
  useEffect(() => {
    const path = 'barbers';
    const q = query(collection(db, 'barbers'), where('isPublished', '==', true));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as BarberShop);
        list.sort((a, b) => Number(b.isOpen) - Number(a.isOpen));
        setBarbers(list);
        setLoadingBarbers(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
    return () => unsub();
  }, []);

  // Listen to real-time messages from barber on customer's active ticket
  useEffect(() => {
    if (!activeTicket || !allowInAppMessages) {
      setTicketMessages([]);
      lastBarberMsgIdRef.current = '';
      return;
    }
    const path = `barbers/${activeTicket.barberId}/queue/${activeTicket.id}/messages`;
    const q = query(
      collection(db, 'barbers', activeTicket.barberId, 'queue', activeTicket.id, 'messages'),
      where('customerUid', '==', user.uid)
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
        setTicketMessages(list);

        const latestBarberMsg = [...list]
          .reverse()
          .find((m) => m.senderRole === 'barber');
        if (latestBarberMsg && lastBarberMsgIdRef.current !== latestBarberMsg.id) {
          if (lastBarberMsgIdRef.current !== '') {
            ringtoneController.playSoftChime();
            triggerTurnNotification(
              activeTicket.shopName,
              activeTicket.ticketNumber,
              latestBarberMsg.text
            );
          }
          lastBarberMsgIdRef.current = latestBarberMsg.id;
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
    return () => unsub();
  }, [
    activeTicket?.id,
    activeTicket?.barberId,
    activeTicket?.shopName,
    activeTicket?.ticketNumber,
    allowInAppMessages,
    user.uid,
  ]);

  // Listen to customer's own submitted complaints
  useEffect(() => {
    const path = 'complaints';
    const q = query(
      collectionGroup(db, 'complaints'),
      where('customerUid', '==', user.uid)
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
        setMyComplaints(list);
      },
      (error) => {
        console.warn(`Customer complaints listener (${path}):`, error.message);
      }
    );
    return () => unsub();
  }, [user.uid]);

  const availableFilterStates = useMemo(() => {
    if (selectedCountry === 'ALL') return [];
    const presetStates = COUNTRY_STATES[selectedCountry] || [];
    const dynamicStates = barbers
      .filter((b) => (b.countryCode || 'DZ').toUpperCase() === selectedCountry && b.stateName)
      .map((b) => b.stateName as string);
    return Array.from(new Set([...presetStates, ...dynamicStates]));
  }, [selectedCountry, barbers]);

  const hasDirectBarberMatch = useMemo(
    () =>
      Boolean(
        directBarberId &&
          barbers.some(
            (b) =>
              b.id === directBarberId &&
              (b.subscriptionStatus !== 'suspended' || activeTicket?.barberId === b.id)
          )
      ),
    [directBarberId, barbers, activeTicket?.barberId]
  );

  const filteredBarbers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return barbers.filter((b) => {
      if (b.subscriptionStatus === 'suspended' && activeTicket?.barberId !== b.id) {
        return false;
      }
      if (hasDirectBarberMatch) {
        return b.id === directBarberId;
      }
      if (allowLocationFilter) {
        const barberCountry = (b.countryCode || 'DZ').toUpperCase();
        if (selectedCountry !== 'ALL' && barberCountry !== selectedCountry) {
          return false;
        }
        if (
          selectedState !== 'ALL' &&
          (b.stateName || '').trim().toLowerCase() !== selectedState.trim().toLowerCase()
        ) {
          return false;
        }
      }
      if (!q) return true;
      return (
        b.shopName.toLowerCase().includes(q) ||
        b.barberName.toLowerCase().includes(q) ||
        b.location.toLowerCase().includes(q) ||
        (b.stateName || '').toLowerCase().includes(q) ||
        (b.countryName || '').toLowerCase().includes(q)
      );
    });
  }, [
    barbers,
    searchTerm,
    selectedCountry,
    selectedState,
    activeTicket?.barberId,
    allowLocationFilter,
    hasDirectBarberMatch,
    directBarberId,
  ]);

  const activeTicketBarber = useMemo(
    () => (activeTicket ? barbers.find((b) => b.id === activeTicket.barberId) : undefined),
    [activeTicket, barbers]
  );

  const peopleAheadCount = useMemo(() => {
    if (!activeTicket) return 0;
    if (activeTicket.status === 'called' || activeTicket.status === 'in_chair') return 0;
    return activeBarberSlots.filter(
      (s) =>
        (s.status === 'waiting' || s.status === 'called') &&
        s.ticketId !== activeTicket.id &&
        s.queueOrder < activeTicket.queueOrder
    ).length;
  }, [activeTicket, activeBarberSlots]);

  const canDeferTurn = useMemo(() => {
    if (!activeTicket) return false;
    if (activeTicket.status !== 'waiting' && activeTicket.status !== 'called') return false;
    return activeBarberSlots.some(
      (s) =>
        s.status === 'waiting' &&
        s.ticketId !== activeTicket.id &&
        (activeTicket.status === 'called' || s.queueOrder > activeTicket.queueOrder)
    );
  }, [activeTicket, activeBarberSlots]);

  const handleEnableNotifications = async () => {
    const res = await requestBrowserNotifications();
    setNotifStatus(res);
  };

  const handleSavePersonalProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setFeedback(null);
    try {
      await updateUserPersonalProfile({
        uid: user.uid,
        displayName: profileNameInput,
        phone: profilePhoneInput,
      });
      setCustomerName(profileNameInput.trim());
      setCustomerPhone(profilePhoneInput.trim());
      setFeedback({
        type: 'success',
        text: t.custSaveProfile,
      });
      setShowProfileModal(false);
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'تعذر حفظ الملف الشخصي.',
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBarber) return;
    setFeedback(null);
    setBookingBusy(true);

    try {
      const { ticketNumber } = await bookCustomerSeat({
        barberId: selectedBarber.id,
        customerUid: user.uid,
        customerName,
        customerPhone,
        serviceType: selectedService,
      });

      await upsertUserProfile({
        uid: user.uid,
        displayName: customerName.trim(),
        phone: customerPhone.trim(),
        accountMode: 'customer',
        barberId: userProfile?.barberId,
      });

      setFeedback({
        type: 'success',
        text: `${selectedBarber.shopName} (#${ticketNumber})`,
      });
      setSelectedBarber(null);
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'تعذر إتمام الحجز.',
      });
    } finally {
      setBookingBusy(false);
    }
  };

  const handleSendCustomerReply = async (textToSend: string) => {
    if (!activeTicket || !textToSend.trim()) return;
    setSendingReply(true);
    setFeedback(null);
    try {
      await sendTicketMessage({
        ticket: activeTicket,
        senderUid: user.uid,
        senderRole: 'customer',
        senderName: activeTicket.customerName,
        text: textToSend,
      });
      setReplyText('');
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'تعذر إرسال الرد.',
      });
    } finally {
      setSendingReply(false);
    }
  };

  const handleDefer = async () => {
    if (!activeTicket) return;
    setActionBusy(true);
    setFeedback(null);
    try {
      await deferCustomerTurn({
        ticket: activeTicket,
        slots: activeBarberSlots,
        barber: activeTicketBarber,
      });
      setFeedback({
        type: 'success',
        text: t.custDeferTurnBtn,
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'تعذر تقديم زبون قبلك.',
      });
    } finally {
      setActionBusy(false);
    }
  };

  const handleConfirmArrival = async () => {
    if (!activeTicket) return;
    setActionBusy(true);
    setFeedback(null);
    try {
      await confirmCustomerArrival({
        ticket: activeTicket,
        barber: activeTicketBarber,
      });
      setFeedback({
        type: 'success',
        text: t.custConfirmArrival,
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'تعذر تأكيد الحضور.',
      });
    } finally {
      setActionBusy(false);
    }
  };

  const handleCancelTicket = async () => {
    if (!activeTicket) return;
    setActionBusy(true);
    setFeedback(null);
    try {
      await cancelCustomerTicket({
        ticket: activeTicket,
        barber: activeTicketBarber,
      });
      setFeedback({
        type: 'success',
        text: t.custCancelBooking,
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'تعذر إلغاء الحجز.',
      });
    } finally {
      setActionBusy(false);
    }
  };

  const handleOpenComplaintModal = (barber: BarberShop) => {
    setComplaintTargetBarber(barber);
    setComplaintType(COMPLAINT_TYPE_PRESETS[0]);
    setComplaintDetails('');
  };

  const handleComplaintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintTargetBarber) return;
    setComplaintBusy(true);
    setFeedback(null);
    try {
      await submitBarberComplaint({
        barber: complaintTargetBarber,
        customerUid: user.uid,
        customerName:
          customerName.trim() ||
          userProfile?.displayName ||
          user.displayName ||
          'Customer',
        complaintType,
        details: complaintDetails,
      });
      setFeedback({
        type: 'success',
        text: `${t.custSendComplaint} (${complaintTargetBarber.shopName})`,
      });
      setComplaintTargetBarber(null);
      setComplaintDetails('');
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'تعذر إرسال الشكوى.',
      });
    } finally {
      setComplaintBusy(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-sm flex items-center justify-between gap-3 ${
            feedback.type === 'error'
              ? 'bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800 text-red-700 dark:text-red-200'
              : 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
          }`}
        >
          <span>{feedback.text}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Active Ticket Tracker */}
      {activeTicket && (
        <section className="bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-bold text-[var(--theme-accent)]">
                  {getLocalizedStatusLabel(activeTicket.status)}
                </span>
                <span aria-hidden="true">·</span>
                <span className="text-[var(--theme-muted)]">
                  {getLocalizedServiceName(activeTicket.serviceType, platformSettings)}
                </span>
                {activeTicket.deferCount > 0 && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-amber-700 dark:text-amber-300 font-medium">
                      {t.custDeferredCount} ({activeTicket.deferCount})
                    </span>
                  </>
                )}
              </div>

              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[var(--theme-text)]">
                {t.custTicketNumber}{' '}
                <span className="font-mono-num text-[var(--theme-accent)]">
                  #{activeTicket.ticketNumber}
                </span>{' '}
                — {activeTicket.shopName}
              </h2>

              <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--theme-muted)]">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[var(--theme-accent)]" />
                  {activeTicket.barberLocation}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono-num" dir="ltr">
                  {activeTicket.customerPhone}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="px-5 py-3.5 rounded-2xl bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] text-center min-w-[140px]">
                <div className="text-xs text-[var(--theme-muted)] mb-1">{t.custPeopleBeforeYou}</div>
                <div className="font-mono-num text-3xl font-extrabold text-[var(--theme-text)]">
                  {peopleAheadCount}
                </div>
              </div>

              <div className="px-5 py-3.5 rounded-2xl bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] text-center min-w-[140px]">
                <div className="text-xs text-[var(--theme-muted)] mb-1">{t.custApproxWait}</div>
                <div className="font-mono-num text-3xl font-extrabold text-[var(--theme-text)]">
                  {peopleAheadCount * (activeTicketBarber?.avgMinutesPerClient || 20)} {t.custMinUnit}
                </div>
              </div>
            </div>
          </div>

          {allowInAppMessages &&
            (activeTicket.lastBarberMessage || ticketMessages.length > 0) && (
              <div className="p-4 sm:p-5 rounded-2xl bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[var(--theme-text)]">
                    <MessageSquare className="w-4 h-4 text-[var(--theme-accent)]" />
                    <span>{t.custDirectMessages}</span>
                  </div>
                  {allowWhatsApp && activeTicketBarber?.barberPhone && (
                    <a
                      href={buildWhatsAppUrl({
                        phone: activeTicketBarber.barberPhone,
                        countryCode:
                          activeTicketBarber.whatsappCountryCode || DEFAULT_WHATSAPP_COUNTRY_CODE,
                        message: `${activeTicket.customerName} #${activeTicket.ticketNumber}`,
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{t.custWhatsAppShop}</span>
                    </a>
                  )}
                </div>

                {ticketMessages.length > 0 ? (
                  <div className="space-y-2 max-h-44 overflow-y-auto">
                    {ticketMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-3 rounded-xl text-xs leading-relaxed ${
                          msg.senderRole === 'barber'
                            ? 'bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-100 font-semibold'
                            : 'bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-text)]'
                        }`}
                      >
                        <span className="font-bold me-1.5">
                          {msg.senderRole === 'barber' ? `${activeTicket.shopName}:` : t.custYou}
                        </span>
                        <span>{msg.text}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  activeTicket.lastBarberMessage && (
                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-xs font-semibold text-amber-950 dark:text-amber-100">
                      {activeTicket.lastBarberMessage}
                    </div>
                  )
                )}

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {QUICK_CUSTOMER_REPLIES.map((q) => (
                    <button
                      key={q}
                      type="button"
                      disabled={sendingReply}
                      onClick={() => void handleSendCustomerReply(q)}
                      className="px-3 py-1.5 bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border)] rounded-xl text-xs font-medium text-[var(--theme-text)] transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    maxLength={VALIDATION_LIMITS.MESSAGE_MAX}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={t.custReplyPlaceholder}
                    className="flex-1 px-3.5 py-2 bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-xl text-xs text-[var(--theme-text)] focus:outline-none focus:border-[var(--theme-accent)]"
                  />
                  <button
                    type="button"
                    disabled={sendingReply || !replyText.trim()}
                    onClick={() => void handleSendCustomerReply(replyText)}
                    className="px-4 py-2 bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-[var(--theme-primary-text)] text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 min-h-[38px] disabled:opacity-40"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{t.custReplyBtn}</span>
                  </button>
                </div>
              </div>
            )}

          <div className="pt-4 border-t border-[var(--theme-border)] flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              {activeTicket.status === 'called' && (
                <button
                  type="button"
                  disabled={actionBusy}
                  onClick={() => void handleConfirmArrival()}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-[#15803D] text-white text-sm font-bold rounded-xl hover:bg-[#166534] transition-colors min-h-[44px]"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t.custConfirmArrival}</span>
                </button>
              )}

              {allowDeferTurn &&
                (activeTicket.status === 'waiting' || activeTicket.status === 'called') && (
                  <button
                    type="button"
                    disabled={actionBusy || !canDeferTurn}
                    onClick={() => void handleDefer()}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-[var(--theme-primary)] text-[var(--theme-primary-text)] text-sm font-bold rounded-xl hover:bg-[var(--theme-primary-hover)] transition-colors disabled:opacity-40 min-h-[44px]"
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                    <span>{canDeferTurn ? t.custDeferTurnBtn : t.custNoOneBehind}</span>
                  </button>
                )}

              {notifStatus === 'default' && (
                <button
                  type="button"
                  onClick={() => void handleEnableNotifications()}
                  className="inline-flex items-center gap-2 px-4 py-3 bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] text-[var(--theme-text)] text-xs font-semibold rounded-xl hover:bg-[var(--theme-surface-hover)] transition-colors min-h-[44px]"
                >
                  <Bell className="w-4 h-4 text-[var(--theme-accent)]" />
                  <span>{t.custEnableNotifs}</span>
                </button>
              )}
            </div>

            {activeTicket.status !== 'in_chair' && (
              <button
                type="button"
                disabled={actionBusy}
                onClick={() => void handleCancelTicket()}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-xl transition-colors min-h-[40px]"
              >
                <XCircle className="w-4 h-4" />
                <span>{t.custCancelBooking}</span>
              </button>
            )}
          </div>

          {activeTicket.status === 'called' && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-center gap-3 text-sm text-amber-900 dark:text-amber-100">
              <PhoneIncoming className="w-5 h-5 text-[var(--theme-accent)] shrink-0" />
              <span>
                {allowDeferTurn ? t.custBarberCallingBanner : t.custBarberCallingNoDefer}
              </span>
            </div>
          )}
        </section>
      )}

      {/* Barbers Directory Header, Personal Profile Button, Country/Wilaya Filter & Search */}
      <section className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[var(--theme-text)]">
              {t.custChooseBarber}
            </h1>
            <p className="text-sm text-[var(--theme-muted)] mt-1">
              {allowLocationFilter ? t.custSubtitleFilter : t.custSubtitleNoFilter}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-72 min-w-[200px]">
              <Search className="w-4 h-4 text-[var(--theme-muted)] absolute start-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t.custSearchPlaceholder}
                className="w-full ps-10 pe-4 py-2.5 bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-xl text-sm text-[var(--theme-text)] focus:outline-none focus:border-[var(--theme-accent)]"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setProfileNameInput(userProfile?.displayName || user.displayName || '');
                setProfilePhoneInput(userProfile?.phone || '');
                setShowProfileModal(true);
              }}
              className="px-4 py-2.5 bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border)] rounded-xl text-xs font-bold text-[var(--theme-text)] inline-flex items-center gap-2 whitespace-nowrap min-h-[42px]"
            >
              <UserCog className="w-4 h-4 text-[var(--theme-accent)]" />
              <span>{t.custMyProfile}</span>
            </button>
          </div>
        </div>

        {/* Country & Wilaya Selector Bar with Live Country Flag Image */}
        {allowLocationFilter && (
          <div className="bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-2xl p-4 sm:p-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-5 flex items-center gap-3">
              {selectedCountry !== 'ALL' ? (
                <CountryFlag countryCode={selectedCountry} size="md" />
              ) : (
                <div className="w-8 h-5 rounded-sm bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] flex items-center justify-center shrink-0">
                  <Globe className="w-3.5 h-3.5 text-[var(--theme-accent)]" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <label
                  htmlFor="filterCountry"
                  className="block text-[11px] font-semibold text-[var(--theme-muted)] mb-1"
                >
                  {t.custCountrySelected}{' '}
                  {selectedCountry !== 'ALL' ? `— ${getLocalizedCountryName(selectedCountry)}` : ''}
                </label>
                <select
                  id="filterCountry"
                  value={selectedCountry}
                  onChange={(e) => {
                    setSelectedCountry(e.target.value);
                    setSelectedState('ALL');
                  }}
                  className="w-full px-3.5 py-2 bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] rounded-xl text-sm text-[var(--theme-text)] focus:outline-none focus:border-[var(--theme-accent)]"
                >
                  <option value="ALL">{t.custAllCountries}</option>
                  {ALL_COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {getLocalizedCountryName(c.code, c.nameAr)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="md:col-span-5">
              <label
                htmlFor="filterState"
                className="block text-[11px] font-semibold text-[var(--theme-muted)] mb-1"
              >
                {t.custStateLabel}
              </label>
              <select
                id="filterState"
                disabled={selectedCountry === 'ALL' || availableFilterStates.length === 0}
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full px-3.5 py-2 bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] rounded-xl text-sm text-[var(--theme-text)] focus:outline-none focus:border-[var(--theme-accent)] disabled:opacity-50"
              >
                <option value="ALL">
                  {selectedCountry === 'ALL'
                    ? t.custSelectCountryFirst
                    : availableFilterStates.length === 0
                      ? t.custAllRegionsInCountry
                      : t.custAllStates}
                </option>
                {availableFilterStates.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 flex items-end justify-end">
              {(selectedCountry !== 'ALL' || selectedState !== 'ALL' || searchTerm) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCountry('ALL');
                    setSelectedState('ALL');
                    setSearchTerm('');
                  }}
                  className="w-full py-2.5 px-3 bg-[var(--theme-surface-muted)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border)] text-xs font-semibold text-[var(--theme-text)] rounded-xl transition-colors"
                >
                  {t.custShowAll}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Direct Website Shop Deep-Link Notice */}
        {hasDirectBarberMatch && (
          <div className="bg-[var(--theme-surface)] border border-[var(--theme-accent)]/40 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-[var(--theme-text)]">
              <Globe className="w-4 h-4 text-[var(--theme-accent)] shrink-0" />
              <span>{t.custDirectShopFilterNote}</span>
            </div>
            <button
              type="button"
              onClick={() => setDirectBarberId('')}
              className="px-4 py-2 bg-[var(--theme-surface-muted)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border)] text-xs font-bold text-[var(--theme-text)] rounded-xl transition-colors"
            >
              {t.custShowAllShops}
            </button>
          </div>
        )}

        {loadingBarbers ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((idx) => (
              <div
                key={idx}
                className="h-64 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] animate-pulse"
              />
            ))}
          </div>
        ) : filteredBarbers.length === 0 ? (
          <div className="bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-2xl p-12 text-center">
            <Scissors className="w-10 h-10 text-[var(--theme-muted)] opacity-50 mx-auto mb-3" />
            <h3 className="font-display text-lg font-bold text-[var(--theme-text)] mb-1">
              {t.custNoBarbersTitle}
            </h3>
            <p className="text-sm text-[var(--theme-muted)]">
              {searchTerm || selectedCountry !== 'ALL' || selectedState !== 'ALL'
                ? t.custNoBarbersDescFiltered
                : t.custNoBarbersDescEmpty}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBarbers.map((barber) => {
              const estWait = barber.waitingCount * (barber.avgMinutesPerClient || 20);
              const isAlreadyBookedHere = activeTicket?.barberId === barber.id;
              const isoCode = (barber.countryCode || 'DZ').toUpperCase();
              const countryLabel = getLocalizedCountryName(isoCode, barber.countryName);
              const fbLink = allowBarberSocials
                ? normalizeSocialUrl(barber.facebookUrl, 'facebook')
                : '';
              const ttLink = allowBarberSocials
                ? normalizeSocialUrl(barber.tiktokUrl, 'tiktok')
                : '';
              const igLink = allowBarberSocials
                ? normalizeSocialUrl(barber.instagramUrl, 'instagram')
                : '';

              return (
                <article
                  key={barber.id}
                  className="bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-2xl p-6 flex flex-col justify-between gap-5"
                >
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden border border-[var(--theme-border)] bg-[var(--theme-surface-muted)] shrink-0">
                        {barber.avatarUrl ? (
                          <img
                            src={barber.avatarUrl}
                            alt={barber.shopName}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[var(--theme-accent)]">
                            <Scissors className="w-6 h-6" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-display text-lg font-extrabold text-[var(--theme-text)] truncate">
                            {barber.shopName}
                          </h3>
                          <CountryFlag countryCode={isoCode} size="sm" />
                        </div>
                        <p className="text-sm text-[var(--theme-muted)] truncate">
                          {barber.barberName}
                        </p>
                        <p
                          className={`text-xs font-semibold mt-1 ${
                            barber.isOpen
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-red-700 dark:text-red-400'
                          }`}
                        >
                          {barber.isOpen ? t.custShopOpen : t.custShopClosed}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-[var(--theme-muted)] pt-3 border-t border-[var(--theme-border)]">
                      <div className="flex items-center gap-2 font-semibold text-[var(--theme-text)]">
                        <CountryFlag countryCode={isoCode} size="sm" />
                        <span>
                          {countryLabel}
                          {barber.stateName ? ` — ${barber.stateName}` : ''}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-[var(--theme-accent)] shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{barber.location}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="p-3 rounded-xl bg-[var(--theme-surface-muted)] border border-[var(--theme-border)]">
                        <div className="flex items-center gap-1.5 text-[11px] text-[var(--theme-muted)] mb-1">
                          <Users className="w-3.5 h-3.5 text-[var(--theme-accent)]" />
                          <span>{t.custPeopleAhead}</span>
                        </div>
                        <div className="font-mono-num text-xl font-extrabold text-[var(--theme-text)]">
                          {barber.waitingCount}
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-[var(--theme-surface-muted)] border border-[var(--theme-border)]">
                        <div className="flex items-center gap-1.5 text-[11px] text-[var(--theme-muted)] mb-1">
                          <Clock className="w-3.5 h-3.5 text-[var(--theme-accent)]" />
                          <span>{t.custEstWait}</span>
                        </div>
                        <div className="font-mono-num text-xl font-extrabold text-[var(--theme-text)]">
                          {estWait} {t.custMinUnit}
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-[var(--theme-muted)] leading-relaxed">
                      <span className="font-semibold text-[var(--theme-text)]">{t.custServicesLabel} </span>
                      {barber.services
                        .map((s) => getLocalizedServiceName(s, platformSettings))
                        .join(' · ')}
                    </div>

                    {(fbLink || ttLink || igLink) && (
                      <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
                        {fbLink && (
                          <a
                            href={fbLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[var(--theme-text)] hover:text-[var(--theme-accent)] font-semibold"
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
                            className="inline-flex items-center gap-1 text-[var(--theme-text)] hover:text-[var(--theme-accent)] font-semibold"
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
                            className="inline-flex items-center gap-1 text-[var(--theme-text)] hover:text-[var(--theme-accent)] font-semibold"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Instagram</span>
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <button
                      type="button"
                      disabled={!barber.isOpen || Boolean(activeTicket)}
                      onClick={() => {
                        setSelectedService(barber.services[0] || 'haircut');
                        setSelectedBarber(barber);
                      }}
                      className={`w-full py-3 px-4 text-sm font-bold rounded-xl transition-colors min-h-[44px] ${
                        isAlreadyBookedHere
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                          : 'bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-[var(--theme-primary-text)] disabled:opacity-40'
                      }`}
                    >
                      {isAlreadyBookedHere
                        ? `${t.custAlreadyBooked} (#${activeTicket.ticketNumber})`
                        : activeTicket
                          ? t.custHasActiveTicket
                          : barber.isOpen
                            ? t.custBookSeat
                            : t.custShopClosed}
                    </button>

                    {(allowWhatsApp && barber.barberPhone) || allowComplaints ? (
                      <div className="flex items-center gap-2">
                        {allowWhatsApp && barber.barberPhone && (
                          <a
                            href={buildWhatsAppUrl({
                              phone: barber.barberPhone,
                              countryCode:
                                barber.whatsappCountryCode || DEFAULT_WHATSAPP_COUNTRY_CODE,
                              message: `${barber.shopName}`,
                            })}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-2 px-3 bg-[var(--theme-surface-muted)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border)] text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 min-h-[38px]"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>{t.custWhatsApp}</span>
                          </a>
                        )}

                        {allowComplaints && (
                          <button
                            type="button"
                            onClick={() => handleOpenComplaintModal(barber)}
                            className="flex-1 py-2 px-3 bg-[var(--theme-surface)] hover:bg-red-50 dark:hover:bg-red-950/40 border border-[var(--theme-border)] hover:border-red-300 dark:hover:border-red-700 text-red-700 dark:text-red-400 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 min-h-[38px]"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>{t.custFileComplaint}</span>
                          </button>
                        )}
                      </div>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Customer Submitted Complaints Tracker */}
      {allowComplaints && myComplaints.length > 0 && (
        <section className="bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-[var(--theme-border)]">
            <h2 className="font-display text-lg font-extrabold text-[var(--theme-text)]">
              {t.custMyComplaints}
            </h2>
            <p className="text-xs text-[var(--theme-muted)] mt-0.5">
              {t.custComplaintsHint}
            </p>
          </div>
          <div className="divide-y divide-[var(--theme-border)]">
            {myComplaints.map((cmp) => (
              <div
                key={cmp.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-bold text-[var(--theme-text)]">{cmp.shopName}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-semibold text-red-700 dark:text-red-400">
                      {cmp.complaintType}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--theme-muted)] leading-relaxed">
                    {cmp.details}
                  </p>
                </div>
                <span
                  className={`text-xs font-bold whitespace-nowrap ${
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
            ))}
          </div>
        </section>
      )}

      {/* Personal Profile Modal */}
      {showProfileModal && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full sm:max-w-md bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-t-3xl sm:rounded-3xl p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-[var(--theme-border)]">
              <div>
                <p className="text-xs font-semibold text-[var(--theme-accent)]">{t.custMyProfile}</p>
                <h2 className="font-display text-xl font-extrabold text-[var(--theme-text)] mt-0.5">
                  {t.custEditProfileTitle}
                </h2>
                <p className="text-xs text-[var(--theme-muted)] mt-1">
                  {t.custEditProfileSub}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="p-2 rounded-xl hover:bg-[var(--theme-surface-muted)] text-[var(--theme-muted)] min-h-[40px] min-w-[40px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => void handleSavePersonalProfile(e)} className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="profileNameInput"
                  className="block text-sm font-semibold text-[var(--theme-text)] mb-1.5"
                >
                  {t.custFullName}
                </label>
                <input
                  id="profileNameInput"
                  type="text"
                  required
                  minLength={2}
                  maxLength={VALIDATION_LIMITS.DISPLAY_NAME_MAX}
                  value={profileNameInput}
                  onChange={(e) => setProfileNameInput(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] rounded-xl text-sm text-[var(--theme-text)] focus:outline-none focus:border-[var(--theme-accent)]"
                />
              </div>

              <div>
                <label
                  htmlFor="profilePhoneInput"
                  className="block text-sm font-semibold text-[var(--theme-text)] mb-1.5"
                >
                  {t.custPhoneLabel}
                </label>
                <input
                  id="profilePhoneInput"
                  type="tel"
                  dir="ltr"
                  maxLength={VALIDATION_LIMITS.PHONE_MAX}
                  value={profilePhoneInput}
                  onChange={(e) => setProfilePhoneInput(e.target.value)}
                  placeholder="05XXXXXXXX"
                  className="w-full px-4 py-2.5 bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] rounded-xl text-sm text-[var(--theme-text)] font-mono-num text-start focus:outline-none focus:border-[var(--theme-accent)]"
                />
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="w-full py-3.5 px-6 bg-[var(--theme-accent)] hover:bg-[var(--theme-accent-hover)] text-[var(--theme-accent-text)] text-sm font-bold rounded-xl transition-colors min-h-[46px] disabled:opacity-50"
              >
                {savingProfile ? t.custSaving : t.custSaveProfile}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {selectedBarber && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full sm:max-w-lg bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-[var(--theme-border)]">
              <div>
                <p className="text-xs font-semibold text-[var(--theme-accent)]">{t.custNewBooking}</p>
                <h2 className="font-display text-xl font-extrabold text-[var(--theme-text)] mt-0.5">
                  {selectedBarber.shopName}
                </h2>
                <p className="text-xs text-[var(--theme-muted)] mt-1">
                  {selectedBarber.barberName} · {selectedBarber.location} ·{' '}
                  <span className="font-mono-num font-bold text-[var(--theme-text)]">
                    {selectedBarber.waitingCount}
                  </span>{' '}
                  {t.custWaitingRemaining}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBarber(null)}
                className="p-2 rounded-xl hover:bg-[var(--theme-surface-muted)] text-[var(--theme-muted)] min-h-[40px] min-w-[40px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => void handleBookSubmit(e)} className="mt-5 space-y-5">
              <div>
                <label
                  htmlFor="custName"
                  className="block text-sm font-semibold text-[var(--theme-text)] mb-1.5"
                >
                  {t.custFullName}
                </label>
                <input
                  id="custName"
                  type="text"
                  required
                  minLength={VALIDATION_LIMITS.CUSTOMER_NAME_MIN}
                  maxLength={VALIDATION_LIMITS.CUSTOMER_NAME_MAX}
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] rounded-xl text-sm text-[var(--theme-text)] focus:outline-none focus:border-[var(--theme-accent)]"
                />
              </div>

              <div>
                <label
                  htmlFor="custPhone"
                  className="block text-sm font-semibold text-[var(--theme-text)] mb-1.5"
                >
                  {t.custPhoneLabel}
                </label>
                <input
                  id="custPhone"
                  type="tel"
                  dir="ltr"
                  required
                  minLength={VALIDATION_LIMITS.PHONE_MIN}
                  maxLength={VALIDATION_LIMITS.PHONE_MAX}
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="05XXXXXXXX"
                  className="w-full px-4 py-2.5 bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] rounded-xl text-sm text-[var(--theme-text)] font-mono-num text-start focus:outline-none focus:border-[var(--theme-accent)]"
                />
              </div>

              <div>
                <p className="text-sm font-semibold text-[var(--theme-text)] mb-2.5">
                  {t.custChooseService}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {SERVICE_OPTIONS.filter((opt) =>
                    selectedBarber.services.includes(opt.id)
                  ).map((opt) => {
                    const active = selectedService === opt.id;
                    const effectiveLabel = getLocalizedServiceName(opt.id, platformSettings);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedService(opt.id)}
                        className={`p-3.5 rounded-xl border text-start transition-colors min-h-[56px] ${
                          active
                            ? 'border-[var(--theme-accent)] bg-[var(--theme-accent)] text-[var(--theme-accent-text)]'
                            : 'border-[var(--theme-border)] bg-[var(--theme-surface-muted)] text-[var(--theme-text)] hover:border-[var(--theme-accent)]'
                        }`}
                      >
                        <div className="text-sm font-bold">{effectiveLabel}</div>
                        <div
                          className={`text-xs mt-0.5 ${
                            active ? 'opacity-85' : 'text-[var(--theme-muted)]'
                          }`}
                        >
                          {opt.durationMins} {t.custMinUnit}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={bookingBusy}
                className="w-full py-3.5 px-6 bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-[var(--theme-primary-text)] text-sm font-bold rounded-xl transition-colors min-h-[48px] disabled:opacity-50"
              >
                {bookingBusy ? t.custBookingBusy : t.custConfirmBooking}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Customer Complaint Modal */}
      {allowComplaints && complaintTargetBarber && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full sm:max-w-lg bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-[var(--theme-border)]">
              <div>
                <p className="text-xs font-semibold text-red-700 dark:text-red-400">
                  {t.custComplaintModalTitle}
                </p>
                <h2 className="font-display text-xl font-extrabold text-[var(--theme-text)] mt-0.5">
                  {complaintTargetBarber.shopName}
                </h2>
                <p className="text-xs text-[var(--theme-muted)] mt-1">
                  {complaintTargetBarber.barberName} — {t.custComplaintModalSub}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setComplaintTargetBarber(null)}
                className="p-2 rounded-xl hover:bg-[var(--theme-surface-muted)] text-[var(--theme-muted)] min-h-[40px] min-w-[40px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => void handleComplaintSubmit(e)} className="mt-5 space-y-5">
              <div>
                <p className="text-xs font-semibold text-[var(--theme-muted)] mb-2">
                  {t.custComplaintQuickPick}
                </p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {COMPLAINT_TYPE_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setComplaintType(preset)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
                        complaintType === preset
                          ? 'bg-red-700 border-red-700 text-white'
                          : 'bg-[var(--theme-surface-muted)] border-[var(--theme-border)] text-[var(--theme-text)] hover:border-red-300'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                <label
                  htmlFor="complaintTypeInput"
                  className="block text-sm font-semibold text-[var(--theme-text)] mb-1.5"
                >
                  {t.custComplaintType}
                </label>
                <input
                  id="complaintTypeInput"
                  type="text"
                  required
                  minLength={VALIDATION_LIMITS.COMPLAINT_TYPE_MIN}
                  maxLength={VALIDATION_LIMITS.COMPLAINT_TYPE_MAX}
                  value={complaintType}
                  onChange={(e) => setComplaintType(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] rounded-xl text-sm text-[var(--theme-text)] focus:outline-none focus:border-[var(--theme-accent)]"
                />
              </div>

              <div>
                <label
                  htmlFor="complaintDetailsInput"
                  className="block text-sm font-semibold text-[var(--theme-text)] mb-1.5"
                >
                  {t.custComplaintDetails}
                </label>
                <textarea
                  id="complaintDetailsInput"
                  rows={4}
                  required
                  minLength={VALIDATION_LIMITS.COMPLAINT_DETAILS_MIN}
                  maxLength={VALIDATION_LIMITS.COMPLAINT_DETAILS_MAX}
                  value={complaintDetails}
                  onChange={(e) => setComplaintDetails(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] rounded-xl text-sm text-[var(--theme-text)] focus:outline-none focus:border-[var(--theme-accent)]"
                />
              </div>

              <button
                type="submit"
                disabled={complaintBusy}
                className="w-full py-3.5 px-6 bg-red-700 hover:bg-red-800 text-white text-sm font-bold rounded-xl transition-colors min-h-[48px] disabled:opacity-50"
              >
                {complaintBusy ? t.custSendingComplaint : t.custSendComplaint}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
