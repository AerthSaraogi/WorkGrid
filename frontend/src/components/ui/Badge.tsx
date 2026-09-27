import React from 'react';
import type { TaskPriority, TaskStatus, TaskType, UserRole } from '../../types';

export interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'status' | 'priority' | 'role' | 'type' | 'default';
  value?: TaskStatus | TaskPriority | UserRole | TaskType | string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  value,
  size = 'sm',
}) => {
  const displayValue = children || value;
  const strVal = String(value || children || '').toUpperCase();

  let colorClasses = 'bg-slate-800 text-slate-300 border-slate-700';

  if (variant === 'status' || strVal === 'TODO' || strVal === 'IN_PROGRESS' || strVal === 'REVIEW' || strVal === 'DONE') {
    switch (strVal) {
      case 'TODO':
        colorClasses = 'bg-slate-800 text-slate-300 border-slate-700';
        break;
      case 'IN_PROGRESS':
        colorClasses = 'bg-blue-950/70 text-blue-400 border-blue-800/60';
        break;
      case 'REVIEW':
        colorClasses = 'bg-amber-950/70 text-amber-300 border-amber-800/60';
        break;
      case 'DONE':
        colorClasses = 'bg-emerald-950/70 text-emerald-400 border-emerald-800/60';
        break;
    }
  } else if (variant === 'priority' || strVal === 'LOW' || strVal === 'MEDIUM' || strVal === 'HIGH' || strVal === 'CRITICAL') {
    switch (strVal) {
      case 'LOW':
        colorClasses = 'bg-slate-800 text-slate-400 border-slate-700';
        break;
      case 'MEDIUM':
        colorClasses = 'bg-sky-950/70 text-sky-400 border-sky-800/60';
        break;
      case 'HIGH':
        colorClasses = 'bg-orange-950/70 text-orange-400 border-orange-800/60';
        break;
      case 'CRITICAL':
        colorClasses = 'bg-rose-950/80 text-rose-300 border-rose-800 animate-pulse font-semibold';
        break;
    }
  } else if (variant === 'role') {
    switch (strVal) {
      case 'ADMIN':
        colorClasses = 'bg-purple-950/80 text-purple-300 border-purple-800/60 font-semibold';
        break;
      case 'MANAGER':
        colorClasses = 'bg-indigo-950/80 text-indigo-300 border-indigo-800/60 font-medium';
        break;
      case 'DEVELOPER':
        colorClasses = 'bg-teal-950/80 text-teal-300 border-teal-800/60';
        break;
      case 'VIEWER':
        colorClasses = 'bg-slate-800/90 text-slate-400 border-slate-700';
        break;
    }
  } else if (variant === 'type' || strVal === 'INCIDENT' || strVal === 'TASK') {
    switch (strVal) {
      case 'INCIDENT':
        colorClasses = 'bg-rose-950/80 text-rose-300 border-rose-800/70 font-semibold';
        break;
      case 'TASK':
        colorClasses = 'bg-indigo-950/80 text-indigo-300 border-indigo-800/60';
        break;
    }
  }

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 tracking-wide',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border font-medium uppercase transition-colors ${sizeStyles[size]} ${colorClasses}`}
    >
      {strVal === 'INCIDENT' && <span className="h-1.5 w-1.5 rounded-full bg-rose-400 inline-block mr-0.5" />}
      {strVal === 'DONE' && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block mr-0.5" />}
      {displayValue}
    </span>
  );
};
