import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/shared/hooks/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border-2 px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#50C878] focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-[#50C878] text-white shadow-md shadow-[#50C878]/20',
        secondary:
          'border-transparent bg-[#FFE082]/20 text-[#FFE082] border-[#FFE082]/30 dark:bg-[#FFE082]/10 light:bg-[#FFE082]/10',
        destructive:
          'border-transparent bg-red-500/20 text-red-400 border-red-500/30 dark:bg-red-500/10 light:bg-red-50 light:text-red-600',
        outline:
          'text-foreground dark:border-white/20 light:border-gray-300',
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
