'use client';
import { useSession } from 'next-auth/react';
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
  if (status !== 'authenticated' || !data?.user) return null;
  const user = data.user;
  return (
    <div className={cn('flex items-center gap-3', className)}>
      {user.photo || user.image ? (
        <img
          src={user.photo ?? user.image ?? ''}
          alt=""
          className="size-9 rounded-full object-cover"
        />
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
