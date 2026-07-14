import { Role } from '@/features/requests/types';
export const permissions = {
  canCreate: (roles: Role[]) => roles.includes('USER') || roles.includes('DEJUR') || roles.includes('ADMIN'),
  canViewAdminApproved: (roles: Role[]) => roles.includes('DEJUR') || roles.includes('ADMIN'),
  canManageAll: (roles: Role[]) => roles.includes('ADMIN'),
};
