'use client';

import { useId, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export function Combobox({
  value,
  onValueChange,
  options,
  placeholder,
  disabled,
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
}) {
  const [query, setQuery] = useState(value);
  const listId = useId();

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return options;
    return options.filter((option) =>
      option.toLowerCase().includes(normalized),
    );
  }, [options, query]);

  return (
    <div className="relative">
      <Search
        size={14}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
      />
      <input
        value={query}
        onChange={(event) => {
          const nextValue = event.target.value;
          setQuery(nextValue);
          onValueChange(nextValue);
        }}
        list={listId}
        className={cn('field-base pl-9')}
        placeholder={placeholder ?? 'Pesquisar...'}
        disabled={disabled}
      />
      <datalist id={listId}>
        {filtered.map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>
    </div>
  );
}
