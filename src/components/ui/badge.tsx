import { type HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

const variants = {
  default: 'border-transparent bg-primary text-primary-foreground',
  movie:
    'border-transparent bg-[color-mix(in_srgb,var(--type-movie)_22%,transparent)] text-type-movie',
  book:
    'border-transparent bg-[color-mix(in_srgb,var(--type-book)_22%,transparent)] text-type-book',
  want:
    'border-transparent bg-[color-mix(in_srgb,var(--status-want)_22%,transparent)] text-status-want',
  watching:
    'border-transparent bg-[color-mix(in_srgb,var(--status-watching)_22%,transparent)] text-status-watching',
  done:
    'border-transparent bg-[color-mix(in_srgb,var(--status-done)_22%,transparent)] text-status-done',
  genre:
    'border-border bg-[color-mix(in_srgb,var(--foreground)_14%,transparent)] text-foreground',
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
