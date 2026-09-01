'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Search, X } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/lib/utils/cn';

export type MultiSelectOption = {
  value: string;
  label: string;
  secondary?: string;
};

export function MultiSelect({
  value,
  options,
  onValueChange,
  placeholder = 'Selecione...',
  label,
  disabled,
}: {
  value: string[];
  options: MultiSelectOption[];
  onValueChange: (value: string[]) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
}) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setQuery('');
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const selectedOptions = useMemo(
    () => options.filter((option) => value.includes(option.value)),
    [options, value],
  );

  const filteredOptions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return options;

    return options.filter((option) => {
      const haystack = `${option.label} ${option.secondary ?? ''}`.toLowerCase();
      return haystack.includes(normalized);
    });
  }, [options, query]);

  function toggleValue(nextValue: string) {
    const nextValues = value.includes(nextValue)
      ? value.filter((item) => item !== nextValue)
      : [...value, nextValue];

    onValueChange(nextValues);
  }

  return (
    <div ref={containerRef} className={cn('relative', disabled && 'opacity-60')}>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        disabled={disabled}
        aria-label={label ?? placeholder}
        className={cn(
          'field-base flex w-full min-h-[42px] cursor-pointer items-center justify-between gap-2 rounded-lg border border-border/80 bg-background/90 px-3 py-2 text-left shadow-sm transition-all duration-200 hover:border-primary/30 hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20',
          isOpen && 'border-primary/40 ring-2 ring-primary/10',
        )}
      >
        <span className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
          {selectedOptions.length > 0 ? (
            <span className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
              <span className="inline-flex min-w-0 max-w-full items-center rounded-full border border-border bg-muted/80 px-2 py-1 text-xs text-foreground shadow-sm">
                <span className="truncate">{selectedOptions[0].label}</span>
              </span>
              {selectedOptions.length > 1 && (
                <span className="shrink-0 text-xs text-muted-foreground">
                  +{selectedOptions.length - 1}
                </span>
              )}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">{placeholder}</span>
          )}
        </span>
        <span className="flex items-center gap-1 text-muted-foreground">
          {selectedOptions.length > 0 && (
            <span
              className="inline-flex cursor-pointer items-center rounded-full p-1 hover:text-foreground"
              onClick={(event) => {
                event.stopPropagation();
                onValueChange([]);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  event.stopPropagation();
                  onValueChange([]);
                }
              }}
              role="button"
              tabIndex={0}
            >
              <X size={12} />
            </span>
          )}
          <Search size={14} />
        </span>
      </button>

      <Modal
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) setQuery('');
        }}
        title={label ?? 'Selecionar'}
        description="Pesquise e escolha os responsáveis."
      >
        <div className="space-y-4">
          <div className="relative">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Pesquisar por nome ou e-mail"
              className="field-base w-full rounded-md pl-9 text-sm"
              disabled={disabled}
              autoFocus
            />
          </div>

          <div className="max-h-[52vh] space-y-1 overflow-y-auto pr-1">
            {filteredOptions.length ? (
              filteredOptions.map((option) => {
                const isSelected = value.includes(option.value);

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      toggleValue(option.value);
                    }}
                    className={cn(
                      'flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition',
                      isSelected ? 'bg-muted text-foreground' : 'hover:bg-hover',
                    )}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{option.label}</span>
                      {option.secondary && (
                        <span className="block truncate text-xs text-muted-foreground">
                          {option.secondary}
                        </span>
                      )}
                    </span>
                    {isSelected && <Check size={14} className="text-primary" />}
                  </button>
                );
              })
            ) : (
              <p className="px-2 py-3 text-sm text-muted-foreground">
                Nenhum usuário encontrado.
              </p>
            )}
          </div>

          {selectedOptions.length > 0 && (
            <div className="border-t border-border pt-3">
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
                Selecionados
              </p>
              <div className="max-h-32 space-y-2 overflow-y-auto pr-1">
                {selectedOptions.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center justify-between gap-2 rounded-md border border-border bg-muted/50 px-2 py-1.5"
                  >
                    <span className="min-w-0 flex-1 truncate text-sm">{option.label}</span>
                    <button
                      type="button"
                      onClick={() => toggleValue(option.value)}
                      className="inline-flex cursor-pointer items-center text-muted-foreground transition hover:text-foreground"
                      aria-label={`Remover ${option.label}`}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
