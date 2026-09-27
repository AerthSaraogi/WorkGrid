import React from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Clock,
  MessageSquare,
  UserCheck,
  UserPlus,
} from 'lucide-react';
import type { TaskHistory } from '../../types';

export interface ActivityTimelineProps {
  activities: TaskHistory[];
  maxItems?: number;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  activities,
  maxItems,
}) => {
  const displayed = maxItems ? activities.slice(0, maxItems) : activities;

  if (!displayed || displayed.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-zinc-400">
        No recent activity recorded yet.
      </div>
    );
  }

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  const getActionIcon = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes('comment')) {
      return <MessageSquare className="h-3.5 w-3.5 text-indigo-400" />;
    }
    if (act.includes('assign')) {
      return <UserCheck className="h-3.5 w-3.5 text-emerald-400" />;
    }
    if (act.includes('status')) {
      return <ArrowRight className="h-3.5 w-3.5 text-amber-400" />;
    }
    if (act.includes('priority')) {
      return <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />;
    }
    if (act.includes('created')) {
      return <UserPlus className="h-3.5 w-3.5 text-sky-400" />;
    }
    return <Clock className="h-3.5 w-3.5 text-zinc-400" />;
  };

  return (
    <div className="flow-root">
      <ul className="-mb-6">
        {displayed.map((item, idx) => {
          const isLast = idx === displayed.length - 1;
          return (
            <li key={item.id}>
              <div className="relative pb-6">
                {!isLast && (
                  <span
                    className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-white/[0.06]"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex items-start space-x-3">
                  <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.08] shadow-sm">
                    {getActionIcon(item.action)}
                  </div>
                  <div className="min-w-0 flex-1 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-zinc-200">{item.userName}</span>
                        <span className="text-zinc-400">{item.action.toLowerCase()}</span>
                        {item.taskTitle && (
                          <span className="font-medium text-indigo-400">
                            \"{item.taskTitle}\"
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-zinc-400 whitespace-nowrap ml-2">
                        {formatDate(item.createdAt)} at {formatTime(item.createdAt)}
                      </div>
                    </div>
                    {(item.oldValue || item.newValue) && (
                      <div className="mt-1.5 flex items-center gap-2 text-xs text-zinc-300 bg-white/[0.02] rounded-lg px-2.5 py-1.5 border border-white/[0.06]">
                        {item.oldValue && (
                          <>
                            <span className="line-through text-zinc-400">{item.oldValue}</span>
                            <ArrowRight className="h-3 w-3 text-zinc-400" />
                          </>
                        )}
                        <span className="font-medium text-zinc-100">{item.newValue}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
