import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  LogOut,
  Mail,
  Shield,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { TopNav } from '../components/layout/TopNav';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const ROLE_PERMISSIONS: Record<string, string[]> = {
    ADMIN: [
      'Manage all users',
      'Create and delete projects',
      'View all tasks',
      'Assign any task',
      'Change any task status/priority',
      'Full system control',
    ],
    MANAGER: [
      'Create projects',
      'Create tasks and incidents',
      'Assign tasks to team members',
      'Change task priority and status',
      'View project analytics',
    ],
    DEVELOPER: [
      'View assigned tasks',
      'Update task status',
      'Add comments',
      'View task history',
    ],
    VIEWER: [
      'Read-only access to projects',
      'Read-only access to tasks',
      'View comments and history',
    ],
  };

  const permissions = ROLE_PERMISSIONS[user.role] || [];

  return (
    <div className="flex flex-col h-full">
      <TopNav title="My Profile" subtitle="Account information and role permissions" />

      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Profile Card */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#11131c] shadow-lg p-6">
            <div className="flex items-start gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-2xl font-bold text-white shadow-lg shadow-indigo-700/30">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white tracking-tight">{user.name}</h2>
                <div className="flex items-center gap-2 mt-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-sm text-slate-400">{user.email}</span>
                </div>
                <div className="mt-2">
                  <Badge value={user.role} variant="role" size="md" />
                </div>
              </div>
              <Button
                size="sm"
                variant="danger"
                onClick={logout}
                leftIcon={<LogOut className="h-3.5 w-3.5" />}
              >
                Sign Out
              </Button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-800 pt-5">
              <div className="flex items-center gap-2.5">
                <User className="h-4 w-4 text-slate-500" />
                <div>
                  <p className="text-[11px] text-slate-500 uppercase tracking-wide font-medium">User ID</p>
                  <p className="text-sm font-semibold text-slate-300">#{user.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Calendar className="h-4 w-4 text-slate-500" />
                <div>
                  <p className="text-[11px] text-slate-500 uppercase tracking-wide font-medium">Member Since</p>
                  <p className="text-sm font-semibold text-slate-300">
                    {new Date(user.createdAt).toLocaleDateString([], {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Role Permissions */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#11131c] shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-4 w-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-slate-200">Role Permissions — {user.role}</h3>
            </div>
            <div className="space-y-2">
              {permissions.map((perm, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 rounded-lg bg-slate-800/50 border border-slate-700/40 px-3.5 py-2.5"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0" />
                  <span className="text-xs text-slate-300">{perm}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#11131c] shadow-lg p-6 space-y-3">
            <h3 className="text-sm font-semibold text-slate-200 mb-3">Quick Navigation</h3>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/dashboard')}>
              Dashboard
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/projects')}>
              All Projects
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
