import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export interface DashboardCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  color?: 'indigo' | 'blue' | 'amber' | 'emerald' | 'rose' | 'slate';
  subtitle?: string;
  onClick?: () => void;
  isSelected?: boolean;
  actionHint?: string;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon,
  trend,
  trendType = 'neutral',
  color = 'indigo',
  subtitle,
  onClick,
  isSelected = false,
  actionHint,
}) => {
  const colorMap = {
    indigo: {
      border: isSelected ? 'border-indigo-500 ring-2 ring-indigo-500/40 bg-indigo-500/[0.08]' : 'border-white/[0.08] hover:border-indigo-500/50 hover:bg-white/[0.02]',
      iconBg: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
      badge: 'text-indigo-400',
    },
    blue: {
      border: isSelected ? 'border-sky-500 ring-2 ring-sky-500/40 bg-sky-500/[0.08]' : 'border-white/[0.08] hover:border-sky-500/50 hover:bg-white/[0.02]',
      iconBg: 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
      badge: 'text-sky-400',
    },
    amber: {
      border: isSelected ? 'border-amber-500 ring-2 ring-amber-500/40 bg-amber-500/[0.08]' : 'border-white/[0.08] hover:border-amber-500/50 hover:bg-white/[0.02]',
      iconBg: 'bg-amber-500/10 text-amber-300 border border-amber-500/20',
      badge: 'text-amber-400',
    },
    emerald: {
      border: isSelected ? 'border-emerald-500 ring-2 ring-emerald-500/40 bg-emerald-500/[0.08]' : 'border-white/[0.08] hover:border-emerald-500/50 hover:bg-white/[0.02]',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      badge: 'text-emerald-400',
    },
    rose: {
      border: isSelected ? 'border-rose-500 ring-2 ring-rose-500/40 bg-rose-500/[0.08]' : 'border-white/[0.08] hover:border-rose-500/50 hover:bg-white/[0.02]',
      iconBg: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
      badge: 'text-rose-400',
    },
    slate: {
      border: isSelected ? 'border-zinc-400 ring-2 ring-zinc-400/40 bg-white/[0.06]' : 'border-white/[0.08] hover:border-zinc-600 hover:bg-white/[0.02]',
      iconBg: 'bg-zinc-800/80 text-zinc-300 border border-white/[0.08]',
      badge: 'text-zinc-300',
    },
  };

  const scheme = colorMap[color] || colorMap.indigo;

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`group relative flex flex-col justify-between rounded-2xl bg-[#11131c] p-5 shadow-lg shadow-black/20 transition-all duration-200 select-none ${
        scheme.border
      } ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      }`}
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 group-hover:text-zinc-300 transition-colors">
            {title}
          </span>
          <div className={`rounded-xl p-2.5 transition-transform duration-200 group-hover:scale-110 ${scheme.iconBg}`}>
            {icon}
          </div>
        </div>

        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-3xl font-extrabold tracking-tight text-white">{value}</span>
          {trend && (
            <span
              className={`text-xs font-semibold ${
                trendType === 'positive'
                  ? 'text-emerald-400'
                  : trendType === 'negative'
                  ? 'text-rose-400'
                  : 'text-zinc-400'
              }`}
            >
              {trend}
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-white/[0.04] flex items-center justify-between text-xs text-zinc-400">
        {subtitle && <span className="truncate">{subtitle}</span>}
        {actionHint ? (
          <span className="ml-auto flex items-center gap-0.5 text-[11px] font-medium text-indigo-400 group-hover:text-indigo-300 transition-colors shrink-0">
            {actionHint}
            <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        ) : onClick ? (
          <span className="ml-auto text-[11px] text-zinc-400 group-hover:text-zinc-400 flex items-center gap-0.5">
            Inspect <ArrowUpRight className="h-3 w-3" />
          </span>
        ) : null}
      </div>
    </div>
  );
};
