'use client';
import { useEffect, useSyncExternalStore } from 'react';
import {
  applyTheme,
  getActiveTheme,
  persistTheme,
  THEME_EVENT,
} from '@/lib/theme/theme';
const snapshot = () =>
  typeof window !== 'undefined' && getActiveTheme() === 'dark';
const serverSnapshot = () => false;
function subscribe(notify: () => void) {
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  media.addEventListener('change', notify);
  window.addEventListener('storage', notify);
  window.addEventListener(THEME_EVENT, notify);
  return () => {
    media.removeEventListener('change', notify);
    window.removeEventListener('storage', notify);
    window.removeEventListener(THEME_EVENT, notify);
  };
}
export function useTheme() {
  const isDark = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  useEffect(() => applyTheme(isDark ? 'dark' : 'light'), [isDark]);
  return {
    isDark,
    themeLabel: isDark ? 'Ativar tema claro' : 'Ativar tema escuro',
    toggleTheme: () => persistTheme(isDark ? 'light' : 'dark'),
  };
}
