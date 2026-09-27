using Microsoft.EntityFrameworkCore;
using WorkGrid.Api.DTOs;
using WorkGrid.Api.Entities;
using WorkGrid.Api.Middleware;
using WorkGrid.Api.Repositories;
using TaskStatus = WorkGrid.Api.Entities.TaskStatus;

namespace WorkGrid.Api.Services;

public class DashboardService : IDashboardService
{
    private readonly IUnitOfWork _unitOfWork;

    public DashboardService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ProjectDashboardDto> GetProjectDashboardAsync(int projectId, CancellationToken cancellationToken = default)
    {
        var project = await _unitOfWork.Projects.GetByIdAsync(projectId, cancellationToken);
        if (project == null)
        {
            throw new NotFoundException($"Project with ID {projectId} not found.");
        }

        var tasksQuery = _unitOfWork.Tasks.Query()
            .Include(t => t.Project)
            .Include(t => t.Assignee)
            .Include(t => t.Creator)
            .Where(t => t.ProjectId == projectId);

        var allTasks = await tasksQuery.ToListAsync(cancellationToken);

        var recentTasks = allTasks
            .OrderByDescending(t => t.CreatedAt)
            .Take(50)
            .Select(MapToTaskDto)
            .ToList();

        var criticalIncidents = allTasks
            .Where(t => t.Type == TaskType.INCIDENT && t.Priority == TaskPriority.CRITICAL && t.Status != TaskStatus.DONE)
            .OrderByDescending(t => t.CreatedAt)
            .Select(MapToTaskDto)
            .ToList();

        var recentActivity = await _unitOfWork.TaskHistories.Query()
            .Include(h => h.User)
            .Include(h => h.Task)
            .Where(h => h.Task != null && h.Task.ProjectId == projectId)
            .OrderByDescending(h => h.CreatedAt)
            .Take(10)
            .Select(h => new TaskHistoryDto
            {
                Id = h.Id,
                TaskId = h.TaskId,
                TaskTitle = h.Task != null ? h.Task.Title : string.Empty,
                UserId = h.UserId,
                UserName = h.User != null ? h.User.Name : "System",
                Action = h.Action,
                OldValue = h.OldValue,
                NewValue = h.NewValue,
                CreatedAt = h.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return new ProjectDashboardDto
        {
            ProjectId = project.Id,
            ProjectName = project.Name,
            TotalTasks = allTasks.Count,
            TodoCount = allTasks.Count(t => t.Status == TaskStatus.TODO),
            InProgressCount = allTasks.Count(t => t.Status == TaskStatus.IN_PROGRESS),
            ReviewCount = allTasks.Count(t => t.Status == TaskStatus.REVIEW),
            DoneCount = allTasks.Count(t => t.Status == TaskStatus.DONE),
            CriticalIncidentsCount = allTasks.Count(t => t.Type == TaskType.INCIDENT && t.Priority == TaskPriority.CRITICAL && t.Status != TaskStatus.DONE),
            RecentTasks = recentTasks,
            CriticalIncidents = criticalIncidents,
            RecentActivity = recentActivity
        };
    }

    public async Task<GlobalDashboardDto> GetGlobalDashboardAsync(CancellationToken cancellationToken = default)
    {
        var totalProjects = await _unitOfWork.Projects.Query().CountAsync(cancellationToken);

        var tasksQuery = _unitOfWork.Tasks.Query()
            .Include(t => t.Project)
            .Include(t => t.Assignee)
            .Include(t => t.Creator);

        var allTasks = await tasksQuery.ToListAsync(cancellationToken);

        var recentTasks = allTasks
            .OrderByDescending(t => t.CreatedAt)
            .Take(50)
            .Select(MapToTaskDto)
            .ToList();

        var criticalIncidents = allTasks
            .Where(t => t.Type == TaskType.INCIDENT && t.Priority == TaskPriority.CRITICAL && t.Status != TaskStatus.DONE)
            .OrderByDescending(t => t.CreatedAt)
            .Take(50)
            .Select(MapToTaskDto)
            .ToList();

        var recentActivity = await _unitOfWork.TaskHistories.Query()
            .Include(h => h.User)
            .Include(h => h.Task)
            .OrderByDescending(h => h.CreatedAt)
            .Take(10)
            .Select(h => new TaskHistoryDto
            {
                Id = h.Id,
                TaskId = h.TaskId,
                TaskTitle = h.Task != null ? h.Task.Title : string.Empty,
                UserId = h.UserId,
                UserName = h.User != null ? h.User.Name : "System",
                Action = h.Action,
                OldValue = h.OldValue,
                NewValue = h.NewValue,
                CreatedAt = h.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return new GlobalDashboardDto
        {
            TotalProjects = totalProjects,
            TotalTasks = allTasks.Count,
            TodoCount = allTasks.Count(t => t.Status == TaskStatus.TODO),
            InProgressCount = allTasks.Count(t => t.Status == TaskStatus.IN_PROGRESS),
            ReviewCount = allTasks.Count(t => t.Status == TaskStatus.REVIEW),
            DoneCount = allTasks.Count(t => t.Status == TaskStatus.DONE),
            CriticalIncidentsCount = allTasks.Count(t => t.Type == TaskType.INCIDENT && t.Priority == TaskPriority.CRITICAL && t.Status != TaskStatus.DONE),
            RecentTasks = recentTasks,
            CriticalIncidents = criticalIncidents,
            RecentActivity = recentActivity
        };
    }

    private static TaskDto MapToTaskDto(TaskItem task)
    {
        return new TaskDto
        {
            Id = task.Id,
            ProjectId = task.ProjectId,
            ProjectName = task.Project?.Name ?? string.Empty,
            Title = task.Title,
            Description = task.Description,
            Type = task.Type,
            Status = task.Status,
            Priority = task.Priority,
            AssignedTo = task.AssignedTo,
            AssigneeName = task.Assignee?.Name,
            CreatedBy = task.CreatedBy,
            CreatorName = task.Creator?.Name ?? string.Empty,
            CreatedAt = task.CreatedAt,
            UpdatedAt = task.UpdatedAt,
            DueDate = task.DueDate
        };
    }
}
