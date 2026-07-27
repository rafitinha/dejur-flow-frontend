import { afterEach, describe, expect, it, vi } from 'vitest';
import { getUserProfilePhoto, isProfilePhotoFresh, PROFILE_PHOTO_TTL_MS } from '@/features/authentication/profile';
afterEach(() => vi.unstubAllGlobals());
describe('profile photo', () => {
  it('considera cache menor que 24 horas válido', () => expect(isProfilePhotoFresh(new Date(1_000).toISOString(), 1_000 + PROFILE_PHOTO_TTL_MS - 1)).toBe(true));
  it('expira o cache após 24 horas', () => expect(isProfilePhotoFresh(new Date(1_000).toISOString(), 1_000 + PROFILE_PHOTO_TTL_MS)).toBe(false));
  it('converte foto em data URL', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(new Uint8Array([1, 2]), { headers: { 'content-type': 'image/jpeg' } })));
    await expect(getUserProfilePhoto('token')).resolves.toBe('data:image/jpeg;base64,AQI=');
  });
  it('aceita usuário sem foto', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 404 })));
    await expect(getUserProfilePhoto('token')).resolves.toBeUndefined();
  });
});
