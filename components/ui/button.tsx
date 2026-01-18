import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-fast focus-visible:outline-none focus-visible:ring-0 disabled:pointer-events-none disabled:opacity-50',
  {
      variants: {
        variant: {
          default: 'bg-surfaceMuted text-textPrimary hover:bg-surfaceElevated',
          primary: 'bg-brandPrimary text-black font-semibold hover:opacity-90 focus-visible:ring-2 focus-visible:ring-brandPrimary/35 transition-fast',
          destructive:
            'bg-error-light dark:bg-error-dark/20 text-error hover:bg-error-light/80 dark:hover:bg-error-dark/30',
          outline:
            'border border-white/5 bg-transparent text-textPrimary hover:bg-surfaceMuted',
          secondary:
            'bg-surfaceMuted text-textPrimary hover:bg-surfaceElevated',
          ghost: 'hover:bg-surfaceMuted text-textPrimary',
          link: 'text-brandPrimary underline-offset-4 hover:underline',
        },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-xl px-3',
        lg: 'h-11 rounded-xl px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
