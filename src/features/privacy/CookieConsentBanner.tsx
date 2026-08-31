'use client';

import { useState } from 'react';
import { Cookie, ShieldCheck, Settings, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/Checkbox';

import {
  getDefaultPreferences,
  loadStoredConsent,
  saveConsent,
  shouldShowConsentBanner,
} from './consent-storage';

import type { ConsentPreferences, CookieCategory } from './types';

const COOKIE_DESCRIPTIONS: Array<{
  key: Exclude<CookieCategory, 'necessary'>;
  title: string;
  description: string;
}> = [
  {
    key: 'functional',
    title: 'Funcionais',
    description:
      'Melhoram a navegação, lembram preferências e mantêm o site mais confortável.',
  },
  {
    key: 'analytics',
    title: 'Analíticos',
    description:
      'Ajudam a entender como as páginas são utilizadas e a melhorar a experiência.',
  },
  {
    key: 'marketing',
    title: 'Marketing',
    description:
      'Permitem a entrega de mensagens e conteúdos mais relevantes para você.',
  },
];

export function CookieConsentBanner() {
  const pathname = usePathname();

  const [open, setOpen] = useState(() => {
    const stored = loadStoredConsent();

    return shouldShowConsentBanner(stored);
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [preferences, setPreferences] = useState<ConsentPreferences>(() => {
    const stored = loadStoredConsent();

    return stored?.preferences ?? getDefaultPreferences();
  });

  const isEntryScreen = pathname === '/' || pathname === '/login';

  if (!isEntryScreen || !open) {
    return null;
  }

  function persistPreferences(nextPreferences: ConsentPreferences) {
    saveConsent(nextPreferences);

    setPreferences(nextPreferences);
    setIsModalOpen(false);
    setOpen(false);
  }

  function handleDismissBanner() {
    persistPreferences(preferences);
  }

  function handleRejectOptionals() {
    persistPreferences(getDefaultPreferences());
  }

  function handleAcceptAll() {
    persistPreferences({
      ...getDefaultPreferences(),
      functional: true,
      analytics: true,
      marketing: true,
    });
  }

  function handleOpenPreferences() {
    setIsModalOpen(true);
  }

  function handleClosePreferences() {
    setIsModalOpen(false);
  }

  function handleSavePreferences() {
    persistPreferences(preferences);
  }

  function updatePreference(
    category: Exclude<CookieCategory, 'necessary'>,
    value: boolean,
  ) {
    setPreferences((current) => ({
      ...current,
      [category]: value,
    }));
  }

  return (
    <>
      <div className="pointer-events-auto fixed inset-x-0 bottom-3 z-50 px-3 sm:px-4">
        <Card
          className="mx-auto max-w-4xl border border-border/80 bg-card/95 shadow-[0_18px_48px_rgba(15,23,42,0.18)] backdrop-blur-sm"
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex justify-end p-2">
            <button
              type="button"
              aria-label="Fechar banner de privacidade"
              onClick={handleDismissBanner}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition hover:bg-hover"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          </div>

          <CardContent className="flex flex-col gap-4 p-4 pt-0 md:flex-row md:items-center md:justify-between md:p-5 md:pt-0">
            <div className="flex gap-3">
              <div className="flex flex-col items-center gap-2">
                <div className="flex size-10 items-center justify-center rounded-full bg-muted text-primary">
                  <Cookie aria-hidden="true" className="size-5" />
                </div>

                <button
                  type="button"
                  aria-label="Configurar cookies"
                  title="Configurar cookies"
                  onClick={handleOpenPreferences}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-foreground shadow-xs transition hover:bg-hover"
                >
                  <Settings aria-hidden="true" className="size-4" />
                </button>
              </div>

              <div className="space-y-2">
                <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <ShieldCheck aria-hidden="true" className="size-4" />
                  Privacidade e cookies
                </p>

                <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                  Utilizamos cookies necessários para o funcionamento do site.
                  Com sua autorização, também podemos utilizar categorias
                  opcionais descritas nas preferências abaixo.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-stretch justify-center gap-2 md:justify-end">
              <button
                type="button"
                onClick={handleRejectOptionals}
                className="inline-flex min-w-[170px] flex-1 items-center justify-center rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition hover:bg-hover md:flex-none"
              >
                Rejeitar opcionais
              </button>

              <button
                type="button"
                onClick={handleAcceptAll}
                className="inline-flex min-w-[170px] flex-1 items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 md:flex-none"
              >
                Aceitar todos
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {isModalOpen && (
        <div className="pointer-events-auto fixed inset-0 z-[60] flex items-center justify-center bg-foreground/30 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-xl rounded-xl border border-border bg-card p-6 text-card-foreground shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-title">Preferências de cookies</h2>

                <p className="mt-1 text-body text-muted-foreground">
                  Escolha quais categorias de cookies você aceita para
                  personalizar a sua experiência.
                </p>
              </div>

              <button
                type="button"
                aria-label="Fechar preferências de cookies"
                onClick={handleClosePreferences}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition hover:bg-hover"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-background/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">Essenciais</p>

                    <p className="text-sm text-muted-foreground">
                      Sempre ativos para o funcionamento do portal.
                    </p>
                  </div>

                  <Checkbox
                    checked={preferences.necessary}
                    onCheckedChange={() => undefined}
                    label=""
                    disabled
                  />
                </div>
              </div>

              {COOKIE_DESCRIPTIONS.map((item) => (
                <div
                  key={item.key}
                  className="rounded-lg border border-border bg-background/70 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">
                        {item.title}
                      </p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>

                    <Checkbox
                      checked={preferences[item.key]}
                      onCheckedChange={(checked) =>
                        updatePreference(item.key, checked)
                      }
                      label=""
                    />
                  </div>
                </div>
              ))}

              <div className="flex flex-wrap justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleClosePreferences}
                  className="inline-flex items-center justify-center rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition hover:bg-hover"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleSavePreferences}
                  className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                >
                  Salvar preferências
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
