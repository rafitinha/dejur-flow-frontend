import { AlertTriangle, CircleCheckBig, Sparkles } from 'lucide-react';
import { MetricCard } from '@/components/ui/Card';
import type { JudicialDashboardSummaryResponse } from '@/features/requests/api';

const comparisonPeriodLabels: Record<string, string> = {
  YESTERDAY: 'ontem',
  PREVIOUS_PERIOD: 'período anterior',
  PREVIOUS_WEEK: 'semana anterior',
  PREVIOUS_MONTH: 'mês anterior',
};

const checklistTypeLabels: Record<string, string> = {
  CONTRACTUAL_FINE: 'Multa contratual',
  TITLE_COLLECTION: 'Cobrança de títulos',
  CONTAINER_RECOVERY: 'Recuperação de vasilhames',
};

function formatVariation(value: number) {
  if (value === 0) return '0%';
  const formatted = Math.abs(value);
  return `${value > 0 ? '+' : '-'}${formatted}`;
}

function formatChecklistLabel(type: string) {
  return checklistTypeLabels[type] ?? type.replace(/_/g, ' ');
}

export function DashboardMetricGrid({
  summary,
  loading = false,
}: {
  summary?: JudicialDashboardSummaryResponse | null;
  loading?: boolean;
}) {
  const underAi = summary?.indicators?.underAiAnalysis;
  const approved = summary?.indicators?.approved;
  const rejected = summary?.indicators?.rejected;

  const underAiLabel = underAi
    ? `${formatVariation(underAi.variation)} vs. ${comparisonPeriodLabels[underAi.comparisonPeriod] ?? 'período anterior'}`
    : 'Sem dados';

  const approvedLabel = approved
    ? `${approved.approvalRate.toFixed(0)}% de taxa`
    : 'Sem dados';

  const rejectedLabel = rejected
    ? rejected.hasReasonsForReview
      ? 'Revisar motivos'
      : 'Sem motivos para revisão'
    : 'Sem dados';

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <MetricCard
        title="Em análise IA"
        value={String(underAi?.count ?? 0)}
        trend={underAiLabel}
        tone="info"
        icon={<Sparkles size={16} />}
        loading={loading}
      />
      <MetricCard
        title="Aprovadas"
        value={String(approved?.count ?? 0)}
        trend={approvedLabel}
        tone="success"
        icon={<CircleCheckBig size={16} />}
        loading={loading}
      />
      <MetricCard
        title="Rejeitadas"
        value={String(rejected?.count ?? 0)}
        trend={rejectedLabel}
        tone="danger"
        icon={<AlertTriangle size={16} />}
        loading={loading}
      />
    </div>
  );
}

export function getDashboardChecklistLabels(
  summary?: JudicialDashboardSummaryResponse | null,
) {
  return (summary?.checklistTypeDistribution ?? []).map((item) =>
    formatChecklistLabel(item.type),
  );
}

export function getDashboardChecklistValues(
  summary?: JudicialDashboardSummaryResponse | null,
) {
  return (summary?.checklistTypeDistribution ?? []).map((item) => item.count);
}
