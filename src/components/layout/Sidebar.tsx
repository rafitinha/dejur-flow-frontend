'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  const width = state === 'expanded' ? 280 : state === 'collapsed' ? 68 : 0;
  return (
    <>
      <motion.aside
        animate={{ width }}
        transition={{ duration: 0.22 }}
        aria-label="Navegação principal"
        aria-hidden={state === 'hidden'}
        className="relative z-40 shrink-0 overflow-hidden border-r border-border bg-surface"
      >
        <div className="flex h-full min-w-[68px] flex-col gap-5 p-3">
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
      {state !== 'hidden' && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={() => setState('hidden')}
          className="fixed inset-0 z-30 bg-foreground/20 lg:hidden"
        />
      )}
    </>
  );
}
