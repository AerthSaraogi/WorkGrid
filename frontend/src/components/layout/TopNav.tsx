import React from 'react';
import { Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export interface TopNavProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const TopNav: React.FC<TopNavProps> = ({ title, subtitle, action }) => {
  const { user } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b border-white/[0.06] bg-[#0c0d14]/80 px-8 backdrop-blur-md sticky top-0 z-30">
      <div>
        {title && (
          <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            {title}
          </h1>
        )}
        {subtitle && <p className="text-xs text-zinc-400 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {action}
        <button 
          aria-label="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.03] border border-white/[0.06] text-zinc-400 hover:bg-white/[0.08] hover:text-white transition-all"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-[#0c0d14]" />
        </button>
        <div className="flex items-center gap-2.5 pl-2 border-l border-white/[0.08]">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-xs font-bold text-white shadow-md shadow-indigo-600/30 ring-1 ring-white/20">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-zinc-200 leading-tight">{user?.name}</p>
            <p className="text-[10px] text-zinc-400 leading-tight">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
