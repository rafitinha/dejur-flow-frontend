import { TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export function Textarea({
  status = 'default',
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  status?: 'default' | 'error' | 'warning' | 'success';
}) {
  return (
    <textarea
      className={cn(
        'field-base min-h-32 resize-y',
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
