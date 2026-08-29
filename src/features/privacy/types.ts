export type CookieCategory =
  'necessary' | 'functional' | 'analytics' | 'marketing';

export type ConsentPreferences = {
  necessary: true;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
};

export type StoredConsent = {
  version: string;
  decidedAt: string;
  updatedAt?: string;
  preferences: ConsentPreferences;
};
