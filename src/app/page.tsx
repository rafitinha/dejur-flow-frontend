import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowRight, Building2, Sparkles } from 'lucide-react';
import { buttonVariants } from '@/components/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';

import { CookieConsentClient } from '@/features/privacy/CookieConsentClient';

export default function HomePage() {
  return (
    <main className="min-h-screen px-6 py-16 md:px-8">
      <section className="mx-auto max-w-5xl">
        <Card className="overflow-hidden border-border/80 bg-card/95 p-0 shadow-lg">
          <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
            <CardContent className="space-y-6 p-8 md:p-10">
              <p className="text-label text-primary">GEQ • DEJUR</p>
              <h1 className="text-display">
                Validador Judicial com IA para operações corporativas
              </h1>
              <CardDescription className="max-w-xl text-base leading-7 text-muted-foreground">
                Plataforma empresarial para criação, validação e aprovação de
                solicitações judiciais com trilha de auditoria, checklist
                estruturado e assistência LLM.
              </CardDescription>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/login"
                  className={buttonVariants({ variant: 'primary', size: 'lg' })}
                >
                  Entrar com Microsoft
                </Link>
                <Link
                  href="/dashboard"
                  className={buttonVariants({ variant: 'outline', size: 'lg' })}
                >
                  Acessar ambiente <ArrowRight size={16} />
                </Link>
              </div>
            </CardContent>
            <div className="border-l border-border/70 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 p-8 md:p-10">
              <CardHeader className="mb-6 p-0">
                <CardTitle className="text-subtitle">Diferenciais</CardTitle>
              </CardHeader>
              <div className="space-y-4">
                <FeatureRow
                  icon={<Sparkles size={16} />}
                  text="Triagem inteligente com LLM"
                />
                <FeatureRow
                  icon={<Building2 size={16} />}
                  text="Governança para operação jurídica enterprise"
                />
                <FeatureRow
                  icon={<ArrowRight size={16} />}
                  text="Fluxo ponta a ponta: abertura até aprovação"
                />
              </div>
            </div>
          </div>
        </Card>
      </section>
      <CookieConsentClient />
    </main>
  );
}

function FeatureRow({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-border/70 bg-surface/80 p-3 text-sm text-foreground">
      <span className="inline-flex size-8 items-center justify-center rounded-md bg-primary/15 text-primary">
        {icon}
      </span>
      <span>{text}</span>
    </div>
  );
}
