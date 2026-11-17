import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, PhoneOff, PhoneCall, Volume2 } from 'lucide-react';
import type { VoiceCallStatus } from '../types';
import { useI18n } from '../i18n/I18nContext';

interface ActiveVoiceCallOverlayProps {
  peerName: string;
  subtitle: string;
  status: VoiceCallStatus;
  remoteStream: MediaStream | null;
  isMuted: boolean;
  onToggleMute: () => void;
  onEndCall: () => Promise<void>;
}

export const ActiveVoiceCallOverlay: React.FC<ActiveVoiceCallOverlayProps> = ({
  peerName,
  subtitle,
  status,
  remoteStream,
  isMuted,
  onToggleMute,
  onEndCall,
}) => {
  const { dir, t } = useI18n();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl || !remoteStream) return;
    audioEl.srcObject = remoteStream;
    void audioEl.play().catch((err) => {
      console.warn('Audio autoplay deferred:', err);
    });
  }, [remoteStream]);

  useEffect(() => {
    if (status !== 'connected') {
      setElapsedSeconds(0);
      return;
    }
    const timer = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [status]);

  const mins = String(Math.floor(elapsedSeconds / 60)).padStart(2, '0');
  const secs = String(elapsedSeconds % 60).padStart(2, '0');

  return (
    <div
      dir={dir}
      className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:w-96 z-50 bg-[#141518] text-white border border-[var(--theme-border)] rounded-2xl p-5 shadow-2xl"
      role="region"
      aria-label={t.callVoiceIncoming}
    >
      <audio ref={audioRef} autoPlay playsInline className="hidden" />

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
              status === 'connected' ? 'bg-[#15803D]' : 'bg-[var(--theme-accent)]'
            }`}
          >
            {status === 'connected' ? (
              <Volume2 className="w-5 h-5 text-white" />
            ) : (
              <PhoneCall className="w-5 h-5 text-white" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-white/75 truncate">{subtitle}</p>
            <h3 className="font-display text-base font-bold text-white truncate">
              {peerName}
            </h3>
            <p className="text-xs font-mono-num text-[var(--theme-accent)] mt-0.5">
              {status === 'connected'
                ? `${t.callConnectedStatus} · ${mins}:${secs}`
                : status === 'ringing'
                  ? t.callRingingStatus
                  : t.callEndedStatus}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={onToggleMute}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors min-h-[42px] whitespace-nowrap ${
            isMuted
              ? 'bg-amber-500 text-[#141518]'
              : 'bg-white/10 hover:bg-white/20 text-white'
          }`}
        >
          {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          <span>{isMuted ? t.callMicMuted : t.callMuteMic}</span>
        </button>

        <button
          type="button"
          onClick={() => void onEndCall()}
          className="py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors min-h-[42px] whitespace-nowrap"
        >
          <PhoneOff className="w-4 h-4" />
          <span>{t.callEndBtn}</span>
        </button>
      </div>
    </div>
  );
};
