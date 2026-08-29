'use client';

import { useEffect, useState } from 'react';
import { Cookie, ShieldCheck, Settings } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/Checkbox';
import { Modal } from '@/components/ui/Modal';
import {
  getDefaultPreferences,
  loadStoredConsent,
  saveConsent,
  shouldShowConsentBanner,
} from './consent-storage';
import type {
  ConsentPreferences,
  CookieCategory,
  StoredConsent,
} from './types';

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
  const [consent, setConsent] = useState<StoredConsent | null>(null);
  const [open, setOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences>(
    getDefaultPreferences(),
  );

  useEffect(() => {
    const stored = loadStoredConsent();
    setConsent(stored);
    setOpen(shouldShowConsentBanner(stored));
    if (stored?.preferences) {
      setPreferences(stored.preferences);
    }
  }, []);

  function persistPreferences(nextPreferences: ConsentPreferences) {
    saveConsent(nextPreferences);
    setConsent({
      version: 'v1',
      decidedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      preferences: nextPreferences,
    });
    setPreferences(nextPreferences);
    setIsModalOpen(false);
    setOpen(false);
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

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-50 p-4">
        <Card className="mx-auto max-w-5xl border-border bg-card/95 shadow-xl backdrop-blur">
          <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-start md:justify-between md:p-5">
            <div className="flex gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-muted text-primary">
                <Cookie aria-hidden="true" className="size-5" />
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

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => persistPreferences(getDefaultPreferences())}
              >
                Rejeitar opcionais
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  persistPreferences({
                    ...getDefaultPreferences(),
                    functional: true,
                    analytics: true,
                    marketing: true,
                  })
                }
              >
                Aceitar todos
              </Button>
              <Button size="sm" onClick={() => setIsModalOpen(true)}>
                <Settings aria-hidden="true" className="size-4" />
                Configurar cookies
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Modal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title="Preferências de cookies"
        description="Escolha quais categorias de cookies você aceita para personalizar a sua experiência."
      >
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
                  <p className="font-medium text-foreground">{item.title}</p>
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
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => persistPreferences(preferences)}>
              Salvar preferências
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
