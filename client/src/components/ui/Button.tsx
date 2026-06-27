import { cva, type VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-[var(--radius)] font-medium transition-all disabled:opacity-55 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 select-none whitespace-nowrap',
  {
    variants: {
      variant: {
        default: 'bg-accent text-accent-fg hover:brightness-110 shadow-sm',
        ghost: 'bg-panel border border-border text-fg hover:border-accent hover:text-accent',
        outline: 'border border-border text-fg hover:bg-hover',
        subtle: 'text-muted hover:bg-hover hover:text-fg',
        destructive: 'bg-danger text-white hover:brightness-110',
        link: 'text-accent hover:underline underline-offset-4',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        default: 'h-9 px-4 text-sm',
        icon: 'h-9 w-9 p-0',
        'icon-sm': 'h-8 w-8 p-0',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export { buttonVariants };
