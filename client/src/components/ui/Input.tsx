import type { InputHTMLAttributes, SelectHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

const base =
  'h-9 w-full rounded-[var(--radius)] border border-border bg-bg px-3 text-sm text-fg transition-colors placeholder:text-muted ' +
  'focus-visible:outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/25 disabled:opacity-60';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(base, className)} {...props} />;
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(base, 'cursor-pointer', className)} {...props} />;
}
