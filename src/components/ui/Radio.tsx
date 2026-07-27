import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { Circle } from 'lucide-react';

export function RadioGroup({
  value,
  onValueChange,
  options,
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <RadioGroupPrimitive.Root
      value={value}
      onValueChange={onValueChange}
      className="grid gap-2"
    >
      {options.map((option) => (
        <label key={option.value} className="inline-flex items-center gap-2">
          <RadioGroupPrimitive.Item
            value={option.value}
            className="inline-flex size-4 items-center justify-center rounded-full border border-input bg-background text-primary shadow-xs focus-ring"
          >
            <RadioGroupPrimitive.Indicator>
              <Circle size={8} className="fill-current" />
            </RadioGroupPrimitive.Indicator>
          </RadioGroupPrimitive.Item>
          <span className="text-sm text-foreground">{option.label}</span>
        </label>
      ))}
    </RadioGroupPrimitive.Root>
  );
}
