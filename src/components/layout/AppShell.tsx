'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/solicitacoes/nova', label: 'Nova solicitacao' },
  { href: '/solicitacoes', label: 'Minhas solicitacoes' },
  { href: '/admin/aprovadas', label: 'DEJUR aprovadas' },
  { href: '/notificacoes', label: 'Notificacoes' },
];

const THEME_STORAGE_KEY = 'app-theme';
const THEME_EVENT = 'app-theme-change';

function getThemeSnapshot() {
  if (typeof window === 'undefined') return false;

  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  if (savedTheme) return savedTheme === 'dark';

  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function getThemeServerSnapshot() {
  return false;
}

function subscribeTheme(onStoreChange: () => void) {
  if (typeof window === 'undefined') return () => {};

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const listener = () => onStoreChange();

  mediaQuery.addEventListener('change', listener);
  window.addEventListener('storage', listener);
  window.addEventListener(THEME_EVENT, listener);

  return () => {
    mediaQuery.removeEventListener('change', listener);
    window.removeEventListener('storage', listener);
    window.removeEventListener(THEME_EVENT, listener);
  };
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isDarkMode = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getThemeServerSnapshot,
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    document.documentElement.style.colorScheme = isDarkMode ? 'dark' : 'light';
  }, [isDarkMode]);

  const themeLabel = useMemo(
    () => (isDarkMode ? 'Ativar tema claro' : 'Ativar tema escuro'),
    [isDarkMode],
  );

  function toggleTheme() {
    const next = !isDarkMode;
    localStorage.setItem(THEME_STORAGE_KEY, next ? 'dark' : 'light');
    window.dispatchEvent(new Event(THEME_EVENT));
  }

  return (
    <div className="min-h-screen bg-app-gradient text-slate-900 dark:text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur dark:border-slate-700 dark:bg-slate-950/80">
        <div className="flex w-full items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-lg border border-slate-300 p-2 dark:border-slate-600"
              onClick={() => setIsSidebarOpen((state) => !state)}
              aria-label="Abrir menu"
            >
              {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700 dark:text-brand-500">
                GEQ
              </p>
              <h1 className="text-lg font-bold">Validador Judicial</h1>
            </div>
          </div>
          <button
            type="button"
            title={themeLabel}
            onClick={toggleTheme}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600"
          >
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            <span className="hidden sm:inline">
              {isDarkMode ? 'Tema claro' : 'Tema escuro'}
            </span>
          </button>
        </div>
      </header>

      <div className="flex w-full">
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-200 bg-white p-5 pt-20 shadow-xl transition-transform duration-300 ease-out dark:border-slate-700 dark:bg-slate-950',
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <nav className="grid gap-2 text-sm">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={cn(
                    'rounded-lg px-3 py-2 transition',
                    isActive
                      ? 'bg-brand-700 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-brand-50 dark:text-slate-200 dark:hover:bg-slate-800',
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {isSidebarOpen && (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-slate-950/40"
            aria-label="Fechar menu"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <main className="w-full p-4 md:p-8 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
