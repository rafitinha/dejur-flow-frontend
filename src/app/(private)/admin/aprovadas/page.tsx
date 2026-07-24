import { StatusTag } from '@/components/ui/StatusTag';
export default function ApprovedAdminPage() {
  return (
    <section>
      <h1 className="text-2xl font-bold">
        DEJUR — Solicitações aprovadas pela LLM
      </h1>
      <p className="mt-2 text-slate-600">
        Disponível apenas para perfis DEJUR e ADMIN.
      </p>
      <div className="mt-6 rounded-xl border bg-white p-4">
        <div className="grid grid-cols-5 gap-3">
          <input className="rounded border p-2" placeholder="Data inicial" />
          <input className="rounded border p-2" placeholder="Data final" />
          <input className="rounded border p-2" placeholder="Tipo" />
          <input
            className="rounded border p-2"
            placeholder="Usuário originador"
          />
          <input className="rounded border p-2" placeholder="CNPJ" />
        </div>
        <div className="mt-6 flex justify-between rounded-lg border p-3">
          <span>REQ-2026-07-03-000001 • Multa Contratual • Score 0.94</span>
          <StatusTag status="APPROVED" />
        </div>
      </div>
    </section>
  );
}
