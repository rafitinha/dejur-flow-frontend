'use client';
import { useEffect } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';

export function SessionHandler() {
  const { data: session, status } = useSession();
  useEffect(() => {
    if (status === 'authenticated' && session?.error) {
      void signOut({ redirect: false }).then(() => signIn('microsoft-entra-id', { callbackUrl: '/dashboard' }));
    }
  }, [session?.error, status]);
  return null;
}
