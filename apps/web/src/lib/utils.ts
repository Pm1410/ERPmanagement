import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
}

export function formatDate(date: string | Date, format: 'short' | 'long' | 'relative' = 'short'): string {
  const d = new Date(date);
  if (format === 'relative') {
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
  }
  if (format === 'long') return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function getAttendanceColor(pct: number): string {
  if (pct >= 85) return 'text-green-600';
  if (pct >= 75) return 'text-amber-500';
  return 'text-red-600';
}

export function getGradeColor(grade: string): string {
  const map: Record<string, string> = {
    'A+': 'text-emerald-600', 'A': 'text-green-600',
    'B+': 'text-teal-600', 'B': 'text-blue-600',
    'C': 'text-amber-600', 'D': 'text-orange-600', 'F': 'text-red-600',
  };
  return map[grade] ?? 'text-muted-foreground';
}

export function truncate(str: string, len: number): string {
  return str.length > len ? str.slice(0, len) + '…' : str;
}

export function initials(name: string): string {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}
