import Link from 'next/link';

import { getRequestById } from '@/features/requests/api';

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ requestId: string }>;
}) {
  const { requestId } = await params;

  let detail: unknown = null;
  let errorMessage = '';

  try {
    detail = await getRequestById(requestId);
  } catch {
    errorMessage = 'Nao foi possivel carregar os detalhes da solicitacao.';
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Consulta de solicitacao</h1>
        <Link
          href="/solicitacoes"
          className="rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-600"
        >
          Voltar
        </Link>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          RequestId: {requestId}
        </p>
        {errorMessage ? (
          <p className="mt-4 rounded border border-rose-300 bg-rose-50 p-3 text-sm text-rose-700">
            {errorMessage}
          </p>
        ) : (
          <pre className="mt-4 overflow-x-auto rounded bg-slate-950 p-4 text-xs text-slate-100">
            {JSON.stringify(detail, null, 2)}
          </pre>
        )}
      </div>
    </section>
  );
}
