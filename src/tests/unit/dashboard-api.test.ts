import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getDashboardSummary, PeriodType } from '@/features/requests/api';

describe('dashboard api', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          period: {
            type: 'LAST_7_DAYS',
            startDate: '2026-08-26',
            endDate: '2026-09-01',
          },
          indicators: {
            underAiAnalysis: {
              count: 11,
              variation: -2,
              comparisonPeriod: 'YESTERDAY',
            },
            approved: {
              count: 28,
              approvalRate: 92,
              comparisonPeriod: 'PREVIOUS_PERIOD',
            },
            rejected: {
              count: 2,
              hasReasonsForReview: true,
              comparisonPeriod: 'PREVIOUS_PERIOD',
            },
          },
          checklistTypeDistribution: [],
          totalChecklists: 68,
          lastUpdatedAt: '2026-09-01T15:42:00-03:00',
        }),
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('faz a chamada do dashboard summary com periodType e token', async () => {
    await getDashboardSummary(PeriodType.LAST_7_DAYS, 'token-456');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(
        '/api/v1/dashboard/summary?periodType=LAST_7_DAYS',
      ),
      expect.objectContaining({
        headers: { Authorization: 'Bearer token-456' },
      }),
    );
  });
});
