import { afterEach, describe, expect, it, vi } from 'vitest';
import { lookupPostalCode } from '@/features/address/cep';

describe('cep service', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('falls back to the second provider when the first one fails', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error('via cep unavailable'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          cep: '60165-000',
          street: 'Rua Example',
          neighborhood: 'Meireles',
          city: 'Fortaleza',
          state: 'CE',
        }),
      });

    vi.stubGlobal('fetch', fetchMock);

    const result = await lookupPostalCode('60165000');

    expect(result).toEqual({
      street: 'Rua Example',
      district: 'Meireles',
      city: 'Fortaleza',
      state: 'CE',
      country: 'Brazil',
      number: null,
      complement: null,
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('returns null when all providers fail', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('all providers failed')),
    );

    await expect(lookupPostalCode('00000000')).resolves.toBeNull();
  });
});
