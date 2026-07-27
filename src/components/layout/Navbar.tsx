'use client';
import { Menu, Moon, Settings, Sun } from 'lucide-react';
import { AppLogo } from '@/components/ui/AppLogo';
import { Profile } from '@/components/auth/Profile';
import { useTheme } from '@/hooks/useTheme';
import { useLayoutStore } from '@/stores/layout.store';
export function Navbar() {
  const cycle = useLayoutStore((state) => state.cycleSidebar);
  const { isDark, themeLabel, toggleTheme } = useTheme();
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-lg">
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
            <p
              className="text-label
                  bg-gradient-to-r
                  from-[#F23859]
                  via-[#F9474E]
                  to-[#FD4F48]
                  bg-clip-text
                  text-transparent
                "
            >
              GEQ
            </p>
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
          <button
            type="button"
            className="grid size-10 place-items-center rounded-md border border-border bg-surface"
            aria-label="Configurações"
          >
            <Settings size={15} />
          </button>
        </div>
      </div>
    </header>
  );
}
