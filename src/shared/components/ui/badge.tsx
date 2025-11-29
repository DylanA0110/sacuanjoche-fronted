import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/shared/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border-2 px-3 py-1 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#50C878]/40 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-[#50C878] text-white shadow-md shadow-[#50C878]/20',
        secondary:
          'border-transparent bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700',
        destructive:
          'border-transparent bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700',
        outline: 'text-foreground dark:border-white/20 light:border-gray-300',
        warning:
          'border-transparent bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700',
        success:
          'border-transparent bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
