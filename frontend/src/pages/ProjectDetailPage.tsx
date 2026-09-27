import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  ListTodo,
  Plus,
  RefreshCw,
  Search,
} from 'lucide-react';
import { projectsApi, authApi } from '../services/api';
import type { Project, User } from '../types';
import { useTasks } from '../hooks/useTasks';
import { useDebounce } from '../hooks/useDebounce';
import { useAuth } from '../context/AuthContext';
import { TopNav } from '../components/layout/TopNav';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Pagination } from '../components/ui/Pagination';
import { DashboardCard } from '../components/dashboard/DashboardCard';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(4000).optional(),
  type: z.enum(['TASK', 'INCIDENT']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']),
  assignedTo: z.string().optional(),
  dueDate: z.string().optional(),
});
type TaskFormData = z.infer<typeof taskSchema>;

const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const projectId = parseInt(id || '0', 10);
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [projectLoading, setProjectLoading] = useState(true);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Debounce search to avoid API spam on every keystroke
  const debouncedSearch = useDebounce(searchInput, 300);

  const { tasks, pagination, setFilter, isLoading, error, refreshTasks, createTask } =
    useTasks(projectId);

  const canCreateTask = hasRole(['ADMIN', 'MANAGER']);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: { type: 'TASK', priority: 'MEDIUM', status: 'TODO' },
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [proj, userList] = await Promise.all([
          projectsApi.getById(projectId),
          authApi.getUsers(),
        ]);
        setProject(proj);
        setUsers(userList);
      } catch (err: any) {
        setProjectError(err.message);
      } finally {
        setProjectLoading(false);
      }
    };
    if (projectId) load();
  }, [projectId]);

  // Apply debounced search + filters
  useEffect(() => {
    setFilter((prev) => ({
      ...prev,
      search: debouncedSearch || undefined,
      status: (statusFilter as any) || undefined,
      priority: (priorityFilter as any) || undefined,
      type: (typeFilter as any) || undefined,
      pageIndex: 1,
    }));
  }, [debouncedSearch, statusFilter, priorityFilter, typeFilter]);

  const userOptions = useMemo(
    () => [
      { value: '', label: 'Unassigned' },
      ...users.map((u) => ({ value: String(u.id), label: u.name })),
    ],
    [users]
  );

  const stats = useMemo(() => {
    const all = tasks;
    return {
      total: pagination.totalCount,
      todo: all.filter((t) => t.status === 'TODO').length,
      inProgress: all.filter((t) => t.status === 'IN_PROGRESS').length,
      review: all.filter((t) => t.status === 'REVIEW').length,
      done: all.filter((t) => t.status === 'DONE').length,
      critical: all.filter((t) => t.priority === 'CRITICAL' && t.status !== 'DONE').length,
    };
  }, [tasks, pagination.totalCount]);

  const onCreateTask = async (data: TaskFormData) => {
    setCreateError(null);
    try {
      await createTask({
        projectId,
        title: data.title,
        description: data.description || '',
        type: data.type,
        priority: data.priority,
        status: data.status,
        assignedTo: data.assignedTo ? parseInt(data.assignedTo) : undefined,
        dueDate: data.dueDate || undefined,
      });
      setShowCreateModal(false);
      reset();
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create task');
    }
  };

  if (projectLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner size="lg" text="Loading project..." />
      </div>
    );
  }

  if (projectError) {
    return (
      <div className="p-6">
        <ErrorMessage message={projectError} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <TopNav title={project?.name || 'Project'} subtitle={project?.description} />

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {/* Back + Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/projects')}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">{project?.name}</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Created by {project?.creatorName} · {new Date(project?.createdAt || '').toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
          <DashboardCard title="Total" value={stats.total} icon={<ListTodo className="h-4 w-4" />} color="slate" />
          <DashboardCard title="Todo" value={stats.todo} icon={<ListTodo className="h-4 w-4" />} color="slate" />
          <DashboardCard title="In Progress" value={stats.inProgress} icon={<Clock className="h-4 w-4" />} color="blue" />
          <DashboardCard title="Review" value={stats.review} icon={<RefreshCw className="h-4 w-4" />} color="amber" />
          <DashboardCard title="Done" value={stats.done} icon={<CheckCircle2 className="h-4 w-4" />} color="emerald" />
          <DashboardCard title="Critical" value={stats.critical} icon={<AlertTriangle className="h-4 w-4" />} color="rose" />
        </div>

        {/* Filters + Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <Input
            id="task-search"
            placeholder="Search tasks... (debounced)"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
            className="max-w-[260px]"
          />
          <Select
            id="filter-status"
            options={[
              { value: '', label: 'All Status' },
              { value: 'TODO', label: 'Todo' },
              { value: 'IN_PROGRESS', label: 'In Progress' },
              { value: 'REVIEW', label: 'Review' },
              { value: 'DONE', label: 'Done' },
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-[150px]"
          />
          <Select
            id="filter-priority"
            options={[
              { value: '', label: 'All Priority' },
              { value: 'LOW', label: 'Low' },
              { value: 'MEDIUM', label: 'Medium' },
              { value: 'HIGH', label: 'High' },
              { value: 'CRITICAL', label: 'Critical' },
            ]}
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-[150px]"
          />
          <Select
            id="filter-type"
            options={[
              { value: '', label: 'All Types' },
              { value: 'TASK', label: 'Task' },
              { value: 'INCIDENT', label: 'Incident' },
            ]}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-[140px]"
          />
          <div className="ml-auto flex gap-2">
            <Button size="sm" variant="ghost" onClick={refreshTasks} leftIcon={<RefreshCw className="h-3.5 w-3.5" />}>
              Refresh
            </Button>
            {canCreateTask && (
              <Button
                id="create-task-btn"
                size="sm"
                onClick={() => setShowCreateModal(true)}
                leftIcon={<Plus className="h-4 w-4" />}
              >
                New Task
              </Button>
            )}
          </div>
        </div>

        {error && <ErrorMessage message={error} onRetry={refreshTasks} />}

        {/* Task Table */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#11131c] overflow-hidden shadow-xl">
          {isLoading ? (
            <LoadingSpinner text="Loading tasks..." />
          ) : tasks.length === 0 ? (
            <div className="py-16 text-center">
              <ListTodo className="h-10 w-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 font-medium text-sm">No tasks found</p>
              <p className="text-xs text-slate-500 mt-1">
                {canCreateTask ? 'Create your first task to get started.' : 'No tasks match your current filters.'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                      <th className="text-left text-xs font-semibold uppercase tracking-wider text-slate-400 px-4 py-3 w-[35%]">Title</th>
                      <th className="text-left text-xs font-semibold uppercase tracking-wider text-slate-400 px-4 py-3">Type</th>
                      <th className="text-left text-xs font-semibold uppercase tracking-wider text-slate-400 px-4 py-3">Priority</th>
                      <th className="text-left text-xs font-semibold uppercase tracking-wider text-slate-400 px-4 py-3">Status</th>
                      <th className="text-left text-xs font-semibold uppercase tracking-wider text-slate-400 px-4 py-3">Assignee</th>
                      <th className="text-left text-xs font-semibold uppercase tracking-wider text-slate-400 px-4 py-3">Due Date</th>
                      <th className="text-left text-xs font-semibold uppercase tracking-wider text-slate-400 px-4 py-3">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {tasks.map((task) => (
                      <tr
                        key={task.id}
                        onClick={() => navigate(`/tasks/${task.id}`)}
                        className="cursor-pointer hover:bg-slate-800/40 transition-colors group"
                      >
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-200 group-hover:text-white truncate max-w-[280px]">
                            {task.title}
                          </p>
                          {task.commentCount > 0 && (
                            <p className="text-xs text-slate-500 mt-0.5">{task.commentCount} comment{task.commentCount !== 1 ? 's' : ''}</p>
                          )}
                        </td>
                        <td className="px-4 py-3"><Badge value={task.type} variant="type" /></td>
                        <td className="px-4 py-3"><Badge value={task.priority} variant="priority" /></td>
                        <td className="px-4 py-3"><Badge value={task.status} variant="status" /></td>
                        <td className="px-4 py-3 text-xs text-slate-400">
                          {task.assigneeName || <span className="text-slate-600 italic">Unassigned</span>}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-400">
                          {task.dueDate ? (
                            <span className={new Date(task.dueDate) < new Date() && task.status !== 'DONE' ? 'text-rose-400' : ''}>
                              {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500">
                          {new Date(task.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                pageIndex={pagination.pageIndex}
                totalPages={pagination.totalPages}
                totalCount={pagination.totalCount}
                pageSize={pagination.pageSize}
                onPageChange={(page) => setFilter((f) => ({ ...f, pageIndex: page }))}
              />
            </>
          )}
        </div>
      </div>

      {/* Create Task Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => { setShowCreateModal(false); reset(); setCreateError(null); }}
        title="Create New Task"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit(onCreateTask)} className="space-y-4">
          <Input
            id="task-title"
            label="Title *"
            placeholder="Task title..."
            error={errors.title?.message}
            {...register('title')}
          />
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Description</label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Describe the task..."
              className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] text-zinc-100 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none resize-none transition-colors"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select
              id="task-type"
              label="Type *"
              options={[{ value: 'TASK', label: 'Task' }, { value: 'INCIDENT', label: 'Incident' }]}
              error={errors.type?.message}
              {...register('type')}
            />
            <Select
              id="task-priority"
              label="Priority *"
              options={[
                { value: 'LOW', label: 'Low' },
                { value: 'MEDIUM', label: 'Medium' },
                { value: 'HIGH', label: 'High' },
                { value: 'CRITICAL', label: 'Critical' },
              ]}
              error={errors.priority?.message}
              {...register('priority')}
            />
            <Select
              id="task-status"
              label="Status *"
              options={[
                { value: 'TODO', label: 'Todo' },
                { value: 'IN_PROGRESS', label: 'In Progress' },
                { value: 'REVIEW', label: 'Review' },
                { value: 'DONE', label: 'Done' },
              ]}
              error={errors.status?.message}
              {...register('status')}
            />
            <Select
              id="task-assignee"
              label="Assignee"
              options={userOptions}
              {...register('assignedTo')}
            />
          </div>
          <Input
            id="task-duedate"
            label="Due Date"
            type="date"
            leftIcon={<CalendarDays className="h-4 w-4" />}
            {...register('dueDate')}
          />
          {createError && <ErrorMessage message={createError} />}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => { setShowCreateModal(false); reset(); setCreateError(null); }}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" isLoading={isSubmitting}>
              Create Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectDetailPage;
