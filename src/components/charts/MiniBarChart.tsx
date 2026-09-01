import { cn } from '@/lib/utils/cn';

export function MiniBarChart({
  values,
  labels,
  loading = false,
}: {
  values: number[];
  labels: string[];
  loading?: boolean;
}) {
  const max = Math.max(...values, 1);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={`chart-skeleton-${index}`} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="skeleton-premium h-3 w-28 animate-pulse-soft rounded-md" />
              <div className="skeleton-premium h-3 w-8 animate-pulse-soft rounded-md" />
            </div>
            <div className="skeleton-premium h-2.5 animate-pulse-soft rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {values.map((value, index) => {
        const width = `${Math.max(10, Math.round((value / max) * 100))}%`;

        return (
          <div key={`${labels[index]}-${value}`} className="space-y-1">
            <div className="flex items-center justify-between text-caption">
              <span>{labels[index]}</span>
              <span>{value}</span>
            </div>
            <div className="h-2.5 rounded-full bg-muted">
              <div
                className={cn(
                  'h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500',
                )}
                style={{ width }}
                aria-hidden="true"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
