import { BellDot } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function NotificationsPage() {
  return (
    <section className="space-y-4">
      <div>
        <p className="text-label">Central</p>
        <h1 className="text-heading">Notificações</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-subtitle">
            <BellDot size={16} /> Atualizações recentes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-md border border-border/80 bg-background/40 p-4">
            <p className="font-medium text-foreground">Solicitação aprovada</p>
            <p className="text-body">
              REQ-2026-07-03-000001 foi aprovada pela LLM e encaminhada ao
              DEJUR.
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
