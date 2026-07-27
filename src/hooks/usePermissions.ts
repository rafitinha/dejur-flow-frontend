'use client';
import { useSession } from 'next-auth/react';
import { permissions } from '@/config/permissions';
export function usePermissions() {
  const { data, status } = useSession(); const roles = data?.user.roles ?? [];
  return { roles, isLoading: status === 'loading', canCreate: permissions.canCreate(roles), canViewAdminApproved: permissions.canViewAdminApproved(roles), canManageAll: permissions.canManageAll(roles) };
}
