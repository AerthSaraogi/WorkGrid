import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Settings,
} from 'lucide-react';
import { WorkGridLogo } from '../ui/Logo';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../ui/Badge';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects', icon: FolderKanban, label: 'Projects' },
];

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
      isActive
        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 shadow-sm'
        : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200 border border-transparent'
    }`;

  return (
    <aside className="flex h-full w-64 flex-col bg-[#0c0d14] border-r border-white/[0.06] select-none">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/[0.06]">
        <WorkGridLogo size={36} className="shadow-lg shadow-indigo-500/20" />
        <div>
          <span className="text-base font-bold tracking-tight text-white">WorkGrid</span>
          <p className="text-[11px] font-medium text-zinc-400 tracking-wide">Team Operations</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5 px-4 py-5 overflow-y-auto">
        <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
          Main Menu
        </p>
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={navLinkClass}>
            <Icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-105" />
            {label}
          </NavLink>
        ))}

        <p className="px-3 pt-6 pb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
          Settings
        </p>
        <NavLink to="/profile" className={navLinkClass}>
          <Settings className="h-4 w-4 shrink-0 transition-transform group-hover:scale-105" />
          Profile & Preferences
        </NavLink>
      </nav>

      {/* User Info + Logout */}
      <div className="border-t border-white/[0.06] p-4 space-y-2.5 bg-[#090a0f]/60">
        <div
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] cursor-pointer hover:bg-white/[0.06] hover:border-white/[0.1] transition-all"
          onClick={() => navigate('/profile')}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 text-xs font-bold text-white shrink-0 shadow-inner">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-zinc-200 truncate">{user?.name}</p>
            <div className="mt-0.5">
              <Badge value={user?.role} variant="role" size="sm" />
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-zinc-400 hover:bg-rose-500/10 hover:text-rose-300 border border-transparent hover:border-rose-500/20 transition-all"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </button>
      </div>
    </aside>
  );
};
