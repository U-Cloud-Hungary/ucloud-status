import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow } from 'date-fns';
import { hu } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return 'Never';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    
    return formatDistanceToNow(dateObj, { addSuffix: true, locale: hu });
  } catch (error) {
    return 'Invalid date';
  }
}

export function getMetricColor(value: number): string {
  if (value < 50) return 'text-brand-glow';
  if (value < 80) return 'text-amber-400';
  return 'text-rose-400';
}