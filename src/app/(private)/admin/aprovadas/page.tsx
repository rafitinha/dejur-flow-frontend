import { Filter, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { StatusTag } from '@/components/ui/StatusTag';

export default function ApprovedAdminPage() {
  return (
    <section className="space-y-5">
      <div>
        <p className="text-label">Administrativo</p>
        <h1 className="text-heading">
          DEJUR — Solicitações aprovadas pela LLM
        </h1>
        <p className="text-body mt-1">
          Disponível apenas para perfis DEJUR e ADMIN.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-subtitle">
            <Filter size={16} /> Filtros avançados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 xl:grid-cols-5">
            <Input placeholder="Data inicial" type="date" />
            <Input placeholder="Data final" type="date" />
            <Input placeholder="Tipo" />
            <Input placeholder="Usuário originador" />
            <Input placeholder="CNPJ" />
          </div>
          <Button variant="secondary" className="w-fit">
            <Sparkles size={14} /> Aplicar filtros
          </Button>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border/80 bg-background/40 p-3">
            <span className="text-sm text-foreground">
              REQ-2026-07-03-000001 • Multa Contratual • Score 0.94
            </span>
            <StatusTag status="APPROVED" />
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
