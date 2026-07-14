'use client';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm border">
        <h1 className="text-2xl font-bold">Entrar</h1>
        <p className="mt-2 text-slate-600">Use sua conta corporativa Microsoft para acessar.</p>
        <button onClick={() => signIn('microsoft-entra-id', { callbackUrl: '/dashboard' })} className="mt-6 w-full rounded-lg bg-brand-700 px-4 py-2 text-white">
          Entrar com Microsoft
        </button>
      </section>
    </main>
  );
}
