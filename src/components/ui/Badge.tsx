import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold',
  {
    variants: {
      tone: {
        neutral: 'border-border bg-muted text-muted-foreground',
        primary: 'border-primary/35 bg-primary/15 text-primary',
        success: 'border-success/35 bg-success/15 text-success',
        warning: 'border-warning/35 bg-warning/15 text-warning',
        danger: 'border-danger/35 bg-danger/15 text-danger',
        info: 'border-info/35 bg-info/15 text-info',
      },
    },
    defaultVariants: {
      tone: 'neutral',
    },
  },
);

export function Badge({
  className,
  tone,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
