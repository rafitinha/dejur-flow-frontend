import { NextAuthOptions } from 'next-auth';
import AzureADProvider from 'next-auth/providers/azure-ad';

export const authOptions: NextAuthOptions = {
  providers: [
    AzureADProvider({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID!,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET!,
      tenantId: process.env.AUTH_MICROSOFT_ENTRA_TENANT_ID!,
      authorization: {
        params: {
          scope: process.env.AUTH_MICROSOFT_ENTRA_SCOPE,
        },
      },
    }),
  ],

  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }

      // TODO: Mapear grupos/roles vindos do Entra ID ou do backend.
      token.roles = token.roles ?? ['USER'];

      return token;
    },

    async session({ session, token }) {
      session.user = {
        ...session.user,
        roles: token.roles ?? ['USER'],
      };
      session.accessToken = token.accessToken;

      return session;
    },
  },
};
