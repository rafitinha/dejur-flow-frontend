import { ChecklistType } from '@/features/requests/types';
import { cn } from '@/lib/utils/cn';

const options: { value: ChecklistType; title: string; description: string }[] =
  [
    {
      value: 'RECUPERACAO_VASILHAMES',
      title: 'Recuperação de Vasilhames',
      description: 'Contrato de comodato, NF, notificação, AR e evidências.',
    },
    {
      value: 'COBRANCA_TITULOS',
      title: 'Cobrança de Títulos',
      description:
        'Cheque, duplicata, nota promissória, confissão de dívida ou contratos.',
    },
    {
      value: 'COBRANCA_MULTA_CONTRATUAL',
      title: 'Cobrança de Multa Contratual',
      description: 'Contrato descumprido, cálculo, notificação e pareceres.',
    },
  ];

export function ChecklistTypeSelector({
  value,
  onChange,
  disabled,
}: {
  value?: ChecklistType;
  onChange: (v: ChecklistType) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {options.map((o) => (
        <button
          type="button"
          key={o.value}
          onClick={() => {
            if (disabled) return;
            onChange(o.value);
          }}
          className={cn(
            'surface-card interactive-muted p-4 text-left transition-all focus-ring',
            value === o.value
              ? 'border-primary/80 bg-primary/10 ring-1 ring-primary/35'
              : 'hover:border-primary/30',
            disabled && 'cursor-not-allowed opacity-60',
          )}
          aria-pressed={value === o.value}
          aria-disabled={disabled}
          disabled={disabled}
        >
          <h3 className="text-base font-semibold text-foreground">{o.title}</h3>
          <p className="mt-2 text-body">{o.description}</p>
        </button>
      ))}
    </div>
  );
}
