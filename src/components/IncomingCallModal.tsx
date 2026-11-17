import React, { useEffect, useState } from 'react';
import {
  PhoneIncoming,
  CheckCircle2,
  ArrowLeftRight,
  VolumeX,
  MapPin,
  Phone,
  PhoneOff,
  MessageSquare,
} from 'lucide-react';
import type { PlatformSettings, QueueTicket, VoiceCall } from '../types';
import { useI18n } from '../i18n/I18nContext';
import { ringtoneController } from '../utils/audioAlert';

interface IncomingCallModalProps {
  ticket: QueueTicket;
  incomingVoiceCall?: VoiceCall | null;
  platformSettings?: PlatformSettings;
  allowVoiceCalls?: boolean;
  allowDeferTurn?: boolean;
  canDefer: boolean;
  isProcessing: boolean;
  onAnswerVoiceCall?: () => Promise<void>;
  onDeclineVoiceCall?: () => Promise<void>;
  onConfirmArrival: () => Promise<void>;
  onDeferTurn: () => Promise<void>;
  onMuteOnly: () => void;
}

export const IncomingCallModal: React.FC<IncomingCallModalProps> = ({
  ticket,
  incomingVoiceCall,
  platformSettings,
  allowVoiceCalls = true,
  allowDeferTurn = true,
  canDefer,
  isProcessing,
  onAnswerVoiceCall,
  onDeclineVoiceCall,
  onConfirmArrival,
  onDeferTurn,
  onMuteOnly,
}) => {
  const { dir, t, getLocalizedServiceName } = useI18n();
  const [isMuted, setIsMuted] = useState(false);
  const [answeringVoice, setAnsweringVoice] = useState(false);

  const hasRingingVoiceCall = Boolean(
    allowVoiceCalls && incomingVoiceCall && incomingVoiceCall.status === 'ringing'
  );

  useEffect(() => {
    ringtoneController.startRinging();
    return () => {
      ringtoneController.stopRinging();
    };
  }, [ticket.id, ticket.callCount, incomingVoiceCall?.id]);

  const handleMute = () => {
    ringtoneController.stopRinging();
    setIsMuted(true);
    onMuteOnly();
  };

  const handleAnswerVoice = async () => {
    if (!onAnswerVoiceCall) return;
    ringtoneController.stopRinging();
    setAnsweringVoice(true);
    try {
      await onAnswerVoiceCall();
    } finally {
      setAnsweringVoice(false);
    }
  };

  return (
    <div
      dir={dir}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="incoming-call-title"
    >
      <div className="max-w-md w-full bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-3xl p-7 text-center shadow-2xl">
        <div
          className={`w-16 h-16 rounded-2xl text-white flex items-center justify-center mx-auto mb-5 ${
            hasRingingVoiceCall ? 'bg-[#15803D]' : 'bg-[var(--theme-accent)]'
          }`}
        >
          <PhoneIncoming className="w-8 h-8" />
        </div>

        <p className="text-xs font-semibold text-[var(--theme-accent)] mb-1">
          {hasRingingVoiceCall ? t.callVoiceIncoming : t.callAutoAlert}
        </p>
        <h2
          id="incoming-call-title"
          className="font-display text-2xl font-extrabold text-[var(--theme-text)] mb-2"
        >
          {t.callYourTurnAt} {ticket.shopName}
        </h2>
        <p className="text-sm text-[var(--theme-muted)] mb-4">
          {t.callTicketHash}{' '}
          <span className="font-mono-num font-bold text-[var(--theme-text)]">
            #{ticket.ticketNumber}
          </span>
          {' · '}
          <span>{getLocalizedServiceName(ticket.serviceType, platformSettings)}</span>
        </p>

        {ticket.lastBarberMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-start flex items-start gap-2.5">
            <MessageSquare className="w-4 h-4 text-[var(--theme-accent)] shrink-0 mt-0.5" />
            <div className="text-xs text-amber-950 dark:text-amber-100 leading-relaxed">
              <span className="font-bold block mb-0.5">{t.callBarberMsg}</span>
              {ticket.lastBarberMessage}
            </div>
          </div>
        )}

        <div className="flex items-center justify-center gap-2 text-xs text-[var(--theme-muted)] bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] rounded-xl py-2.5 px-4 mb-6">
          <MapPin className="w-4 h-4 shrink-0 text-[var(--theme-accent)]" />
          <span className="truncate">{ticket.barberLocation}</span>
        </div>

        <div className="space-y-3">
          {hasRingingVoiceCall && onAnswerVoiceCall && (
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                disabled={isProcessing || answeringVoice}
                onClick={() => void handleAnswerVoice()}
                className="col-span-2 py-3.5 px-4 bg-[#15803D] hover:bg-[#166534] text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 min-h-[48px] disabled:opacity-50"
              >
                <Phone className="w-5 h-5 shrink-0" />
                <span>{answeringVoice ? t.callConnecting : t.callAnswerOnline}</span>
              </button>

              {onDeclineVoiceCall && (
                <button
                  type="button"
                  disabled={isProcessing || answeringVoice}
                  onClick={() => {
                    ringtoneController.stopRinging();
                    void onDeclineVoiceCall();
                  }}
                  className="py-3.5 px-3 bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-900/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 min-h-[48px]"
                >
                  <PhoneOff className="w-4 h-4 shrink-0" />
                  <span>{t.callDeclineVoice}</span>
                </button>
              )}
            </div>
          )}

          <button
            type="button"
            disabled={isProcessing}
            onClick={() => {
              ringtoneController.stopRinging();
              void onConfirmArrival();
            }}
            className="w-full py-3.5 px-5 bg-[var(--theme-accent)] hover:bg-[var(--theme-accent-hover)] text-[var(--theme-accent-text)] text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 min-h-[48px] disabled:opacity-50"
          >
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{t.custConfirmArrival}</span>
          </button>

          {allowDeferTurn && (
            <button
              type="button"
              disabled={isProcessing || !canDefer}
              onClick={() => {
                ringtoneController.stopRinging();
                void onDeferTurn();
              }}
              className="w-full py-3.5 px-5 bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-[var(--theme-primary-text)] text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 min-h-[48px] disabled:opacity-40"
            >
              <ArrowLeftRight className="w-5 h-5 shrink-0" />
              <span>{canDefer ? t.custDeferTurnBtn : t.custNoOneBehind}</span>
            </button>
          )}

          {!isMuted && (
            <button
              type="button"
              onClick={handleMute}
              className="w-full py-2.5 px-4 text-xs font-medium text-[var(--theme-muted)] hover:text-[var(--theme-text)] transition-colors flex items-center justify-center gap-1.5 min-h-[40px]"
            >
              <VolumeX className="w-4 h-4" />
              <span>{t.callMuteAndStay}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
