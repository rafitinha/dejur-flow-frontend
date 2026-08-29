import type { ConsentPreferences, StoredConsent } from './types';

const STORAGE_KEY = 'validador-consent';
const CONSENT_VERSION = 'v1';

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
}

export function loadStoredConsent(): StoredConsent | null {
  const storage = getStorage();
  if (!storage) return null;

  try {
    const value = storage.getItem(STORAGE_KEY);
    if (!value) return null;
    return JSON.parse(value) as StoredConsent;
  } catch {
    return null;
  }
}

export function saveConsent(preferences: ConsentPreferences) {
  const storage = getStorage();
  if (!storage) return;

  const consent: StoredConsent = {
    version: CONSENT_VERSION,
    decidedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    preferences,
  };

  storage.setItem(STORAGE_KEY, JSON.stringify(consent));
}

export function clearConsent() {
  const storage = getStorage();
  if (!storage) return;
  storage.removeItem(STORAGE_KEY);
}

export function getDefaultPreferences(): ConsentPreferences {
  return {
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false,
  };
}

export function shouldShowConsentBanner(consent: StoredConsent | null) {
  return !consent || consent.version !== CONSENT_VERSION;
}
