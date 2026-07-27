import Link from 'next/link';
import { ArrowLeft, Pencil } from 'lucide-react';
import { buttonVariants } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

import { getRequestById } from '@/features/requests/api';

export default async function RequestEditPage({
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
    errorMessage = 'Nao foi possivel carregar os dados para edicao.';
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-heading">Edição de solicitação</h1>
        <Link
          href="/solicitacoes"
          className={buttonVariants({ variant: 'outline', size: 'md' })}
        >
          <ArrowLeft size={14} /> Voltar
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-subtitle">
            <Pencil size={16} /> Estrutura de edição
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-body">
            Estrutura inicial pronta para edicao da solicitacao {requestId}.
          </p>
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
