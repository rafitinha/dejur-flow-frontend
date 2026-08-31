'use client';
import { LogIn } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { createElement } from 'react';
import { Button } from '@/components/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';

export default function LoginPage() {
  const router = useRouter();
  const authEnabled = process.env.NEXT_PUBLIC_ENABLE_AUTH_GUARD === 'true';
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="mb-2 flex-col items-start gap-2">
          <CardDescription className="text-sm leading-relaxed text-muted-foreground">
            Acesse com sua conta corporativa Microsoft para continuar no
            Validador Judicial.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() =>
              signIn('microsoft-entra-id', { callbackUrl: '/dashboard' })
            }
            className="w-full"
          >
            <LogIn size={16} /> Entrar com Microsoft
          </Button>
          {!authEnabled &&
            createElement(
              Button,
              {
                variant: 'outline',
                className: 'mt-3 w-full',
                onClick: () => router.push('/dashboard'),
              },
              'Acessar ambiente sem autenticação',
            )}
        </CardContent>
      </Card>
    </main>
  );
}
