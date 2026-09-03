import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { buttonVariants } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { getRequestById } from '@/features/requests/api';
import { buildRequestReviewSections } from '@/features/requests/clipboard';
import type { JudicialRequestDetail } from '@/features/requests/types';

function formatDate(value?: string) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ requestId: string }>;
}) {
  const { requestId } = await params;

  let detail: JudicialRequestDetail | null = null;
  let errorMessage = '';

  try {
    detail = await getRequestById(requestId);
  } catch {
    errorMessage = 'Não foi possivel carregar os detalhes da solicitação.';
  }

  const sections = detail ? buildRequestReviewSections(detail) : [];

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading">Consulta de solicitação</h1>
          <p className="mt-1 text-sm text-muted-foreground">{requestId}</p>
        </div>
        <Link
          href="/solicitacoes"
          className={buttonVariants({ variant: 'outline', size: 'md' })}
        >
          <ArrowLeft size={14} /> Voltar
        </Link>
      </div>

      {errorMessage ? (
        <Card>
          <CardContent className="pt-6">
            <p className="rounded-md border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
              {errorMessage}
            </p>
          </CardContent>
        </Card>
      ) : detail ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-subtitle">Resumo</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Solicitação</p>
                <p className="font-medium">{detail.requestId}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <div className="mt-1">
                  <Badge
                    tone={
                      detail.status === 'APPROVED'
                        ? 'success'
                        : detail.status === 'ERROR' ||
                            detail.status === 'REJECTED'
                          ? 'danger'
                          : detail.status === 'PROCESSING'
                            ? 'warning'
                            : 'neutral'
                    }
                  >
                    {detail.status}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Checklist</p>
                <p className="font-medium">{detail.checklistType}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Criada em</p>
                <p className="font-medium">{formatDate(detail.createdAt)}</p>
              </div>
            </CardContent>
          </Card>

          {sections.map((section) => (
            <Card key={section.title}>
              <CardHeader>
                <CardTitle className="text-subtitle">{section.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {section.fields?.length ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {section.fields.map((field) => (
                      <div
                        key={`${section.title}-${field.label}`}
                        className="space-y-1 break-words"
                      >
                        <p className="text-sm text-muted-foreground">
                          {field.label}
                        </p>
                        <div className="text-sm font-medium text-foreground">
                          {field.value || '-'}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}

                {section.paragraphs?.length ? (
                  <div className="space-y-2">
                    {section.paragraphs.map((paragraph) => (
                      <p
                        key={paragraph}
                        className="whitespace-pre-wrap text-sm leading-relaxed text-foreground"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                ) : null}

                {section.items?.length ? (
                  <ul className="space-y-2">
                    {section.items.map((item) => (
                      <li
                        key={item}
                        className="rounded border border-border bg-muted/40 p-2 text-sm text-foreground"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </>
      ) : null}
    </section>
  );
}
