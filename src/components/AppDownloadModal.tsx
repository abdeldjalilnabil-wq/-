import React, { useEffect, useState } from 'react';
import {
  Check,
  CheckCircle2,
  Code2,
  Copy,
  Download,
  ExternalLink,
  Globe,
  Laptop,
  Share,
  Smartphone,
  TabletSmartphone,
  X,
} from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import { PRIMARY_CUSTOM_DOMAIN, type PlatformSettings } from '../types';
import {
  useOnlineStatus,
  usePWAInstall,
  type DevicePlatformChoice,
} from '../hooks/usePWAInstall';

interface AppDownloadTriggerProps {
  platformSettings: PlatformSettings;
  compact?: boolean;
}

function normalizeSafeUrl(raw?: string): string {
  const trimmed = (raw || '').trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const { t, dir } = useI18n();

  if (isOnline) return null;

  return (
    <div
      dir={dir}
      className="fixed bottom-4 start-4 z-50 flex items-center gap-2 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-bold text-white shadow-lg"
    >
      <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
      <span>{t.downloadOfflineBadge}</span>
    </div>
  );
};

export const AppDownloadTrigger: React.FC<AppDownloadTriggerProps> = ({
  platformSettings,
  compact = false,
}) => {
  const { t, dir } = useI18n();
  const { isInstallable, isInstalled, detectedPlatform, install } = usePWAInstall();

  const [open, setOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<DevicePlatformChoice>(detectedPlatform);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    setSelectedPlatform(detectedPlatform);
  }, [detectedPlatform]);

  if (platformSettings.allowAppDownload === false) {
    return null;
  }

  const originUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const embedWidgetUrl = originUrl ? `${originUrl}/?embed=1` : '/?embed=1';
  const iframeSnippet = `<iframe src="${embedWidgetUrl}" width="100%" height="720" style="border:0;border-radius:16px;overflow:hidden;" allow="microphone; autoplay" loading="lazy" title="${platformSettings.appName}"></iframe>`;

  const androidDirectUrl = normalizeSafeUrl(platformSettings.androidDownloadUrl);
  const iosDirectUrl = normalizeSafeUrl(platformSettings.iosDownloadUrl);
  const desktopDirectUrl = normalizeSafeUrl(platformSettings.desktopDownloadUrl);

  const activeDirectUrl =
    selectedPlatform === 'android'
      ? androidDirectUrl
      : selectedPlatform === 'ios'
        ? iosDirectUrl
        : selectedPlatform === 'desktop'
          ? desktopDirectUrl
          : '';

  const canTriggerOneTapPwa =
    isInstallable &&
    ((selectedPlatform === 'android' && detectedPlatform !== 'ios') ||
      (selectedPlatform === 'desktop' && detectedPlatform === 'desktop'));

  const handleOneTapInstall = async () => {
    setInstalling(true);
    try {
      await install();
    } finally {
      setInstalling(false);
    }
  };

  const handleCopyText = async (text: string, target: 'link' | 'embed') => {
    try {
      await navigator.clipboard.writeText(text);
      if (target === 'embed') {
        setCopiedEmbed(true);
        setTimeout(() => setCopiedEmbed(false), 2000);
      } else {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }
    } catch {
      // Clipboard fallback ignored if blocked
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-1.5 rounded-xl border border-[var(--theme-accent)] bg-[var(--theme-surface-muted)] hover:bg-[var(--theme-surface-hover)] text-[var(--theme-text)] font-bold transition-colors whitespace-nowrap shrink-0 ${
          compact ? 'px-3 py-1.5 text-xs min-h-[34px]' : 'px-3.5 py-2 text-xs min-h-[38px]'
        }`}
      >
        <Download className="w-3.5 h-3.5 text-[var(--theme-accent)] shrink-0" />
        <span>{t.downloadAppBtn}</span>
      </button>

      {open && (
        <div
          dir={dir}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="download-app-modal-title"
        >
          <div className="w-full max-w-2xl rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface)] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 p-5 sm:p-6 border-b border-[var(--theme-border)]">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-[var(--theme-primary)] text-[var(--theme-primary-text)] flex items-center justify-center shrink-0">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h2
                    id="download-app-modal-title"
                    className="font-display text-lg font-extrabold text-[var(--theme-text)]"
                  >
                    {t.downloadModalTitle} — {platformSettings.appName}
                  </h2>
                  <p className="text-xs text-[var(--theme-muted)] mt-1 leading-relaxed">
                    {t.downloadModalSubtitle}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t.closeBtn}
                className="p-2 rounded-xl text-[var(--theme-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface-muted)] transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
              {isInstalled && (
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{t.downloadAlreadyInstalled}</span>
                </div>
              )}

              {/* 4 Platform Selector Cards: Android | iOS | Desktop | Websites */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedPlatform('android')}
                  className={`p-3.5 rounded-xl border text-start transition-all flex flex-col items-start gap-2 min-h-[82px] ${
                    selectedPlatform === 'android'
                      ? 'border-[var(--theme-accent)] bg-[var(--theme-primary)] text-[var(--theme-primary-text)] shadow-sm'
                      : 'border-[var(--theme-border)] bg-[var(--theme-surface-muted)] text-[var(--theme-text)] hover:border-[var(--theme-accent)]'
                  }`}
                >
                  <Smartphone className="w-5 h-5 shrink-0 text-[#22C55E]" />
                  <div>
                    <div className="text-xs sm:text-sm font-extrabold">{t.downloadAndroidTitle}</div>
                    <div className="text-[11px] opacity-80 mt-0.5">APK / PWA</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPlatform('ios')}
                  className={`p-3.5 rounded-xl border text-start transition-all flex flex-col items-start gap-2 min-h-[82px] ${
                    selectedPlatform === 'ios'
                      ? 'border-[var(--theme-accent)] bg-[var(--theme-primary)] text-[var(--theme-primary-text)] shadow-sm'
                      : 'border-[var(--theme-border)] bg-[var(--theme-surface-muted)] text-[var(--theme-text)] hover:border-[var(--theme-accent)]'
                  }`}
                >
                  <TabletSmartphone className="w-5 h-5 shrink-0 text-[#38BDF8]" />
                  <div>
                    <div className="text-xs sm:text-sm font-extrabold">{t.downloadIosTitle}</div>
                    <div className="text-[11px] opacity-80 mt-0.5">iPhone / iPad</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPlatform('desktop')}
                  className={`p-3.5 rounded-xl border text-start transition-all flex flex-col items-start gap-2 min-h-[82px] ${
                    selectedPlatform === 'desktop'
                      ? 'border-[var(--theme-accent)] bg-[var(--theme-primary)] text-[var(--theme-primary-text)] shadow-sm'
                      : 'border-[var(--theme-border)] bg-[var(--theme-surface-muted)] text-[var(--theme-text)] hover:border-[var(--theme-accent)]'
                  }`}
                >
                  <Laptop className="w-5 h-5 shrink-0 text-[#F59E0B]" />
                  <div>
                    <div className="text-xs sm:text-sm font-extrabold">{t.downloadDesktopTitle}</div>
                    <div className="text-[11px] opacity-80 mt-0.5">Windows / Mac</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPlatform('web')}
                  className={`p-3.5 rounded-xl border text-start transition-all flex flex-col items-start gap-2 min-h-[82px] ${
                    selectedPlatform === 'web'
                      ? 'border-[var(--theme-accent)] bg-[var(--theme-primary)] text-[var(--theme-primary-text)] shadow-sm'
                      : 'border-[var(--theme-border)] bg-[var(--theme-surface-muted)] text-[var(--theme-text)] hover:border-[var(--theme-accent)]'
                  }`}
                >
                  <Globe className="w-5 h-5 shrink-0 text-[#A855F7]" />
                  <div>
                    <div className="text-xs sm:text-sm font-extrabold">{t.downloadWebTitle}</div>
                    <div className="text-[11px] opacity-80 mt-0.5">Web / HTML</div>
                  </div>
                </button>
              </div>

              {/* Selected Platform Action & Steps */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] flex items-center justify-center shrink-0">
                    {selectedPlatform === 'android' ? (
                      <Smartphone className="w-5 h-5 text-[#16A34A]" />
                    ) : selectedPlatform === 'ios' ? (
                      <TabletSmartphone className="w-5 h-5 text-[#0284C7]" />
                    ) : selectedPlatform === 'desktop' ? (
                      <Laptop className="w-5 h-5 text-[var(--theme-accent)]" />
                    ) : (
                      <Globe className="w-5 h-5 text-[#9333EA]" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[var(--theme-text)]">
                      {selectedPlatform === 'android'
                        ? t.downloadAndroidTitle
                        : selectedPlatform === 'ios'
                          ? t.downloadIosTitle
                          : selectedPlatform === 'desktop'
                            ? t.downloadDesktopTitle
                            : t.downloadWebTitle}
                    </h3>
                    <p className="text-xs text-[var(--theme-muted)] mt-0.5 leading-relaxed">
                      {selectedPlatform === 'android'
                        ? t.downloadAndroidDesc
                        : selectedPlatform === 'ios'
                          ? t.downloadIosDesc
                          : selectedPlatform === 'desktop'
                            ? t.downloadDesktopDesc
                            : t.downloadWebDesc}
                    </p>
                  </div>
                </div>

                {/* One-Tap PWA Install CTA when browser supports beforeinstallprompt */}
                {canTriggerOneTapPwa && !isInstalled && (
                  <button
                    type="button"
                    disabled={installing}
                    onClick={() => void handleOneTapInstall()}
                    className="w-full py-3 px-4 rounded-xl bg-[var(--theme-accent)] hover:bg-[var(--theme-accent-hover)] text-[var(--theme-accent-text)] text-sm font-bold flex items-center justify-center gap-2 transition-colors min-h-[46px] disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    <span>{t.downloadInstallNowBtn}</span>
                  </button>
                )}

                {/* Open directly on Web Browser when Web tab selected */}
                {selectedPlatform === 'web' && originUrl && (
                  <div className="space-y-2">
                    <a
                      href={originUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 px-4 rounded-xl bg-[var(--theme-accent)] hover:bg-[var(--theme-accent-hover)] text-[var(--theme-accent-text)] text-sm font-bold flex items-center justify-center gap-2 transition-colors min-h-[46px]"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>{t.downloadWebOpenBtn}</span>
                    </a>
                    {originUrl !== PRIMARY_CUSTOM_DOMAIN && (
                      <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] text-xs">
                        <span className="text-[var(--theme-muted)]">النطاق الرسمي:</span>
                        <a
                          href={PRIMARY_CUSTOM_DOMAIN}
                          target="_blank"
                          rel="noopener noreferrer"
                          dir="ltr"
                          className="font-mono-num font-bold text-[var(--theme-accent)] hover:underline"
                        >
                          www.salon-ntb.com
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Owner-configured Direct Store / APK / Installer URL if provided */}
                {activeDirectUrl && (
                  <a
                    href={activeDirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 rounded-xl bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-[var(--theme-primary-text)] text-sm font-bold flex items-center justify-center gap-2 transition-colors min-h-[46px]"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>{t.downloadOpenDirectBtn}</span>
                  </a>
                )}

                {/* Guided Platform Instructions */}
                <div className="space-y-2 text-xs text-[var(--theme-text)] bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-xl p-3.5 leading-relaxed">
                  {selectedPlatform === 'android' && (
                    <>
                      <p>{t.downloadAndroidStep1}</p>
                      <p>{t.downloadAndroidStep2}</p>
                    </>
                  )}
                  {selectedPlatform === 'ios' && (
                    <>
                      <p>{t.downloadIosStep1}</p>
                      <p className="flex items-center gap-1.5 flex-wrap">
                        <Share className="w-3.5 h-3.5 text-[var(--theme-accent)] shrink-0" />
                        <span>{t.downloadIosStep2}</span>
                      </p>
                      <p>{t.downloadIosStep3}</p>
                    </>
                  )}
                  {selectedPlatform === 'desktop' && (
                    <>
                      <p>{t.downloadDesktopStep1}</p>
                      <p>{t.downloadDesktopStep2}</p>
                    </>
                  )}
                  {selectedPlatform === 'web' && (
                    <>
                      <p>{t.downloadWebStep1}</p>
                      <p>{t.downloadWebStep2}</p>
                    </>
                  )}
                </div>

                {/* Ready-to-paste HTML iframe embed code when Web platform is selected */}
                {selectedPlatform === 'web' && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[var(--theme-text)] inline-flex items-center gap-1.5">
                        <Code2 className="w-3.5 h-3.5 text-[var(--theme-accent)]" />
                        <span>{t.downloadEmbedCodeLabel}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => void handleCopyText(iframeSnippet, 'embed')}
                        className="px-3 py-1.5 rounded-lg border border-[var(--theme-border)] bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-hover)] text-xs font-semibold text-[var(--theme-text)] inline-flex items-center gap-1.5 shrink-0"
                      >
                        {copiedEmbed ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#15803D]" />
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
                      className="p-3 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[11px] font-mono-num text-[var(--theme-text)] overflow-x-auto whitespace-pre-wrap break-all select-all"
                    >
                      {iframeSnippet}
                    </pre>
                  </div>
                )}

                {/* Copy App URL */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <span
                    dir="ltr"
                    className="text-[11px] font-mono-num text-[var(--theme-muted)] truncate"
                  >
                    {originUrl}
                  </span>
                  <button
                    type="button"
                    onClick={() => void handleCopyText(originUrl, 'link')}
                    className="px-3 py-1.5 rounded-lg border border-[var(--theme-border)] bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-hover)] text-xs font-semibold text-[var(--theme-text)] inline-flex items-center gap-1.5 shrink-0"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#15803D]" />
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
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3.5 border-t border-[var(--theme-border)] bg-[var(--theme-surface-muted)] flex justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-5 py-2 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] text-xs font-bold text-[var(--theme-text)] hover:bg-[var(--theme-surface-hover)]"
              >
                {t.closeBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
