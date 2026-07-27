import { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export function Input({
  status = 'default',
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  status?: 'default' | 'error' | 'warning' | 'success';
}) {
  return (
    <input
      className={cn(
        'field-base',
        status === 'error' && 'field-error',
        status === 'warning' && 'field-warning',
        status === 'success' && 'field-success',
        className,
      )}
      aria-invalid={status === 'error'}
      {...props}
    />
  );
}
