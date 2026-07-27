import { describe, expect, it } from 'vitest';
import { permissions } from '@/config/permissions';
describe('permissions', () => {
  it('USER pode criar', () => expect(permissions.canCreate(['USER'])).toBe(true));
  it('DEJUR vê aprovadas', () => expect(permissions.canViewAdminApproved(['DEJUR'])).toBe(true));
  it('ADMIN pode gerenciar tudo', () => expect(permissions.canManageAll(['ADMIN'])).toBe(true));
  it('sem role não possui permissões', () => expect(permissions.canCreate([])).toBe(false));
});
