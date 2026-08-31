'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  getUserProfilePhoto,
  persistProfilePhotoToStorage,
  readProfilePhotoFromStorage,
} from '@/features/authentication/profile';
import { cn } from '@/lib/utils/cn';

const initials = (name?: string | null) =>
  (name ?? 'Usuário')
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

export function Profile({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  const { data, status } = useSession();
  const [photo, setPhoto] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (status !== 'authenticated' || !data?.user) return;

    const cacheKey = data.user.email ?? data.user.name ?? 'anonymous';
    let cancelled = false;

    void (async () => {
      setPhoto(undefined);

      const cached = readProfilePhotoFromStorage(cacheKey);
      if (cached) {
        if (!cancelled) setPhoto(cached);
        return;
      }

      if (!data.accessToken) {
        if (!cancelled) setPhoto(data.user.image ?? undefined);
        return;
      }

      try {
        const fetchedPhoto = await getUserProfilePhoto(data.accessToken);
        if (!cancelled && fetchedPhoto) {
          persistProfilePhotoToStorage(fetchedPhoto, cacheKey, 'session');
          setPhoto(fetchedPhoto);
          return;
        }
        if (!cancelled) setPhoto(data.user.image ?? undefined);
      } catch {
        if (!cancelled) setPhoto(data.user.image ?? undefined);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [data?.accessToken, data?.user, status]);

  if (status !== 'authenticated' || !data?.user) return null;

  const user = data.user;
  const avatar = photo ?? user.image ?? undefined;

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {avatar ? (
        <img src={avatar} alt="" className="size-9 rounded-full object-cover" />
      ) : (
        <span className="grid size-9 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
          {initials(user.name)}
        </span>
      )}
      {!compact && (
        <div className="min-w-0 text-xs">
          <p className="truncate font-semibold">{user.name}</p>
          <p className="truncate text-muted-foreground">{user.email}</p>
          {(user.jobTitle || user.companyName) && (
            <p className="truncate text-muted-foreground">
              {[user.jobTitle, user.companyName].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
