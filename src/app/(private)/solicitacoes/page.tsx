import { StatusTag } from '@/components/ui/StatusTag';
const data = [
  {
    requestId: 'REQ-2026-07-03-000001',
    type: 'COBRANCA_MULTA_CONTRATUAL',
    debtor: 'Empresa Devedora LTDA',
    status: 'APPROVED' as const,
  },
];
export default function RequestsPage() {
  return (
    <section>
      <h1 className="text-2xl font-bold">Minhas solicitações</h1>
      <div className="mt-4 rounded-xl border bg-white p-4">
        <div className="grid grid-cols-4 gap-3">
          <input className="rounded border p-2" placeholder="Data inicial" />
          <input className="rounded border p-2" placeholder="Data final" />
          <input className="rounded border p-2" placeholder="Status" />
          <input className="rounded border p-2" placeholder="CNPJ devedora" />
        </div>
        <div className="mt-6 grid gap-2">
          {data.map((i) => (
            <div
              key={i.requestId}
              className="flex justify-between rounded-lg border p-3"
            >
              <span>
                {i.requestId} • {i.debtor}
              </span>
              <StatusTag status={i.status} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
