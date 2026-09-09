import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes without conflicting utilities (shadcn pattern). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
