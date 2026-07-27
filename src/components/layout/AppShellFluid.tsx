'use client';
import { useEffect } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { useLayoutStore } from '@/stores/layout.store';
export function AppShellFluid({ children }: { children: React.ReactNode }) {
  const setSidebarState = useLayoutStore((state) => state.setSidebarState);
  useEffect(() => {
    const sync = () => setSidebarState(window.innerWidth < 768 ? 'hidden' : window.innerWidth < 1024 ? 'collapsed' : 'expanded');
    sync(); window.addEventListener('resize', sync); return () => window.removeEventListener('resize', sync);
  }, [setSidebarState]);
  return <div className="flex min-h-screen flex-col bg-app-gradient text-foreground"><Navbar /><div className="flex min-h-0 flex-1"><Sidebar /><main className="min-w-0 flex-1 overflow-auto p-4 md:p-6 lg:p-8">{children}</main></div></div>;
}
