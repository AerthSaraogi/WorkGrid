import { useCallback, useEffect, useState } from 'react';
import { tasksApi } from '../services/api';
import type {
  PagedResult,
  TaskFilterOptions,
  TaskItem,
  TaskPriority,
  TaskStatus,
} from '../types';

export function useTasks(projectId: number, initialFilter?: TaskFilterOptions) {
  const [tasksResult, setTasksResult] = useState<PagedResult<TaskItem>>({
    items: [],
    pageIndex: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  });
  const [filter, setFilter] = useState<TaskFilterOptions>({
    pageIndex: 1,
    pageSize: 10,
    sortBy: 'CreatedAt',
    isDescending: true,
    ...initialFilter,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await tasksApi.getByProject(projectId, filter);
      setTasksResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  }, [projectId, filter]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const updateStatus = async (taskId: number, status: TaskStatus) => {
    const updated = await tasksApi.updateStatus(taskId, status);
    setTasksResult((prev) => ({
      ...prev,
      items: prev.items.map((t) => (t.id === taskId ? updated : t)),
    }));
    return updated;
  };

  const updatePriority = async (taskId: number, priority: TaskPriority) => {
    const updated = await tasksApi.updatePriority(taskId, priority);
    setTasksResult((prev) => ({
      ...prev,
      items: prev.items.map((t) => (t.id === taskId ? updated : t)),
    }));
    return updated;
  };

  const updateAssignee = async (taskId: number, assignedTo: number | null) => {
    const updated = await tasksApi.updateAssignee(taskId, assignedTo);
    setTasksResult((prev) => ({
      ...prev,
      items: prev.items.map((t) => (t.id === taskId ? updated : t)),
    }));
    return updated;
  };

  const createTask = async (taskData: Partial<TaskItem> & { title: string }) => {
    const created = await tasksApi.create({ ...taskData, projectId });
    await fetchTasks();
    return created;
  };

  const deleteTask = async (taskId: number) => {
    await tasksApi.delete(taskId);
    await fetchTasks();
  };

  return {
    tasks: tasksResult.items,
    pagination: tasksResult,
    filter,
    setFilter,
    isLoading,
    error,
    refreshTasks: fetchTasks,
    updateStatus,
    updatePriority,
    updateAssignee,
    createTask,
    deleteTask,
  };
}
