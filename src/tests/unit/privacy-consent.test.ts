import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearConsent,
  getDefaultPreferences,
  loadStoredConsent,
  saveConsent,
} from '@/features/privacy/consent-storage';

describe('privacy consent storage', () => {
  beforeEach(() => {
    clearConsent();
  });

  it('salva e recupera preferências de consentimento', () => {
    const preferences = {
      ...getDefaultPreferences(),
      functional: true,
      analytics: true,
    };

    saveConsent(preferences);

    const stored = loadStoredConsent();

    expect(stored?.preferences).toEqual(preferences);
    expect(stored?.version).toBe('v1');
  });

  it('limpa o estado quando o consentimento é removido', () => {
    saveConsent(getDefaultPreferences());
    clearConsent();

    expect(loadStoredConsent()).toBeNull();
  });
});
