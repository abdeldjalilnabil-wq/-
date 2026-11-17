class RingtoneController {
  private ctx: AudioContext | null = null;
  private intervalId: number | null = null;
  private vibrateIntervalId: number | null = null;
  private isPlaying = false;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  private playRingBurst(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const playPulse = (startOffset: number, duration: number) => {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(440, now + startOffset);
      osc2.frequency.setValueAtTime(480, now + startOffset);

      gain.gain.setValueAtTime(0.001, now + startOffset);
      gain.gain.exponentialRampToValueAtTime(0.18, now + startOffset + 0.04);
      gain.gain.setValueAtTime(0.18, now + startOffset + duration - 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + startOffset + duration);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now + startOffset);
      osc2.start(now + startOffset);
      osc1.stop(now + startOffset + duration + 0.02);
      osc2.stop(now + startOffset + duration + 0.02);
    };

    // Classic double-ring phone cadence
    playPulse(0, 0.38);
    playPulse(0.48, 0.38);
  }

  public startRinging(): void {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.playRingBurst();

    if (typeof window !== 'undefined') {
      this.intervalId = window.setInterval(() => {
        this.playRingBurst();
      }, 2200);

      if ('vibrate' in navigator) {
        navigator.vibrate([400, 200, 400]);
        this.vibrateIntervalId = window.setInterval(() => {
          navigator.vibrate([400, 200, 400]);
        }, 2200);
      }
    }
  }

  public stopRinging(): void {
    this.isPlaying = false;
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.vibrateIntervalId !== null) {
      clearInterval(this.vibrateIntervalId);
      this.vibrateIntervalId = null;
    }
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(0);
    }
  }

  public playSoftChime(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const notes = [587.33, 880]; // D5 -> A5
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);
      gain.gain.setValueAtTime(0.001, now + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.14, now + idx * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.38);
    });
  }
}

export const ringtoneController = new RingtoneController();

export async function requestBrowserNotifications(): Promise<NotificationPermission | 'unsupported'> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  return Notification.requestPermission();
}

export function triggerTurnNotification(
  shopName: string,
  ticketNumber: number,
  customMessage?: string
): void {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    try {
      new Notification(`حان دورك عند ${shopName}`, {
        body:
          customMessage ||
          `تذكرتك رقم #${ticketNumber} — الحلاق يتصل بك الآن، يمكنك التقرب للمحل.`,
        requireInteraction: true,
      });
    } catch {
      // Ignore notification errors in restricted iframes
    }
  }
}

export function triggerPhoneDial(phone: string): void {
  if (typeof document === 'undefined') return;
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  if (!cleanPhone) return;
  const link = document.createElement('a');
  link.href = `tel:${cleanPhone}`;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
