import { TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';
export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'w-full min-h-32 rounded-lg border border-slate-300 px-3 py-2 focus-ring',
        className,
      )}
      {...props}
    />
  );
}
