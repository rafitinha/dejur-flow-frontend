'use client';
import { useEffect, useRef, useState } from 'react';
import { LogOut, Menu, Moon, Settings, Sun } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { AppLogo } from '@/components/ui/AppLogo';
import { Profile } from '@/components/auth/Profile';
import { useTheme } from '@/hooks/useTheme';
import { useLayoutStore } from '@/stores/layout.store';
import { cn } from '@/lib/utils/cn';

export function Navbar() {
  const cycle = useLayoutStore((state) => state.cycleSidebar);
  const { status } = useSession();
  const { isDark, themeLabel, toggleTheme } = useTheme();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsSettingsOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  async function handleLogout() {
    if (status !== 'authenticated') return;

    await signOut({
      redirect: false,
      callbackUrl: '/',
    });

    window.location.href = '/';
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/85 backdrop-blur-lg">
      <div className="flex w-full items-center justify-between px-4 py-3 md:px-8 md:pl-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={cycle}
            aria-label="Alternar menu lateral"
            className="grid size-10 place-items-center rounded-md border border-border bg-surface"
          >
            <Menu size={18} />
          </button>
          <AppLogo />
          <div>
            <h1 className="text-lg font-semibold">Validador Judicial</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Profile compact className="hidden sm:flex" />
          <button
            type="button"
            title={themeLabel}
            onClick={toggleTheme}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm"
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
            <span className="hidden md:inline">
              {isDark ? 'Tema claro' : 'Tema escuro'}
            </span>
          </button>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              className="grid size-10 place-items-center rounded-md border border-border bg-surface"
              aria-label="Configurações"
              aria-expanded={isSettingsOpen}
              onClick={() => setIsSettingsOpen((open) => !open)}
            >
              <Settings size={15} />
            </button>

            {isSettingsOpen ? (
              <div className="absolute right-0 top-12 z-50 w-52 overflow-hidden rounded-xl border border-border/80 bg-card shadow-lg shadow-slate-950/10">
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  className={cn(
                    'flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-accent/40',
                    status !== 'authenticated' &&
                      'cursor-not-allowed opacity-50',
                  )}
                  disabled={status !== 'authenticated'}
                >
                  <span className="flex items-center gap-2">
                    <LogOut size={15} />
                    Logout
                  </span>
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
