import { withAuth, type NextRequestWithAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextFetchEvent, NextRequest } from 'next/server';

const isAuthGuardEnabled = process.env.ENABLE_AUTH_GUARD === 'true';

/**
 * Proxy de proteção de rotas.
 *
 * Quando ENABLE_AUTH_GUARD=false (desenvolvimento), todas as rotas privadas
 * são acessíveis sem autenticação.
 *
 * Quando ENABLE_AUTH_GUARD=true (produção), o withAuth do next-auth redireciona
 * para /login caso o usuário não esteja autenticado.
 */
const authProxy = isAuthGuardEnabled
  ? withAuth(
      function middleware(request: NextRequestWithAuth, event: NextFetchEvent) {
        void request;
        void event;
        return NextResponse.next();
      },
      {
        callbacks: {
          authorized: ({ token }) => !!token,
        },
        pages: {
          signIn: '/login',
        },
      },
    )
  : function proxy(request: NextRequest, event: NextFetchEvent) {
      void request;
      void event;
      return NextResponse.next();
    };

export function proxy(request: NextRequest, event: NextFetchEvent) {
  return authProxy(request as NextRequestWithAuth, event);
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/solicitacoes/:path*',
    '/admin/:path*',
    '/notificacoes/:path*',
  ],
};
