import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  MessageSquare,
  RefreshCw,
  Send,
} from 'lucide-react';
import { tasksApi, commentsApi, historyApi, authApi } from '../services/api';
import type { Comment, TaskHistory, TaskItem, TaskPriority, TaskStatus, User } from '../types';
import { useAuth } from '../context/AuthContext';
import { TopNav } from '../components/layout/TopNav';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { ActivityTimeline } from '../components/dashboard/ActivityTimeline';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';

const TaskDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const taskId = parseInt(id || '0', 10);
  const navigate = useNavigate();
  const { hasRole, user } = useAuth();

  const [task, setTask] = useState<TaskItem | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [history, setHistory] = useState<TaskHistory[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const canChangeStatus = hasRole(['ADMIN', 'MANAGER', 'DEVELOPER']);
  const canChangePriority = hasRole(['ADMIN', 'MANAGER']);
  const canChangeAssignee = hasRole(['ADMIN', 'MANAGER']);
  const canComment = hasRole(['ADMIN', 'MANAGER', 'DEVELOPER']);

  const userOptions = useMemo(
    () => [
      { value: '', label: 'Unassigned' },
      ...users.map((u) => ({ value: String(u.id), label: u.name })),
    ],
    [users]
  );

  const loadAll = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [taskData, commentsData, historyData, usersData] = await Promise.all([
        tasksApi.getById(taskId),
        commentsApi.getByTask(taskId),
        historyApi.getByTask(taskId),
        authApi.getUsers(),
      ]);
      setTask(taskData);
      setComments(commentsData);
      setHistory(historyData);
      setUsers(usersData);
    } catch (err: any) {
      setError(err.message || 'Failed to load task details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (taskId) loadAll();
  }, [taskId]);

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (!task) return;
    setIsUpdating(true);
    try {
      const updated = await tasksApi.updateStatus(task.id, newStatus);
      setTask(updated);
      const updatedHistory = await historyApi.getByTask(task.id);
      setHistory(updatedHistory);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePriorityChange = async (newPriority: TaskPriority) => {
    if (!task) return;
    setIsUpdating(true);
    try {
      const updated = await tasksApi.updatePriority(task.id, newPriority);
      setTask(updated);
      const updatedHistory = await historyApi.getByTask(task.id);
      setHistory(updatedHistory);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAssigneeChange = async (assigneeId: string) => {
    if (!task) return;
    setIsUpdating(true);
    try {
      const updated = await tasksApi.updateAssignee(task.id, assigneeId ? parseInt(assigneeId) : null);
      setTask(updated);
      const updatedHistory = await historyApi.getByTask(task.id);
      setHistory(updatedHistory);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddComment = async () => {
    if (!task || !newComment.trim()) return;
    setIsSubmittingComment(true);
    try {
      const comment = await commentsApi.create(task.id, newComment.trim());
      setComments((prev) => [...prev, comment]);
      setNewComment('');
      const updatedHistory = await historyApi.getByTask(task.id);
      setHistory(updatedHistory);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner size="lg" text="Loading task..." />
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="p-6">
        <ErrorMessage message={error || 'Task not found'} onRetry={loadAll} />
      </div>
    );
  }

  const isPastDue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';

  return (
    <div className="flex flex-col h-full">
      <TopNav title={task.title} subtitle={`${task.projectName} · #${task.id}`} />

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 h-full">
          {/* Main Content */}
          <div className="lg:col-span-2 border-r border-white/[0.06] px-6 py-6 space-y-6 overflow-y-auto">
            {/* Back + Type Badge */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <Badge value={task.type} variant="type" size="md" />
              <Badge value={task.priority} variant="priority" size="md" />
              <Badge value={task.status} variant="status" size="md" />
            </div>

            {/* Title + Description */}
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight leading-snug">
                {task.title}
              </h1>
              {task.description && (
                <p className="mt-3 text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">
                  {task.description}
                </p>
              )}
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs rounded-xl bg-white/[0.02] border border-white/[0.06] p-4">
              <div>
                <p className="text-slate-500 font-medium uppercase tracking-wide mb-1">Created by</p>
                <p className="text-slate-200 font-semibold">{task.creatorName}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium uppercase tracking-wide mb-1">Assigned to</p>
                <p className="text-slate-200 font-semibold">{task.assigneeName || 'Unassigned'}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium uppercase tracking-wide mb-1">Created at</p>
                <p className="text-slate-300">{formatDate(task.createdAt)}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium uppercase tracking-wide mb-1">Last updated</p>
                <p className="text-slate-300">{formatDate(task.updatedAt)}</p>
              </div>
              {task.dueDate && (
                <div className="col-span-2">
                  <p className="text-slate-500 font-medium uppercase tracking-wide mb-1 flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" /> Due date
                  </p>
                  <p className={`font-semibold ${isPastDue ? 'text-rose-400' : 'text-slate-200'}`}>
                    {formatDate(task.dueDate)}
                    {isPastDue && <span className="ml-2 text-rose-400/80">(Overdue)</span>}
                  </p>
                </div>
              )}
            </div>

            {/* Comments */}
            <div>
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Comments ({comments.length})
              </h3>

              {comments.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">No comments yet. Be the first to comment.</p>
              ) : (
                <div className="space-y-3 mb-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-700/60 text-xs font-bold text-white">
                          {comment.userName.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs font-semibold text-slate-300">{comment.userName}</span>
                        <span className="text-xs text-slate-500 ml-auto">{formatDate(comment.createdAt)}</span>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {canComment && (
                <div className="flex gap-3 items-start mt-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-700/60 text-xs font-bold text-white">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 space-y-2">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={3}
                      placeholder="Add a comment..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAddComment();
                      }}
                      className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] text-zinc-100 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none resize-none transition-colors"
                    />
                    <Button
                      onClick={handleAddComment}
                      size="sm"
                      isLoading={isSubmittingComment}
                      disabled={!newComment.trim()}
                      leftIcon={<Send className="h-3.5 w-3.5" />}
                    >
                      Post comment
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Controls + Activity */}
          <div className="px-5 py-6 space-y-6 overflow-y-auto">
            {/* Controls */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Task Controls</h3>
              {canChangeStatus && (
                <Select
                  label="Status"
                  options={[
                    { value: 'TODO', label: 'Todo' },
                    { value: 'IN_PROGRESS', label: 'In Progress' },
                    { value: 'REVIEW', label: 'Review' },
                    { value: 'DONE', label: 'Done' },
                  ]}
                  value={task.status}
                  onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
                  disabled={isUpdating}
                />
              )}
              {canChangePriority && (
                <Select
                  label="Priority"
                  options={[
                    { value: 'LOW', label: 'Low' },
                    { value: 'MEDIUM', label: 'Medium' },
                    { value: 'HIGH', label: 'High' },
                    { value: 'CRITICAL', label: 'Critical' },
                  ]}
                  value={task.priority}
                  onChange={(e) => handlePriorityChange(e.target.value as TaskPriority)}
                  disabled={isUpdating}
                />
              )}
              {canChangeAssignee && (
                <Select
                  label="Assignee"
                  options={userOptions}
                  value={String(task.assignedTo || '')}
                  onChange={(e) => handleAssigneeChange(e.target.value)}
                  disabled={isUpdating}
                />
              )}
              {isUpdating && (
                <div className="flex items-center gap-2 text-xs text-indigo-400">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  Saving changes...
                </div>
              )}
            </div>

            {/* Activity Timeline */}
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                Activity Timeline
              </h3>
              <ActivityTimeline activities={history} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailPage;
