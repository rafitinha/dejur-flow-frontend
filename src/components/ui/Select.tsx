import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export function Select({
  value,
  onValueChange,
  placeholder,
  options,
  disabled,
}: {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  options: { value: string; label: string }[];
  disabled?: boolean;
}) {
  return (
    <SelectPrimitive.Root
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <SelectPrimitive.Trigger
        className={cn('field-base flex items-center justify-between gap-2')}
      >
        <SelectPrimitive.Value placeholder={placeholder ?? 'Selecione...'} />
        <SelectPrimitive.Icon>
          <ChevronDown size={14} />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content className="z-50 overflow-hidden rounded-md border border-border bg-card text-foreground shadow-lg">
          <SelectPrimitive.Viewport className="p-1">
            {options.map((item) => (
              <SelectPrimitive.Item
                key={item.value}
                value={item.value}
                className="relative flex cursor-pointer select-none items-center rounded-sm py-2 pl-8 pr-3 text-sm outline-none hover:bg-hover focus:bg-hover"
              >
                <SelectPrimitive.ItemIndicator className="absolute left-2 inline-flex items-center">
                  <Check size={14} />
                </SelectPrimitive.ItemIndicator>
                <SelectPrimitive.ItemText>
                  {item.label}
                </SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
