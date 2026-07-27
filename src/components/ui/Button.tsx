import { ButtonHTMLAttributes, Children, isValidElement } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-all duration-200 focus-ring disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 active:translate-y-px',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90',
        secondary:
          'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/90',
        outline:
          'border border-border bg-background text-foreground shadow-xs hover:bg-hover',
        ghost: 'text-foreground hover:bg-hover',
        danger: 'bg-danger text-white shadow-sm hover:bg-danger/90',
        success: 'bg-success text-white shadow-sm hover:bg-success/90',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4',
        lg: 'h-11 px-5',
        icon: 'size-10 px-0',
      },
      loading: {
        true: 'cursor-wait',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      loading: false,
    },
  },
);

export function Button({
  asChild,
  variant,
  size,
  loading,
  loadingText,
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    loading?: boolean;
    loadingText?: string;
  }) {
  const canUseSlot =
    Boolean(asChild) &&
    !loading &&
    Children.count(children) === 1 &&
    isValidElement(children);
  const Comp = canUseSlot ? Slot : 'button';

  return (
    <Comp
      className={cn(buttonVariants({ variant, size, loading }), className)}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <Loader2 size={16} className="animate-spin" aria-hidden="true" />
      )}
      {loading ? (loadingText ?? children) : children}
    </Comp>
  );
}

export { buttonVariants };
