import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Globe, Search, X } from 'lucide-react';
import { WORLD_LANGUAGES } from '../i18n/languages';
import { useI18n } from '../i18n/I18nContext';
import { CountryFlag } from './CountryFlag';

interface LanguageSwitcherProps {
  compact?: boolean;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  compact = false,
}) => {
  const { lang, worldLang, t, setLanguage } = useI18n();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('mousedown', handleOutside);
    window.addEventListener('keydown', handleEsc);
    const focusTimer = window.setTimeout(() => searchInputRef.current?.focus(), 40);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener('mousedown', handleOutside);
      window.removeEventListener('keydown', handleEsc);
    };
  }, [open]);

  const filteredLanguages = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return WORLD_LANGUAGES;
    return WORLD_LANGUAGES.filter(
      (item) =>
        item.nativeName.toLowerCase().includes(q) ||
        item.enName.toLowerCase().includes(q) ||
        item.arName.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div ref={containerRef} className="relative inline-flex items-center">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((prev) => !prev)}
        className="h-8 px-2.5 rounded-lg border border-[var(--theme-border)] bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-muted)] text-[11px] font-semibold text-[var(--theme-text)] inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
      >
        <Globe className="w-3.5 h-3.5 text-[var(--theme-accent)] shrink-0" />
        <CountryFlag countryCode={worldLang.countryCode} size="sm" />
        {!compact && (
          <span className="hidden sm:inline text-[var(--theme-muted)]">
            {t.languageLabel}:
          </span>
        )}
        <span className="max-w-[110px] truncate">{worldLang.nativeName}</span>
        <ChevronDown className="w-3.5 h-3.5 text-[var(--theme-muted)] shrink-0" />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={t.languageLabel}
          className="absolute top-10 start-0 z-50 w-72 sm:w-80 bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="p-2.5 border-b border-[var(--theme-border)] flex items-center gap-2 bg-[var(--theme-surface-muted)]">
            <Search className="w-4 h-4 text-[var(--theme-muted)] shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.languageSearchPlaceholder}
              className="flex-1 bg-transparent text-xs text-[var(--theme-text)] focus:outline-none placeholder:text-[var(--theme-muted)]"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="p-0.5 text-[var(--theme-muted)] hover:text-[var(--theme-text)]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-[var(--theme-border)]/60">
            {filteredLanguages.length === 0 ? (
              <div className="p-4 text-center text-xs text-[var(--theme-muted)]">
                {t.noLanguagesFound}
              </div>
            ) : (
              filteredLanguages.map((item) => {
                const selected = item.code.toLowerCase() === lang.toLowerCase();
                return (
                  <button
                    key={item.code}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => {
                      setLanguage(item.code);
                      setSearch('');
                      setOpen(false);
                    }}
                    className={`w-full px-3.5 py-2.5 flex items-center justify-between gap-2 text-start text-xs transition-colors ${
                      selected
                        ? 'bg-[var(--theme-surface-muted)] font-bold text-[var(--theme-text)]'
                        : 'hover:bg-[var(--theme-surface-muted)]/70 text-[var(--theme-text)]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <CountryFlag countryCode={item.countryCode} size="sm" />
                      <div className="min-w-0">
                        <div className="truncate">{item.nativeName}</div>
                        <div className="text-[10px] text-[var(--theme-muted)] truncate">
                          {item.enName} · {item.code.toUpperCase()}
                        </div>
                      </div>
                    </div>
                    {selected && (
                      <Check className="w-4 h-4 text-[var(--theme-accent)] shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
