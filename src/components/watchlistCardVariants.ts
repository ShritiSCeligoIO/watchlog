import { cva } from 'class-variance-authority';

export const watchlistCardVariants = cva(
  'rounded-xl border bg-card p-4 text-card-foreground shadow-sm transition-all',
  {
    variants: {
      status: {
        want: 'border-l-4 border-l-status-want',
        watching: 'border-l-4 border-l-status-watching',
        done: 'border-l-4 border-l-status-done',
      },
      selected: {
        true: 'ring-2 ring-ring ring-offset-2 ring-offset-background',
        false: '',
      },
    },
    defaultVariants: {
      status: 'want',
      selected: false,
    },
  }
);
