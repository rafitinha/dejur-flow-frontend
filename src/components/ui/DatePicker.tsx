import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export function DatePicker({
  value,
  onChange,
  min,
  max,
  disabled,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  disabled?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <Calendar
        size={14}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
      />
      <input
        type="date"
        value={value}
        min={min}
        max={max}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={cn('field-base pl-9')}
      />
    </div>
  );
}
