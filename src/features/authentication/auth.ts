import { NextAuthOptions } from 'next-auth';
import AzureADProvider from 'next-auth/providers/azure-ad';

/**
 * Mapeia GUIDs de grupos do Entra ID para roles da aplicação.
 * Configure AUTH_ENTRA_GROUP_DEJUR e AUTH_ENTRA_GROUP_ADMIN no .env.
 */
function mapGroupsToRoles(groups: string[]): string[] {
  const roles: string[] = ['USER'];

  const dejurGroup = process.env.AUTH_ENTRA_GROUP_DEJUR;
  const adminGroup = process.env.AUTH_ENTRA_GROUP_ADMIN;

  if (dejurGroup && groups.includes(dejurGroup)) {
    roles.push('DEJUR');
  }

  if (adminGroup && groups.includes(adminGroup)) {
    roles.push('ADMIN');
  }

  return roles;
}

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
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
      }

      // Mapeamento de grupos do Entra ID para roles.
      // O Entra ID envia os grupos no campo `groups` do perfil (requer configuração
      // no manifesto do app Azure: "groupMembershipClaims": "SecurityGroup").
      const rawProfile = profile as Record<string, unknown> | undefined;
      const entraGroups: string[] = Array.isArray(rawProfile?.groups)
        ? (rawProfile.groups as string[])
        : [];

      token.roles = mapGroupsToRoles(entraGroups);

      return token;
    },

    async session({ session, token }) {
      session.user = {
        ...session.user,
        roles: (token.roles as string[]) ?? ['USER'],
      };
      session.accessToken = token.accessToken as string | undefined;

      return session;
    },
  },

  pages: {
    signIn: '/login',
  },
};
