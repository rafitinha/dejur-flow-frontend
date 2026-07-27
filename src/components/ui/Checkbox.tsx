import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export function Checkbox({
  checked,
  onCheckedChange,
  label,
  disabled,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}) {
  return (
    <label className="inline-flex items-center gap-2">
      <CheckboxPrimitive.Root
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(Boolean(value))}
        disabled={disabled}
        className={cn(
          'inline-flex size-4 items-center justify-center rounded-sm border border-input bg-background text-primary shadow-xs focus-ring disabled:opacity-50',
        )}
      >
        <CheckboxPrimitive.Indicator>
          <Check size={12} />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      {label && <span className="text-sm text-foreground">{label}</span>}
    </label>
  );
}
