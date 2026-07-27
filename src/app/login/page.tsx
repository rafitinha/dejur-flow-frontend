'use client';
import { LogIn } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-title">Entrar</CardTitle>
          <CardDescription>
            Use sua conta corporativa Microsoft para acessar o Validador
            Judicial.
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
        </CardContent>
      </Card>
    </main>
  );
}
