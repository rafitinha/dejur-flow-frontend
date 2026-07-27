import type { Account, NextAuthOptions, Profile } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import AzureADProvider from 'next-auth/providers/azure-ad';
import { getUserProfilePhoto, isProfilePhotoFresh } from './profile';
import type { Role } from '@/features/requests/types';

export const REFRESH_ACCESS_TOKEN_ERROR = 'RefreshAccessTokenError' as const;

export function mapGroupsToRoles(groups: string[]): Role[] {
  const roles = new Set<Role>(['USER']);
  const dejur = process.env.AUTH_ENTRA_GROUP_DEJUR;
  const admin = process.env.AUTH_ENTRA_GROUP_ADMIN;
  if (dejur && groups.includes(dejur)) roles.add('DEJUR');
  if (admin && groups.includes(admin)) roles.add('ADMIN');
  return [...roles];
}

export async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const tenant = process.env.AUTH_MICROSOFT_ENTRA_TENANT_ID;
    const clientId = process.env.AUTH_MICROSOFT_ENTRA_ID_ID;
    const secret = process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET;
    if (!token.refreshToken || !tenant || !clientId || !secret) throw new Error('Incomplete refresh configuration');
    const response = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: secret,
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken,
        scope: process.env.AUTH_MICROSOFT_ENTRA_SCOPE ?? 'openid profile email offline_access User.Read',
      }),
    });
    const result = (await response.json()) as { access_token?: string; expires_in?: number; refresh_token?: string };
    if (!response.ok || !result.access_token) throw new Error('Refresh rejected');
    return {
      ...token,
      accessToken: result.access_token,
      accessTokenExpires: Date.now() + (result.expires_in ?? 3600) * 1000,
      refreshToken: result.refresh_token ?? token.refreshToken,
      error: undefined,
    };
  } catch {
    return { ...token, error: REFRESH_ACCESS_TOKEN_ERROR };
  }
}

export async function updateAuthToken({ token: initialToken, account, profile, now = Date.now() }: {
  token: JWT; account?: Account | null; profile?: Profile; now?: number;
}): Promise<JWT> {
  let token = initialToken;
  if (account) {
    const raw = (profile ?? {}) as Record<string, unknown>;
    const groups = Array.isArray(raw.groups) ? raw.groups.filter((value): value is string => typeof value === 'string') : [];
    const read = (key: string) => typeof raw[key] === 'string' ? raw[key] as string : undefined;
    token = {
      ...token,
      accessToken: account.access_token,
      accessTokenExpires: account.expires_at ? account.expires_at * 1000 : now + 3600_000,
      refreshToken: account.refresh_token,
      roles: mapGroupsToRoles(groups), groups,
      jobTitle: read('jobTitle'), department: read('department'), companyName: read('companyName'),
    };
  } else if (token.accessTokenExpires && now >= token.accessTokenExpires) {
    token = await refreshAccessToken(token);
  }
  if (token.accessToken && !token.error && !isProfilePhotoFresh(token.photoUpdatedAt, now)) {
    try {
      token.photo = await getUserProfilePhoto(token.accessToken);
      token.photoUpdatedAt = new Date(now).toISOString();
    } catch { /* A foto não pode impedir a autenticação. */ }
  }
  token.roles ??= ['USER'];
  return token;
}

export const authOptions: NextAuthOptions = {
  providers: [AzureADProvider({
    clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID!,
    clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET!,
    tenantId: process.env.AUTH_MICROSOFT_ENTRA_TENANT_ID!,
    authorization: { params: { scope: process.env.AUTH_MICROSOFT_ENTRA_SCOPE ?? 'openid profile email offline_access User.Read' } },
  })],
  callbacks: {
    jwt: ({ token, account, profile }) => updateAuthToken({ token, account, profile }),
    async session({ session, token }) {
      session.user = { ...session.user, roles: token.roles ?? ['USER'], groups: token.groups ?? [], photo: token.photo, photoUpdatedAt: token.photoUpdatedAt, jobTitle: token.jobTitle, department: token.department, companyName: token.companyName };
      session.accessToken = token.accessToken;
      session.error = token.error;
      return session;
    },
  },
  pages: { signIn: '/login' },
};
