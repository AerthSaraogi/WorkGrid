import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BarChart2,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  FolderKanban,
  RefreshCw,
  Search,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { dashboardApi } from '../services/api';
import type { GlobalDashboard, TaskItem } from '../types';
import { DashboardCard } from '../components/dashboard/DashboardCard';
import { ActivityTimeline } from '../components/dashboard/ActivityTimeline';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { TopNav } from '../components/layout/TopNav';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

type MetricFilter = 'ALL' | 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'CRITICAL';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<GlobalDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states for interactive graph and task drilldown
  const [selectedMetric, setSelectedMetric] = useState<MetricFilter>('ALL');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = useNavigate();

  const fetchDashboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const dashData = await dashboardApi.getGlobalDashboard();
      setDashboard(dashData);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Compute daily task aggregation for the interactive Timeline Graph
  const dailyStats = useMemo(() => {
    if (!dashboard || !dashboard.recentTasks) return [];

    const map = new Map<
      string,
      {
        dateKey: string;
        displayDate: string;
        fullDate: string;
        total: number;
        todo: number;
        inProgress: number;
        review: number;
        done: number;
        critical: number;
        tasks: TaskItem[];
      }
    >();

    dashboard.recentTasks.forEach((task) => {
      const d = new Date(task.createdAt);
      const dateKey = !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : 'Unknown';
      const displayDate = !isNaN(d.getTime())
        ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : 'Other';
      const fullDate = !isNaN(d.getTime())
        ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'Unknown Date';

      if (!map.has(dateKey)) {
        map.set(dateKey, {
          dateKey,
          displayDate,
          fullDate,
          total: 0,
          todo: 0,
          inProgress: 0,
          review: 0,
          done: 0,
          critical: 0,
          tasks: [],
        });
      }

      const entry = map.get(dateKey)!;
      entry.total += 1;
      entry.tasks.push(task);
      if (task.status === 'TODO') entry.todo += 1;
      if (task.status === 'IN_PROGRESS') entry.inProgress += 1;
      if (task.status === 'REVIEW') entry.review += 1;
      if (task.status === 'DONE') entry.done += 1;
      if (task.priority === 'CRITICAL' || task.type === 'INCIDENT') entry.critical += 1;
    });

    // Sort chronologically ascending
    return Array.from(map.values()).sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  }, [dashboard]);

  // Filter tasks based on selectedMetric, selectedDate, and search
  const filteredTasks = useMemo(() => {
    if (!dashboard || !dashboard.recentTasks) return [];

    return dashboard.recentTasks.filter((task) => {
      // Date filter
      if (selectedDate) {
        const d = new Date(task.createdAt);
        const taskDate = !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : '';
        if (taskDate !== selectedDate) return false;
      }

      // Status/Metric filter
      if (selectedMetric === 'TODO' && task.status !== 'TODO') return false;
      if (selectedMetric === 'IN_PROGRESS' && task.status !== 'IN_PROGRESS') return false;
      if (selectedMetric === 'REVIEW' && task.status !== 'REVIEW') return false;
      if (selectedMetric === 'DONE' && task.status !== 'DONE') return false;
      if (selectedMetric === 'CRITICAL' && task.priority !== 'CRITICAL' && task.type !== 'INCIDENT') {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(q);
        const matchesProject = task.projectName?.toLowerCase().includes(q);
        const matchesAssignee = task.assigneeName?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesProject && !matchesAssignee) return false;
      }

      return true;
    });
  }, [dashboard, selectedMetric, selectedDate, searchQuery]);

  // Max daily task count for scaling bar chart
  const maxDayCount = useMemo(() => {
    if (dailyStats.length === 0) return 1;
    return Math.max(...dailyStats.map((d) => d.total), 1);
  }, [dailyStats]);

  const selectedDateObject = useMemo(() => {
    if (!selectedDate) return null;
    return dailyStats.find((d) => d.dateKey === selectedDate) || null;
  }, [selectedDate, dailyStats]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner size="lg" text="Loading dashboard analytics..." />
      </div>
    );
  }

  const completionPercent =
    dashboard && dashboard.totalTasks > 0
      ? Math.round((dashboard.doneCount / dashboard.totalTasks) * 100)
      : 0;

  return (
    <div className="flex flex-col min-h-full">
      <TopNav
        title="Engineering Dashboard"
        subtitle="Real-time workspace health, task velocity, and team history"
        action={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={fetchDashboard}
              leftIcon={<RefreshCw className="h-3.5 w-3.5 text-zinc-400" />}
            >
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={() => navigate('/projects')}
              rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
            >
              View Projects
            </Button>
          </div>
        }
      />

      <div className="flex-1 px-8 py-8 space-y-8 max-w-7xl mx-auto w-full">
        {error && <ErrorMessage message={error} onRetry={fetchDashboard} />}

        {dashboard && (
          <>
            {/* Header Greeting Banner */}
            <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-r from-[#121422] via-[#0f101a] to-[#0c0d15] p-6 shadow-xl shadow-black/40">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                      System Operational
                    </span>
                  </div>
                  <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">
                    Welcome back, {user?.name || 'Engineer'}
                  </h2>
                  <p className="mt-1 text-sm text-zinc-400 max-w-2xl">
                    You have <span className="font-semibold text-zinc-200">{dashboard.totalTasks} tasks</span> across{' '}
                    <span className="font-semibold text-zinc-200">{dashboard.totalProjects} workspaces</span>, with{' '}
                    <span className="font-semibold text-indigo-400">{dashboard.inProgressCount} currently active</span> and{' '}
                    <span className="font-semibold text-emerald-400">{completionPercent}% completed</span>.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-center">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">Completion</p>
                    <p className="text-2xl font-extrabold text-white">{completionPercent}%</p>
                  </div>
                  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-center">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">Active Incidents</p>
                    <p className={`text-2xl font-extrabold ${dashboard.criticalIncidentsCount > 0 ? 'text-rose-400' : 'text-zinc-200'}`}>
                      {dashboard.criticalIncidentsCount}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive KPI Cards (Spacious, Clear Roles, Clickable) */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Workspace Metrics
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Click any card to filter tasks & graph below, or jump directly to projects
                  </p>
                </div>
                {selectedMetric !== 'ALL' && (
                  <button
                    onClick={() => setSelectedMetric('ALL')}
                    className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Reset Filter (Show All)
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                <DashboardCard
                  title="Total Projects"
                  value={dashboard.totalProjects}
                  icon={<FolderKanban className="h-5 w-5" />}
                  color="indigo"
                  subtitle="Active workspaces"
                  actionHint="Go to Projects"
                  onClick={() => navigate('/projects')}
                />
                <DashboardCard
                  title="Total Tasks"
                  value={dashboard.totalTasks}
                  icon={<BarChart2 className="h-5 w-5" />}
                  color="slate"
                  subtitle="All work items"
                  isSelected={selectedMetric === 'ALL'}
                  actionHint="Show all"
                  onClick={() => setSelectedMetric('ALL')}
                />
                <DashboardCard
                  title="In Progress"
                  value={dashboard.inProgressCount}
                  icon={<Clock className="h-5 w-5" />}
                  color="blue"
                  subtitle="Active in sprint"
                  isSelected={selectedMetric === 'IN_PROGRESS'}
                  actionHint="Filter"
                  onClick={() => setSelectedMetric('IN_PROGRESS')}
                />
                <DashboardCard
                  title="In Review"
                  value={dashboard.reviewCount}
                  icon={<RefreshCw className="h-5 w-5" />}
                  color="amber"
                  subtitle="PR / QA checking"
                  isSelected={selectedMetric === 'REVIEW'}
                  actionHint="Filter"
                  onClick={() => setSelectedMetric('REVIEW')}
                />
                <DashboardCard
                  title="Completed"
                  value={dashboard.doneCount}
                  icon={<CheckCircle2 className="h-5 w-5" />}
                  color="emerald"
                  subtitle="Verified & shipped"
                  isSelected={selectedMetric === 'DONE'}
                  actionHint="Filter"
                  onClick={() => setSelectedMetric('DONE')}
                />
                <DashboardCard
                  title="Critical"
                  value={dashboard.criticalIncidentsCount}
                  icon={<AlertTriangle className="h-5 w-5" />}
                  color="rose"
                  subtitle="High priority alert"
                  isSelected={selectedMetric === 'CRITICAL'}
                  actionHint="Filter"
                  onClick={() => setSelectedMetric('CRITICAL')}
                />
              </div>
            </section>

            {/* Interactive Task Influx Graph ("like this task come on this day like that") */}
            <section className="rounded-3xl border border-white/[0.08] bg-[#11131c] p-6 shadow-xl shadow-black/30 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-indigo-400" />
                    <h3 className="text-base font-bold text-white tracking-tight">
                      Task Influx & Timeline by Day
                    </h3>
                    <span className="rounded-full bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 text-[10px] font-semibold text-indigo-400">
                      Interactive Timeline
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Showing when tasks and incidents were created. Click a date or bar to inspect work items that arrived on that day.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSelectedDate(null);
                      setSelectedMetric('ALL');
                    }}
                  >
                    Reset View
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => navigate('/projects')}
                    rightIcon={<ExternalLink className="h-3.5 w-3.5" />}
                  >
                    Open in Project Table
                  </Button>
                </div>
              </div>

              {/* Status Filter Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-zinc-400 mr-1 flex items-center gap-1">
                  <Filter className="h-3.5 w-3.5" /> Filter Status:
                </span>
                {(
                  [
                    { id: 'ALL', label: 'All Tasks', count: dashboard.totalTasks },
                    { id: 'TODO', label: 'To Do', count: dashboard.todoCount },
                    { id: 'IN_PROGRESS', label: 'In Progress', count: dashboard.inProgressCount },
                    { id: 'REVIEW', label: 'In Review', count: dashboard.reviewCount },
                    { id: 'DONE', label: 'Completed', count: dashboard.doneCount },
                    { id: 'CRITICAL', label: 'Critical / Incidents', count: dashboard.criticalIncidentsCount },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedMetric(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      selectedMetric === tab.id
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08] hover:text-zinc-200 border border-white/[0.06]'
                    }`}
                  >
                    {tab.label}
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        selectedMetric === tab.id ? 'bg-indigo-700/60 text-white' : 'bg-white/[0.06] text-zinc-400'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Interactive Visual Bar Chart */}
              {dailyStats.length === 0 ? (
                <div className="py-12 text-center text-xs text-zinc-400">
                  No task activity recorded to plot.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative pt-6 pb-2">
                    {/* Visual Bars Container */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 items-end min-h-[160px]">
                      {dailyStats.map((item) => {
                        const isCurrentSelected = selectedDate === item.dateKey;
                        const heightPct = Math.max(Math.round((item.total / maxDayCount) * 100), 16);

                        return (
                          <div
                            key={item.dateKey}
                            onClick={() => setSelectedDate(isCurrentSelected ? null : item.dateKey)}
                            className={`group relative flex flex-col items-center justify-end rounded-2xl p-3 border transition-all duration-200 cursor-pointer ${
                              isCurrentSelected
                                ? 'bg-indigo-500/[0.12] border-indigo-500 ring-2 ring-indigo-500/40 shadow-lg shadow-indigo-500/10'
                                : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.12]'
                            }`}
                          >
                            {/* Hover Tooltip */}
                            <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap rounded-lg bg-zinc-950 border border-white/[0.1] px-2.5 py-1 text-[11px] text-zinc-200 shadow-xl transition-opacity">
                              <span className="font-semibold text-white">{item.total} task{item.total > 1 ? 's' : ''}</span> on {item.displayDate}
                            </div>

                            {/* Bar Graphic */}
                            <div className="w-full flex items-end justify-center mb-3">
                              <div
                                style={{ height: `${heightPct}px` }}
                                className={`w-8 rounded-xl transition-all duration-300 flex flex-col justify-end overflow-hidden ${
                                  isCurrentSelected
                                    ? 'bg-gradient-to-t from-indigo-600 to-violet-500 shadow-md shadow-indigo-500/30'
                                    : 'bg-gradient-to-t from-zinc-700 to-indigo-500/80 group-hover:from-indigo-600 group-hover:to-indigo-400'
                                }`}
                              >
                                {item.critical > 0 && (
                                  <div
                                    style={{ height: `${(item.critical / item.total) * 100}%` }}
                                    className="w-full bg-rose-500/90"
                                    title={`${item.critical} critical incident(s)`}
                                  />
                                )}
                              </div>
                            </div>

                            {/* Task Count Badge */}
                            <span className="text-sm font-bold text-white mb-0.5">
                              {item.total}
                            </span>

                            {/* Date Label */}
                            <span className="text-[11px] font-medium text-zinc-400">
                              {item.displayDate}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Day Pills Bar */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/[0.06]">
                    <span className="text-xs font-semibold text-zinc-400 mr-1">Select Day:</span>
                    <button
                      onClick={() => setSelectedDate(null)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                        selectedDate === null
                          ? 'bg-white/10 text-white border border-white/20'
                          : 'bg-white/[0.03] text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-200 border border-white/[0.06]'
                      }`}
                    >
                      All Days ({dashboard.totalTasks})
                    </button>
                    {dailyStats.map((item) => (
                      <button
                        key={item.dateKey}
                        onClick={() => setSelectedDate(item.dateKey)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                          selectedDate === item.dateKey
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-white/[0.03] text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-200 border border-white/[0.06]'
                        }`}
                      >
                        {item.displayDate} ({item.total})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks Arrived on Selected Day / Filter */}
              <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-indigo-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                      {selectedDateObject
                        ? `Tasks Created on ${selectedDateObject.fullDate}`
                        : 'Tasks Across All Dates'}
                      {selectedMetric !== 'ALL' && (
                        <span className="ml-2 font-normal text-indigo-400">
                          (Filtered by {selectedMetric})
                        </span>
                      )}
                    </h4>
                    <span className="text-xs text-zinc-400">
                      — {filteredTasks.length} {filteredTasks.length === 1 ? 'item' : 'items'} found
                    </span>
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Search filtered tasks..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] pl-9 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                {filteredTasks.length === 0 ? (
                  <div className="py-8 text-center rounded-2xl bg-white/[0.02] border border-white/[0.04] text-xs text-zinc-400">
                    No tasks match the selected date or status filter. Try selecting "All Days" or resetting the filter.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredTasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => navigate(`/tasks/${task.id}`)}
                        className="group flex flex-col justify-between rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 cursor-pointer hover:bg-white/[0.05] hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-200"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-[11px] font-medium text-zinc-400 truncate">
                              {task.projectName}
                            </span>
                            <div className="flex items-center gap-1 shrink-0">
                              <Badge value={task.priority} size="sm" />
                              <Badge value={task.status} size="sm" />
                            </div>
                          </div>
                          <p className="text-sm font-semibold text-zinc-200 group-hover:text-indigo-300 transition-colors line-clamp-2">
                            {task.title}
                          </p>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-zinc-400">
                          <span className="flex items-center gap-1.5 truncate">
                            <span className="h-5 w-5 rounded-md bg-white/[0.08] flex items-center justify-center font-bold text-[9px] text-zinc-300">
                              {task.assigneeName ? task.assigneeName.charAt(0).toUpperCase() : '?'}
                            </span>
                            {task.assigneeName || 'Unassigned'}
                          </span>
                          <span className="shrink-0 text-zinc-400">
                            {new Date(task.createdAt).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Critical Incidents Panel */}
            {dashboard.criticalIncidents.length > 0 && (
              <section className="rounded-3xl border border-rose-500/30 bg-rose-500/[0.04] p-6 shadow-xl shadow-rose-950/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-rose-300">
                      Active Critical Incidents ({dashboard.criticalIncidents.length})
                    </h3>
                  </div>
                  <span className="text-xs text-rose-400/80">Requires immediate engineering triage</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {dashboard.criticalIncidents.map((incident) => (
                    <div
                      key={incident.id}
                      onClick={() => navigate(`/tasks/${incident.id}`)}
                      className="flex items-center justify-between rounded-2xl bg-rose-950/30 border border-rose-900/40 p-4 cursor-pointer hover:bg-rose-950/50 hover:border-rose-500/50 transition-all group"
                    >
                      <div className="flex-1 min-w-0 pr-4">
                        <p className="text-sm font-semibold text-rose-100 group-hover:text-white truncate">
                          {incident.title}
                        </p>
                        <p className="text-xs text-rose-400/70 mt-0.5">{incident.projectName}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge value={incident.status} size="sm" />
                        <ArrowRight className="h-4 w-4 text-rose-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Two Column Layout: Recent Tasks + Team Activity Stream */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Recent Tasks */}
              <section className="rounded-3xl border border-white/[0.08] bg-[#11131c] p-6 shadow-xl shadow-black/20 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] mb-4">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300">
                        Recent Tasks
                      </h3>
                      <p className="text-xs text-zinc-400">Latest items logged across projects</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => navigate('/projects')}
                      rightIcon={<ArrowRight className="h-3 w-3" />}
                    >
                      All Tasks
                    </Button>
                  </div>

                  {dashboard.recentTasks.length === 0 ? (
                    <p className="text-xs text-zinc-400 py-8 text-center">No tasks recorded yet.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {dashboard.recentTasks.slice(0, 6).map((task) => (
                        <div
                          key={task.id}
                          onClick={() => navigate(`/tasks/${task.id}`)}
                          className="flex items-center gap-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] px-4 py-3 cursor-pointer hover:bg-white/[0.06] hover:border-white/[0.12] transition-all"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-zinc-200 truncate">{task.title}</p>
                            <p className="text-xs text-zinc-400 mt-0.5">{task.projectName}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge value={task.priority} size="sm" />
                            <Badge value={task.status} size="sm" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              {/* Team Activity Feed */}
              <section className="rounded-3xl border border-white/[0.08] bg-[#11131c] p-6 shadow-xl shadow-black/20">
                <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] mb-4">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300">
                      Live Team Activity
                    </h3>
                    <p className="text-xs text-zinc-400">Audit trail of recent updates and actions</p>
                  </div>
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <ActivityTimeline activities={dashboard.recentActivity} maxItems={7} />
              </section>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
