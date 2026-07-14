import Link from 'next/link';
export function AppShell({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen"><aside className="fixed inset-y-0 left-0 w-72 border-r bg-white p-5"><h1 className="font-bold text-lg">Validador Judicial</h1><nav className="mt-6 grid gap-2 text-sm"><Link href="/dashboard">Dashboard</Link><Link href="/solicitacoes/nova">Nova solicitação</Link><Link href="/solicitacoes">Minhas solicitações</Link><Link href="/admin/aprovadas">DEJUR aprovadas</Link><Link href="/notificacoes">Notificações</Link></nav></aside><main className="ml-72 p-8">{children}</main></div>;
}
