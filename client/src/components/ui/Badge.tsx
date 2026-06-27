import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

const badgeVariants = cva('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', {
  variants: {
    variant: {
      neutral: 'bg-hover text-muted',
      success: 'text-[var(--ok-fg)] bg-[var(--ok-bg)]',
      danger: 'text-[var(--off-fg)] bg-[var(--off-bg)]',
      system: 'text-[var(--sys-fg)] bg-[var(--sys-bg)]',
      outline: 'border border-border text-muted',
    },
  },
  defaultVariants: { variant: 'neutral' },
});

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
