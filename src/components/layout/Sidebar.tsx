'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, FilePlus, Files, LayoutDashboard, Sparkles } from 'lucide-react';
import { AppLogo } from '@/components/ui/AppLogo';
import { Profile } from '@/components/auth/Profile';
import { cn } from '@/lib/utils/cn';
import { useLayoutStore } from '@/stores/layout.store';

const items = [
  ['/dashboard', 'Dashboard', LayoutDashboard],
  ['/solicitacoes/nova', 'Nova solicitação', FilePlus],
  ['/solicitacoes', 'Solicitações', Files],
  ['/admin/aprovadas', 'Aprovações DEJUR', Sparkles],
  ['/notificacoes', 'Notificações', Bell],
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const state = useLayoutStore((store) => store.sidebarState);
  const setState = useLayoutStore((store) => store.setSidebarState);

  const [viewportWidth, setViewportWidth] = useState<number | null>(null);

  useEffect(() => {
    const sync = () => setViewportWidth(window.innerWidth);
    sync();
    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
  }, []);

  const isMobile = viewportWidth !== null && viewportWidth < 768;
  const isDrawerOpen = state === 'expanded';
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const shouldLockScroll =
      isDrawerOpen && viewportWidth !== null && viewportWidth < 1024;
    if (!shouldLockScroll) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isDrawerOpen, viewportWidth]);

  const width =
    state === 'expanded'
      ? isMobile
        ? '100vw'
        : 280
      : state === 'collapsed'
        ? 68
        : 0;

  function closeOnNavigate() {
    if (typeof window === 'undefined') return;
    if (state === 'expanded' && window.innerWidth < 1024) setState('hidden');
  }

  return (
    <>
      <motion.aside
        animate={{ width }}
        transition={{ duration: 0.22 }}
        aria-label="Navegação principal"
        aria-hidden={state === 'hidden'}
        className={cn(
          'z-40 flex shrink-0 flex-col overflow-hidden border-r border-border bg-surface',
          'lg:relative lg:inset-auto lg:z-30 lg:h-auto lg:self-stretch lg:shadow-none',
          isDrawerOpen ? 'fixed inset-y-0 left-0 h-dvh shadow-xl' : 'relative',
        )}
      >
        <div className="flex h-full min-w-[68px] flex-col gap-5 overflow-y-auto overscroll-contain p-3 pt-20 lg:pt-3">
          <div className="flex items-center gap-3 px-1">
            <AppLogo size={state === 'expanded' ? 'sidebar' : 'compact'} />
            {state === 'expanded' && (
              <span className="font-semibold">Validador Judicial</span>
            )}
          </div>

          <nav className="grid gap-2">
            {items.map(([href, label, Icon]) => (
              <Link
                key={href}
                href={href}
                title={state === 'collapsed' ? label : undefined}
                onClick={closeOnNavigate}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm',
                  pathname === href
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-hover',
                )}
              >
                <Icon size={17} />
                <span className={cn(state !== 'expanded' && 'sr-only')}>
                  {label}
                </span>
              </Link>
            ))}
          </nav>

          <Profile
            compact={state !== 'expanded'}
            className="mt-auto px-1 pb-3"
          />
        </div>
      </motion.aside>

      {isDrawerOpen && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={() => setState('hidden')}
          className="fixed inset-0 z-30 bg-foreground/25 backdrop-blur-[2px] lg:hidden"
        />
      )}
    </>
  );
}
