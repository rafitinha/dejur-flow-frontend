import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { listMyRequests } from '@/features/requests/api';

describe('requests api filters', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ items: [], totalCount: 0 }),
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('serializa userIds no query string', async () => {
    await listMyRequests(
      {
        userIds: '1,2',
        pageIndex: 0,
        pageSize: 10,
      },
      'token-123',
    );

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('userIds=1%2C2'),
      expect.objectContaining({
        headers: { Authorization: 'Bearer token-123' },
      }),
    );
  });
});
