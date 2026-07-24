import { describe, expect, it } from 'vitest';
import { statusLabels } from '@/config/status';
describe('statusLabels', () => {
  it('traduz APPROVED', () => {
    expect(statusLabels.APPROVED).toBe('Aprovada');
  });
});
