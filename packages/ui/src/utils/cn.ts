import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names using clsx and merges Tailwind classes intelligently.
 * This prevents conflicting Tailwind utilities from being applied.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
