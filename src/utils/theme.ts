import type { ThemeColorId } from '../types';

export interface AppThemeOption {
  id: ThemeColorId;
  label: string;
  swatchBg: string;
  swatchAccent: string;
  isDark?: boolean;
}

export const APP_THEMES: AppThemeOption[] = [
  {
    id: 'gold',
    label: 'ذهبي كلاسيكي',
    swatchBg: '#F8F7F4',
    swatchAccent: '#B7791F',
  },
  {
    id: 'emerald',
    label: 'أخضر زمردي',
    swatchBg: '#F2F7F4',
    swatchAccent: '#059669',
  },
  {
    id: 'blue',
    label: 'أزرق ملكي',
    swatchBg: '#F3F6FA',
    swatchAccent: '#2563EB',
  },
  {
    id: 'burgundy',
    label: 'عنابي فاخر',
    swatchBg: '#FAF4F5',
    swatchAccent: '#BE123C',
  },
  {
    id: 'dark',
    label: 'ليلي داكن',
    swatchBg: '#111317',
    swatchAccent: '#E5A93B',
    isDark: true,
  },
];

const THEME_STORAGE_KEY = 'dorak_theme_color';

export function isValidThemeId(val: unknown): val is ThemeColorId {
  return (
    val === 'gold' ||
    val === 'emerald' ||
    val === 'blue' ||
    val === 'burgundy' ||
    val === 'dark'
  );
}

export function getStoredThemeColor(): ThemeColorId | null {
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isValidThemeId(saved) ? saved : null;
  } catch {
    return null;
  }
}

export function storeThemeColor(themeId: ThemeColorId): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, themeId);
  } catch {
    // Ignore storage restriction
  }
}

export function applyAppTheme(themeId: ThemeColorId): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.dataset.appTheme = themeId;
  if (themeId === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}
