import { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';
export function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={cn('rounded-lg bg-brand-700 px-4 py-2 text-white disabled:opacity-50', className)} {...props} />;
}
