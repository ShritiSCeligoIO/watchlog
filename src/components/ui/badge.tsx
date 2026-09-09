import { type HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

const variants = {
  default: 'border-transparent bg-primary text-primary-foreground',
  movie: 'border-transparent bg-type-movie/15 text-type-movie',
  book: 'border-transparent bg-type-book/15 text-type-book',
  want: 'border-transparent bg-status-want/20 text-status-want',
  watching: 'border-transparent bg-status-watching/20 text-status-watching',
  done: 'border-transparent bg-status-done/20 text-status-done',
  genre: 'border-border bg-muted text-muted-foreground',
} as const;

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variants;
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
