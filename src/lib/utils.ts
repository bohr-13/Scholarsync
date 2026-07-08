import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatRelativeDate(date: string | Date): string {
  const now = new Date();
  const target = new Date(date);
  const diff = target.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days <= 7) return `${days} days left`;
  return formatDate(date);
}

export function getUrgencyColor(priority: string): string {
  switch (priority) {
    case 'critical':
      return 'text-rose-400';
    case 'high':
      return 'text-amber-400';
    case 'medium':
      return 'text-blue-400';
    case 'low':
      return 'text-slate-400';
    default:
      return 'text-slate-400';
  }
}

export function getUrgencyBg(priority: string): string {
  switch (priority) {
    case 'critical':
      return 'bg-rose-500/10 border-rose-500/20';
    case 'high':
      return 'bg-amber-500/10 border-amber-500/20';
    case 'medium':
      return 'bg-blue-500/10 border-blue-500/20';
    case 'low':
      return 'bg-slate-500/10 border-slate-500/20';
    default:
      return 'bg-slate-500/10 border-slate-500/20';
  }
}

export function getUrgencyGlow(priority: string): string {
  switch (priority) {
    case 'critical':
      return 'shadow-rose-500/20';
    case 'high':
      return 'shadow-amber-500/15';
    case 'medium':
      return 'shadow-blue-500/10';
    default:
      return 'shadow-transparent';
  }
}

export function getRiskColor(riskLevel: string): string {
  switch (riskLevel) {
    case 'danger':
      return 'text-rose-400';
    case 'warning':
      return 'text-amber-400';
    case 'safe':
      return 'text-emerald-400';
    default:
      return 'text-slate-400';
  }
}

export function getRiskBgColor(riskLevel: string): string {
  switch (riskLevel) {
    case 'danger':
      return 'stroke-rose-500';
    case 'warning':
      return 'stroke-amber-500';
    case 'safe':
      return 'stroke-emerald-500';
    default:
      return 'stroke-slate-500';
  }
}

export function calculateAttendance(attended: number, total: number) {
  const percentage = total > 0 ? (attended / total) * 100 : 0;
  const requiredPercentage = 75;
  const classesNeededFor75 =
    percentage >= requiredPercentage
      ? 0
      : Math.ceil((requiredPercentage * total - 100 * attended) / (100 - requiredPercentage));
  const safeBunks =
    percentage >= requiredPercentage
      ? Math.floor((attended - requiredPercentage * total / 100) / (requiredPercentage / 100))
      : 0;

  let riskLevel: 'safe' | 'warning' | 'danger';
  if (percentage >= 80) riskLevel = 'safe';
  else if (percentage >= 75) riskLevel = 'warning';
  else riskLevel = 'danger';

  return {
    percentage: Math.round(percentage * 10) / 10,
    safeBunks: Math.max(0, safeBunks),
    classesNeededFor75,
    riskLevel,
  };
}

export function priorityScore(task: { priority: string; deadline: string }): number {
  const priorityWeight: Record<string, number> = {
    critical: 100,
    high: 75,
    medium: 50,
    low: 25,
  };
  const now = new Date();
  const deadline = new Date(task.deadline);
  const daysLeft = Math.max(0, (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const urgencyBoost = daysLeft <= 1 ? 50 : daysLeft <= 3 ? 30 : daysLeft <= 7 ? 10 : 0;

  return (priorityWeight[task.priority] || 0) + urgencyBoost;
}
