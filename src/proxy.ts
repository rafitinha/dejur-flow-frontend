import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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
      function middleware(_req: NextRequest) {
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
  : function proxy(_req: NextRequest) {
      return NextResponse.next();
    };

export function proxy(request: NextRequest) {
  return authProxy(request);
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/solicitacoes/:path*',
    '/admin/:path*',
    '/notificacoes/:path*',
  ],
};
