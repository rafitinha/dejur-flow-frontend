import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  ArrowRight,
  Brain,
  FileText,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { MiniBarChart } from '@/components/charts/MiniBarChart';
import { DashboardMetricGrid } from '@/components/dashboard/cards';
import { buttonVariants } from '@/components/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { StatusTag } from '@/components/ui/StatusTag';

const items = [
  {
    id: 'REQ-2026-07-03-000001',
    tipo: 'Multa Contratual',
    devedora: 'Empresa Devedora LTDA',
    status: 'PROCESSING' as const,
  },
  {
    id: 'REQ-2026-07-03-000002',
    tipo: 'Títulos',
    devedora: 'Comercial Exemplo ME',
    status: 'NEEDS_CORRECTION' as const,
  },
];
export default function DashboardPage() {
  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-label">Painel Operacional</p>
          <h1 className="text-heading">Dashboard Judicial</h1>
          <p className="text-body mt-1">
            Visão em tempo real de solicitações, performance de análise e fluxo
            de aprovação.
          </p>
        </div>
        <Link
          href="/solicitacoes/nova"
          className={buttonVariants({ variant: 'primary', size: 'md' })}
        >
          Nova solicitação <ArrowRight size={16} />
        </Link>
      </div>

      <DashboardMetricGrid />

      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Distribuição por tipo de checklist</CardTitle>
              <CardDescription>
                Proporção das entradas na última semana.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <MiniBarChart
              labels={[
                'Multa contratual',
                'Cobrança de títulos',
                'Recuperação vasilhames',
              ]}
              values={[34, 21, 13]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Indicadores de qualidade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InsightRow
              icon={<Brain size={15} />}
              label="Confiabilidade LLM"
              value="94,2%"
              tone="info"
            />
            <InsightRow
              icon={<TrendingUp size={15} />}
              label="SLA médio"
              value="3h 12m"
              tone="success"
            />
            <InsightRow
              icon={<Sparkles size={15} />}
              label="Aprovações automáticas"
              value="76%"
              tone="primary"
            />
            <InsightRow
              icon={<FileText size={15} />}
              label="Documentos pendentes"
              value="9"
              tone="warning"
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Solicitações recentes</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {items.map((i) => (
            <div
              key={i.id}
              className="flex flex-col gap-3 rounded-md border border-border/80 bg-background/40 p-3 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="font-medium">{i.id}</p>
                <p className="text-body">
                  {i.tipo} • {i.devedora}
                </p>
              </div>
              <StatusTag status={i.status} />
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}

function InsightRow({
  icon,
  label,
  value,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  tone: 'primary' | 'info' | 'warning' | 'success';
}) {
  const toneClass = {
    primary: 'bg-primary/15 text-primary',
    info: 'bg-info/15 text-info',
    warning: 'bg-warning/15 text-warning',
    success: 'bg-success/15 text-success',
  }[tone];

  return (
    <div className="flex items-center justify-between rounded-md border border-border/80 bg-background/40 p-3">
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex size-8 items-center justify-center rounded-md ${toneClass}`}
        >
          {icon}
        </span>
        <span className="text-sm text-foreground">{label}</span>
      </div>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}
