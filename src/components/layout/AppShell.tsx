'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import {
  Bell,
  FilePlus,
  Files,
  LayoutDashboard,
  Menu,
  Moon,
  Settings,
  Sparkles,
  Sun,
  X,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import {
  applyTheme,
  getActiveTheme,
  persistTheme,
  THEME_EVENT,
} from '@/lib/theme/theme';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/solicitacoes/nova', label: 'Nova solicitação', icon: FilePlus },
  { href: '/solicitacoes', label: 'Solicitações', icon: Files },
  { href: '/notificacoes', label: 'Notificações', icon: Bell },
];

function getThemeSnapshot() {
  if (typeof window === 'undefined') return false;
  return getActiveTheme() === 'dark';
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
    applyTheme(isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const themeLabel = useMemo(
    () => (isDarkMode ? 'Ativar tema claro' : 'Ativar tema escuro'),
    [isDarkMode],
  );

  function toggleTheme() {
    persistTheme(isDarkMode ? 'light' : 'dark');
  }

  return (
    <div className="min-h-screen bg-app-gradient text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-lg">
        <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between px-4 py-3 md:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex size-10 items-center justify-center rounded-md border border-border bg-surface text-foreground shadow-xs transition hover:bg-hover lg:hidden"
              onClick={() => setIsSidebarOpen((state) => !state)}
              aria-label="Abrir menu"
            >
              {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <div>
              <p className="text-label text-primary">GEQ</p>
              <h1 className="text-lg font-semibold tracking-tight">
                Validador Judicial
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              title={themeLabel}
              onClick={toggleTheme}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm shadow-xs transition hover:bg-hover"
            >
              {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
              <span className="hidden sm:inline">
                {isDarkMode ? 'Tema claro' : 'Tema escuro'}
              </span>
            </button>
            <button
              type="button"
              className="inline-flex size-10 items-center justify-center rounded-md border border-border bg-surface text-muted-foreground shadow-xs transition hover:bg-hover"
              aria-label="Configurações"
            >
              <Settings size={15} />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1600px]">
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-50 w-72 border-r border-border bg-surface p-5 pt-20 shadow-xl transition-transform duration-300 ease-out lg:static lg:translate-x-0 lg:border-r lg:pt-8 lg:shadow-none',
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <nav className="grid gap-2 text-sm" aria-label="Navegação principal">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-md px-3 py-2.5 transition',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-hover hover:text-foreground',
                  )}
                >
                  <Icon size={16} aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {isSidebarOpen && (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-[2px] lg:hidden"
            aria-label="Fechar menu"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <main className="w-full p-4 md:p-8 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
