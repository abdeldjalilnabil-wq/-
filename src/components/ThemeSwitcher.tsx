import React from 'react';
import { Palette } from 'lucide-react';
import type { ThemeColorId } from '../types';
import { useI18n } from '../i18n/I18nContext';
import { APP_THEMES } from '../utils/theme';

interface ThemeSwitcherProps {
  currentTheme: ThemeColorId;
  onSelectTheme: (themeId: ThemeColorId) => void;
  compact?: boolean;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  currentTheme,
  onSelectTheme,
  compact = false,
}) => {
  const { t } = useI18n();

  const themeLabels: Record<ThemeColorId, string> = {
    gold: t.themeGold,
    emerald: t.themeEmerald,
    blue: t.themeBlue,
    burgundy: t.themeBurgundy,
    dark: t.themeDark,
  };

  return (
    <div className="inline-flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--theme-muted)] whitespace-nowrap">
        <Palette className="w-3.5 h-3.5 text-[var(--theme-accent)]" />
        <span>{compact ? t.themeLabelCompact : t.themeLabel}</span>
      </span>
      <div className="inline-flex items-center gap-1.5" role="group" aria-label={t.themeLabel}>
        {APP_THEMES.map((theme) => {
          const active = currentTheme === theme.id;
          const localizedLabel = themeLabels[theme.id] || theme.label;
          return (
            <button
              key={theme.id}
              type="button"
              title={localizedLabel}
              aria-label={localizedLabel}
              aria-pressed={active}
              onClick={() => onSelectTheme(theme.id)}
              className={`h-7 px-2 rounded-lg border text-[11px] font-semibold inline-flex items-center gap-1.5 transition-transform active:scale-95 whitespace-nowrap ${
                active
                  ? 'border-[var(--theme-accent)] bg-[var(--theme-surface-muted)] text-[var(--theme-text)]'
                  : 'border-[var(--theme-border)] bg-[var(--theme-surface)] text-[var(--theme-muted)] hover:text-[var(--theme-text)]'
              }`}
            >
              <span
                className="w-3.5 h-3.5 rounded-full border border-black/15 shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${theme.swatchAccent} 55%, ${theme.swatchBg} 55%)`,
                }}
              />
              {!compact && <span className="hidden sm:inline">{localizedLabel}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};
