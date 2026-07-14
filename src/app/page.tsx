import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <section className="max-w-xl rounded-2xl bg-white p-8 shadow-sm border border-slate-200">
        <p className="text-sm font-semibold text-brand-700">GEQ • DEJUR</p>
        <h1 className="mt-3 text-3xl font-bold">Validador de Ações Judiciais</h1>
        <p className="mt-4 text-slate-600">
          Plataforma para criação, validação e acompanhamento de checklists judiciais com fluxo de LLM e aprovação DEJUR.
        </p>
        <div className="mt-6 flex gap-3">
          <Link className="rounded-lg bg-brand-700 px-4 py-2 text-white" href="/login">Entrar com Microsoft</Link>
          <Link className="rounded-lg border px-4 py-2" href="/dashboard">Acessar mock</Link>
        </div>
      </section>
    </main>
  );
}
