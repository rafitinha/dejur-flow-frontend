import { AppShellFluid } from '@/components/layout/AppShellFluid';
export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShellFluid>{children}</AppShellFluid>;
}
