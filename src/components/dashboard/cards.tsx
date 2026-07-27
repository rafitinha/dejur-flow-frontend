import {
  AlertTriangle,
  CircleCheckBig,
  Clock3,
  FileClock,
  Sparkles,
} from 'lucide-react';
import { MetricCard } from '@/components/ui/Card';

export function DashboardMetricGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <MetricCard
        title="Rascunhos"
        value="03"
        trend="+1 hoje"
        tone="default"
        icon={<FileClock size={16} />}
      />
      <MetricCard
        title="Em análise IA"
        value="11"
        trend="-2 vs. ontem"
        tone="info"
        icon={<Sparkles size={16} />}
      />
      <MetricCard
        title="Pendências"
        value="04"
        trend="2 vencem em 24h"
        tone="warning"
        icon={<Clock3 size={16} />}
      />
      <MetricCard
        title="Aprovadas"
        value="28"
        trend="92% de taxa"
        tone="success"
        icon={<CircleCheckBig size={16} />}
      />
      <MetricCard
        title="Rejeitadas"
        value="02"
        trend="Revisar motivos"
        tone="danger"
        icon={<AlertTriangle size={16} />}
      />
    </div>
  );
}
