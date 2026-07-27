export const THEME_STORAGE_KEY = 'app-theme';
export const THEME_EVENT = 'app-theme-change';

export type AppTheme = 'light' | 'dark';

export function getSystemTheme(): AppTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export function getStoredTheme(): AppTheme | null {
  if (typeof window === 'undefined') return null;
  const value = localStorage.getItem(THEME_STORAGE_KEY);
  if (value === 'light' || value === 'dark') return value;
  return null;
}

export function getActiveTheme(): AppTheme {
  return getStoredTheme() ?? getSystemTheme();
}

export function applyTheme(theme: AppTheme) {
  if (typeof window === 'undefined') return;
  const isDark = theme === 'dark';
  document.documentElement.classList.toggle('dark', isDark);
  document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
}

export function persistTheme(theme: AppTheme) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  window.dispatchEvent(new Event(THEME_EVENT));
}
