import type { DefaultSession } from 'next-auth';
import type { Role } from '@/features/requests/types';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    error?: 'RefreshAccessTokenError';
    user: DefaultSession['user'] & {
      roles: Role[];
      groups: string[];
      jobTitle?: string;
      department?: string;
      companyName?: string;
    };
  }
}
declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    accessTokenExpires?: number;
    refreshToken?: string;
    roles?: Role[];
    groups?: string[];
    jobTitle?: string;
    department?: string;
    companyName?: string;
    error?: 'RefreshAccessTokenError';
  }
}
