import { create } from 'zustand';
import { persist } from 'zustand/middleware';
export type SidebarState = 'expanded' | 'collapsed' | 'hidden';
const next: Record<SidebarState, SidebarState> = { expanded: 'collapsed', collapsed: 'hidden', hidden: 'expanded' };
type Store = { sidebarState: SidebarState; setSidebarState: (state: SidebarState) => void; cycleSidebar: () => void };
export const useLayoutStore = create<Store>()(persist((set) => ({
  sidebarState: 'expanded',
  setSidebarState: (sidebarState) => set({ sidebarState }),
  cycleSidebar: () => set(({ sidebarState }) => ({ sidebarState: next[sidebarState] })),
}), { name: 'judicial-validator-layout' }));
