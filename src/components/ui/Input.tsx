import { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';
export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn('w-full rounded-lg border border-slate-300 px-3 py-2 focus-ring', className)} {...props} />;
}
