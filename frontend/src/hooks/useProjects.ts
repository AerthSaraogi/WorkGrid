import { useCallback, useEffect, useState } from 'react';
import { projectsApi } from '../services/api';
import type { Project } from '../types';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await projectsApi.getAll();
      setProjects(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const createProject = async (data: { name: string; description: string }) => {
    const newProject = await projectsApi.create(data);
    setProjects((prev) => [newProject, ...prev]);
    return newProject;
  };

  const updateProject = async (id: number, data: { name: string; description: string }) => {
    const updated = await projectsApi.update(id, data);
    setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
    return updated;
  };

  const deleteProject = async (id: number) => {
    await projectsApi.delete(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  return {
    projects,
    isLoading,
    error,
    refreshProjects: fetchProjects,
    createProject,
    updateProject,
    deleteProject,
  };
}
