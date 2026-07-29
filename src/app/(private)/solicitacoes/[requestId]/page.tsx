import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { buttonVariants } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

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
    errorMessage = 'Não foi possivel carregar os detalhes da solicitação.';
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-heading">Consulta de solicitação</h1>
        <Link
          href="/solicitacoes"
          className={buttonVariants({ variant: 'outline', size: 'md' })}
        >
          <ArrowLeft size={14} /> Voltar
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-subtitle">Resumo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-body">RequestId: {requestId}</p>
          {errorMessage ? (
            <p className="mt-4 rounded-md border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
              {errorMessage}
            </p>
          ) : (
            <pre className="mt-4 overflow-x-auto rounded-md border border-border bg-foreground p-4 text-xs text-background">
              {JSON.stringify(detail, null, 2)}
            </pre>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
