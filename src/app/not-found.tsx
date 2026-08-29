import Link from 'next/link';
import { ClipboardList, FileQuestion, Home, Scale } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

export default function NotFound() {
  return (
    <main className="flex min-h-[calc(100dvh-5rem)] items-center bg-background py-10">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
        <Card className="border-border bg-card shadow-sm">
          <CardContent className="flex flex-col items-center gap-6 p-6 text-center sm:p-10">
            <div className="flex size-16 items-center justify-center rounded-full bg-muted text-primary">
              <Scale aria-hidden="true" className="size-8" />
            </div>

            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-sm font-medium text-muted-foreground">
                <FileQuestion aria-hidden="true" className="size-4" />
                Erro 404
              </div>

              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Página não encontrada
              </h1>

              <p className="mx-auto max-w-2xl text-base leading-7 text-muted-foreground">
                Não foi possível localizar o conteúdo solicitado. O endereço
                pode estar incorreto, ter sido atualizado ou não estar mais
                disponível.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link
                href="/"
                className={buttonVariants({ variant: 'primary', size: 'md' })}
              >
                <Home aria-hidden="true" className="size-4" />
                Voltar para o início
              </Link>

              <Link
                href="/solicitacoes"
                className={buttonVariants({ variant: 'outline', size: 'md' })}
              >
                <ClipboardList aria-hidden="true" className="size-4" />
                Minhas solicitações
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
