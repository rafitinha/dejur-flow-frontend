'use client';

import dynamic from 'next/dynamic';

const CookieConsentBanner = dynamic(
  () =>
    import('./CookieConsentBanner').then(
      (module) => module.CookieConsentBanner,
    ),
  {
    ssr: false,
  },
);

export function CookieConsentClient() {
  return <CookieConsentBanner />;
}
