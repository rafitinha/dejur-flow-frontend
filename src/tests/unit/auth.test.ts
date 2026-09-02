import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  refreshAccessToken,
  updateAuthToken,
} from '@/features/authentication/auth';
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
describe('auth token', () => {
  it('mantém token válido quando ainda há mais de 10 minutos de vida', async () => {
    const token = {
      accessToken: 'valid',
      accessTokenExpires: Date.now() + 15 * 60_000,
      photoUpdatedAt: new Date().toISOString(),
    };
    await expect(updateAuthToken({ token })).resolves.toMatchObject({
      accessToken: 'valid',
    });
  });

  it('renova token quando falta menos de 10 minutos para expirar', async () => {
    vi.stubEnv('AUTH_MICROSOFT_ENTRA_TENANT_ID', 'tenant');
    vi.stubEnv('AUTH_MICROSOFT_ENTRA_ID_ID', 'client');
    vi.stubEnv('AUTH_MICROSOFT_ENTRA_ID_SECRET', 'secret');
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response(
            JSON.stringify({ access_token: 'new', expires_in: 3600 }),
            { status: 200 },
          ),
        ),
    );

    const token = {
      accessToken: 'current',
      refreshToken: 'refresh',
      accessTokenExpires: Date.now() + 5 * 60_000,
    };
    await expect(updateAuthToken({ token })).resolves.toMatchObject({
      accessToken: 'new',
      error: undefined,
    });
  });

  it('renova token expirado', async () => {
    vi.stubEnv('AUTH_MICROSOFT_ENTRA_TENANT_ID', 'tenant');
    vi.stubEnv('AUTH_MICROSOFT_ENTRA_ID_ID', 'client');
    vi.stubEnv('AUTH_MICROSOFT_ENTRA_ID_SECRET', 'secret');
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response(
            JSON.stringify({ access_token: 'new', expires_in: 3600 }),
            { status: 200 },
          ),
        ),
    );
    await expect(
      refreshAccessToken({ refreshToken: 'refresh' }),
    ).resolves.toMatchObject({ accessToken: 'new', error: undefined });
  });

  it('limpa sessão quando o refresh falha', async () => {
    vi.stubEnv('AUTH_MICROSOFT_ENTRA_TENANT_ID', 'tenant');
    vi.stubEnv('AUTH_MICROSOFT_ENTRA_ID_ID', 'client');
    vi.stubEnv('AUTH_MICROSOFT_ENTRA_ID_SECRET', 'secret');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: 'invalid_grant' }), {
          status: 400,
        }),
      ),
    );

    const token = {
      accessToken: 'stale',
      refreshToken: 'refresh',
      accessTokenExpires: Date.now() + 5_000,
    };
    await expect(updateAuthToken({ token })).resolves.toMatchObject({
      accessToken: undefined,
      refreshToken: undefined,
      error: 'RefreshAccessTokenError',
    });
  });

  it('sinaliza refresh inválido', async () => {
    await expect(refreshAccessToken({})).resolves.toMatchObject({
      error: 'RefreshAccessTokenError',
    });
  });
});
