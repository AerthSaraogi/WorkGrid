using Microsoft.EntityFrameworkCore;
using WorkGrid.Api.DTOs;
using WorkGrid.Api.Entities;
using WorkGrid.Api.Middleware;
using WorkGrid.Api.Repositories;
using TaskStatus = WorkGrid.Api.Entities.TaskStatus;

namespace WorkGrid.Api.Services;

public class ProjectService : IProjectService
{
    private readonly IUnitOfWork _unitOfWork;

    public ProjectService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<ProjectDto>> GetAllProjectsAsync(CancellationToken cancellationToken = default)
    {
        var projects = await _unitOfWork.Projects.Query()
            .Include(p => p.Creator)
            .Include(p => p.Tasks)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync(cancellationToken);

        return projects.Select(MapToProjectDto).ToList();
    }

    public async Task<ProjectDto> GetProjectByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var project = await _unitOfWork.Projects.Query()
            .Include(p => p.Creator)
            .Include(p => p.Tasks)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

        if (project == null)
        {
            throw new NotFoundException($"Project with ID {id} not found.");
        }

        return MapToProjectDto(project);
    }

    public async Task<ProjectDto> CreateProjectAsync(CreateProjectRequest request, int userId, CancellationToken cancellationToken = default)
    {
        var project = new Project
        {
            Name = request.Name.Trim(),
            Description = request.Description?.Trim() ?? string.Empty,
            CreatedBy = userId,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Projects.AddAsync(project, cancellationToken);
        await _unitOfWork.CompleteAsync(cancellationToken);

        return await GetProjectByIdAsync(project.Id, cancellationToken);
    }

    public async Task<ProjectDto> UpdateProjectAsync(int id, UpdateProjectRequest request, int userId, string userRole, CancellationToken cancellationToken = default)
    {
        var project = await _unitOfWork.Projects.GetByIdAsync(id, cancellationToken);
        if (project == null)
        {
            throw new NotFoundException($"Project with ID {id} not found.");
        }

        // Only ADMIN or the manager who created it can update
        if (userRole != nameof(UserRole.ADMIN) && project.CreatedBy != userId)
        {
            throw new ForbiddenException("You do not have permission to modify this project.");
        }

        project.Name = request.Name.Trim();
        project.Description = request.Description?.Trim() ?? string.Empty;

        _unitOfWork.Projects.Update(project);
        await _unitOfWork.CompleteAsync(cancellationToken);

        return await GetProjectByIdAsync(project.Id, cancellationToken);
    }

    public async Task DeleteProjectAsync(int id, int userId, string userRole, CancellationToken cancellationToken = default)
    {
        var project = await _unitOfWork.Projects.GetByIdAsync(id, cancellationToken);
        if (project == null)
        {
            throw new NotFoundException($"Project with ID {id} not found.");
        }

        // Only ADMIN can delete projects
        if (userRole != nameof(UserRole.ADMIN))
        {
            throw new ForbiddenException("Only administrators can delete projects.");
        }

        _unitOfWork.Projects.Remove(project);
        await _unitOfWork.CompleteAsync(cancellationToken);
    }

    private static ProjectDto MapToProjectDto(Project project)
    {
        return new ProjectDto
        {
            Id = project.Id,
            Name = project.Name,
            Description = project.Description,
            CreatedBy = project.CreatedBy,
            CreatorName = project.Creator?.Name ?? "Unknown",
            CreatedAt = project.CreatedAt,
            TaskCount = project.Tasks.Count,
            OpenTaskCount = project.Tasks.Count(t => t.Status != TaskStatus.DONE)
        };
    }
}
