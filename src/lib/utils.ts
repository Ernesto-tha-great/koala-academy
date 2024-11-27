import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatDistanceToNow, format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: number | Date) {
  const dateObj = typeof date === 'number' ? new Date(date) : date;
  const distanceToNow = formatDistanceToNow(dateObj, { addSuffix: true });
    
  // If more than 7 days, show full date
  if (Date.now() - dateObj.getTime() > 7 * 24 * 60 * 60 * 1000) {
    return format(dateObj, 'MMMM d, yyyy');
  }
  
  return distanceToNow;
}
