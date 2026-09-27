import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderKanban, Plus, Search, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../hooks/useProjects';
import { TopNav } from '../components/layout/TopNav';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(150),
  description: z.string().max(1000).optional(),
});
type ProjectFormData = z.infer<typeof projectSchema>;

const ProjectsPage: React.FC = () => {
  const { projects, isLoading, error, createProject, deleteProject, refreshProjects } = useProjects();
  const { hasRole } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormData>({ resolver: zodResolver(projectSchema) });

  const canCreateProject = hasRole(['ADMIN', 'MANAGER']);
  const canDeleteProject = hasRole(['ADMIN']);

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
  );

  const onCreateProject = async (data: ProjectFormData) => {
    setCreateError(null);
    try {
      await createProject({ name: data.name, description: data.description || '' });
      setShowCreateModal(false);
      reset();
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create project');
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this project? All tasks will be deleted.')) return;
    try {
      await deleteProject(id);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <TopNav title="Projects" subtitle="All team projects and workspaces" />

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
        {/* Header Actions */}
        <div className="flex items-center gap-3">
          <div className="flex-1 max-w-sm">
            <Input
              id="projects-search"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
          {canCreateProject && (
            <Button
              id="create-project-btn"
              onClick={() => setShowCreateModal(true)}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              New Project
            </Button>
          )}
        </div>

        {error && <ErrorMessage message={error} onRetry={refreshProjects} />}

        {isLoading ? (
          <LoadingSpinner text="Loading projects..." />
        ) : filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 py-20 text-center">
            <FolderKanban className="h-12 w-12 text-slate-600 mb-4" />
            <p className="text-slate-400 font-medium">No projects found</p>
            <p className="text-xs text-slate-500 mt-1">
              {canCreateProject ? 'Create your first project to get started.' : 'No projects available yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => navigate(`/projects/${project.id}`)}
                className="group relative rounded-2xl border border-white/[0.08] bg-[#11131c] p-6 cursor-pointer hover:border-indigo-500/50 hover:bg-[#151724] hover:shadow-xl hover:shadow-black/40 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600/30 to-purple-600/30 border border-indigo-700/30">
                    <FolderKanban className="h-5 w-5 text-indigo-400" />
                  </div>
                  {canDeleteProject && (
                    <button
                      onClick={(e) => handleDelete(e, project.id)}
                      className="opacity-0 group-hover:opacity-100 rounded-lg p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <h3 className="font-semibold text-slate-100 text-sm mb-1 truncate">{project.name}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-4 min-h-[32px]">
                  {project.description || 'No description provided.'}
                </p>
                <div className="flex items-center justify-between border-t border-slate-800 pt-3 mt-auto">
                  <div className="text-xs text-slate-400">
                    <span className="font-semibold text-slate-200">{project.taskCount}</span> tasks
                  </div>
                  <div className="text-xs text-slate-500">
                    <span className="font-semibold text-indigo-400">{project.openTaskCount}</span> open
                  </div>
                  <div className="text-xs text-slate-500">
                    {project.creatorName}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => { setShowCreateModal(false); reset(); setCreateError(null); }}
        title="Create New Project"
        description="Add a new project to organize your team's work"
      >
        <form onSubmit={handleSubmit(onCreateProject)} className="space-y-4">
          <Input
            id="project-name"
            label="Project Name"
            placeholder="e.g. Payment Gateway Integration"
            error={errors.name?.message}
            {...register('name')}
          />
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Brief description of the project goals..."
              className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] text-zinc-100 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none resize-none transition-colors"
            />
          </div>
          {createError && <ErrorMessage message={createError} />}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => { setShowCreateModal(false); reset(); setCreateError(null); }}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" isLoading={isSubmitting}>
              Create Project
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectsPage;
