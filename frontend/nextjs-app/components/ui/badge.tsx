import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva('inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold', {
  variants: {
    variant: {
      default: 'bg-primary text-primary-foreground',
      secondary: 'bg-secondary text-secondary-foreground',
      success: 'bg-emerald-700 text-white',
      warning: 'bg-amber-600 text-white',
      destructive: 'bg-destructive text-destructive-foreground',
      outline: 'border border-input text-foreground',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

function Badge({ className, variant, ...props }: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
