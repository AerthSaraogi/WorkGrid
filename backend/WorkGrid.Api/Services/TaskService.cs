using Microsoft.EntityFrameworkCore;
using WorkGrid.Api.DTOs;
using WorkGrid.Api.DTOs.Common;
using WorkGrid.Api.Entities;
using WorkGrid.Api.Middleware;
using WorkGrid.Api.Repositories;
using TaskStatus = WorkGrid.Api.Entities.TaskStatus;

namespace WorkGrid.Api.Services;

public class TaskService : ITaskService
{
    private readonly IUnitOfWork _unitOfWork;

    public TaskService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<PagedResult<TaskDto>> GetTasksByProjectAsync(
        int projectId,
        TaskFilterParams filterParams,
        int currentUserId,
        string currentUserRole,
        CancellationToken cancellationToken = default)
    {
        var projectExists = await _unitOfWork.Projects.Query().AnyAsync(p => p.Id == projectId, cancellationToken);
        if (!projectExists)
        {
            throw new NotFoundException($"Project with ID {projectId} not found.");
        }

        var query = _unitOfWork.Tasks.Query()
            .Include(t => t.Project)
            .Include(t => t.Assignee)
            .Include(t => t.Creator)
            .Include(t => t.Comments)
            .Where(t => t.ProjectId == projectId);

        // Search Filter (Title or Description)
        if (!string.IsNullOrWhiteSpace(filterParams.Search))
        {
            var search = filterParams.Search.Trim().ToLower();
            query = query.Where(t => t.Title.ToLower().Contains(search) || t.Description.ToLower().Contains(search));
        }

        // Status Filter
        if (filterParams.Status.HasValue)
        {
            query = query.Where(t => t.Status == filterParams.Status.Value);
        }

        // Priority Filter
        if (filterParams.Priority.HasValue)
        {
            query = query.Where(t => t.Priority == filterParams.Priority.Value);
        }

        // Type Filter
        if (filterParams.Type.HasValue)
        {
            query = query.Where(t => t.Type == filterParams.Type.Value);
        }

        // AssignedTo Filter
        if (filterParams.AssignedTo.HasValue)
        {
            query = query.Where(t => t.AssignedTo == filterParams.AssignedTo.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        // Sorting
        query = filterParams.SortBy?.ToLower() switch
        {
            "priority" => filterParams.IsDescending ? query.OrderByDescending(t => t.Priority) : query.OrderBy(t => t.Priority),
            "status" => filterParams.IsDescending ? query.OrderByDescending(t => t.Status) : query.OrderBy(t => t.Status),
            "duedate" => filterParams.IsDescending ? query.OrderByDescending(t => t.DueDate) : query.OrderBy(t => t.DueDate),
            "title" => filterParams.IsDescending ? query.OrderByDescending(t => t.Title) : query.OrderBy(t => t.Title),
            _ => filterParams.IsDescending ? query.OrderByDescending(t => t.CreatedAt) : query.OrderBy(t => t.CreatedAt)
        };

        // Pagination
        var pageIndex = Math.Max(1, filterParams.PageIndex);
        var pageSize = Math.Clamp(filterParams.PageSize, 1, 100);

        var tasks = await query
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<TaskDto>
        {
            Items = tasks.Select(MapToTaskDto),
            PageIndex = pageIndex,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    public async Task<TaskDto> GetTaskByIdAsync(int id, int currentUserId, string currentUserRole, CancellationToken cancellationToken = default)
    {
        var task = await _unitOfWork.Tasks.Query()
            .Include(t => t.Project)
            .Include(t => t.Assignee)
            .Include(t => t.Creator)
            .Include(t => t.Comments)
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);

        if (task == null)
        {
            throw new NotFoundException($"Task with ID {id} not found.");
        }

        return MapToTaskDto(task);
    }

    public async Task<TaskDto> CreateTaskAsync(CreateTaskRequest request, int userId, string userRole, CancellationToken cancellationToken = default)
    {
        if (userRole == nameof(UserRole.VIEWER) || userRole == nameof(UserRole.DEVELOPER))
        {
            throw new ForbiddenException("Only Managers and Admins can create tasks.");
        }

        var project = await _unitOfWork.Projects.GetByIdAsync(request.ProjectId, cancellationToken);
        if (project == null)
        {
            throw new NotFoundException($"Project with ID {request.ProjectId} not found.");
        }

        string? assigneeName = null;
        if (request.AssignedTo.HasValue)
        {
            var assignee = await _unitOfWork.Users.GetByIdAsync(request.AssignedTo.Value, cancellationToken);
            if (assignee == null)
            {
                throw new BadRequestException($"Assigned user ID {request.AssignedTo.Value} does not exist.");
            }
            assigneeName = assignee.Name;
        }

        var task = new TaskItem
        {
            ProjectId = request.ProjectId,
            Title = request.Title.Trim(),
            Description = request.Description?.Trim() ?? string.Empty,
            Type = request.Type,
            Priority = request.Priority,
            Status = request.Status,
            AssignedTo = request.AssignedTo,
            CreatedBy = userId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            DueDate = request.DueDate
        };

        await _unitOfWork.Tasks.AddAsync(task, cancellationToken);
        await _unitOfWork.CompleteAsync(cancellationToken);

        // Record initial history
        var createHistory = new TaskHistory
        {
            TaskId = task.Id,
            UserId = userId,
            Action = "Created task",
            OldValue = null,
            NewValue = task.Status.ToString(),
            CreatedAt = DateTime.UtcNow
        };
        await _unitOfWork.TaskHistories.AddAsync(createHistory, cancellationToken);

        if (request.AssignedTo.HasValue)
        {
            var assignHistory = new TaskHistory
            {
                TaskId = task.Id,
                UserId = userId,
                Action = "Assigned task",
                OldValue = "Unassigned",
                NewValue = assigneeName,
                CreatedAt = DateTime.UtcNow
            };
            await _unitOfWork.TaskHistories.AddAsync(assignHistory, cancellationToken);
        }

        await _unitOfWork.CompleteAsync(cancellationToken);

        return await GetTaskByIdAsync(task.Id, userId, userRole, cancellationToken);
    }

    public async Task<TaskDto> UpdateTaskAsync(int id, UpdateTaskRequest request, int userId, string userRole, CancellationToken cancellationToken = default)
    {
        if (userRole == nameof(UserRole.VIEWER))
        {
            throw new ForbiddenException("Viewers cannot modify tasks.");
        }

        var task = await _unitOfWork.Tasks.Query()
            .Include(t => t.Assignee)
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);

        if (task == null)
        {
            throw new NotFoundException($"Task with ID {id} not found.");
        }

        // Developers can only update tasks assigned to them, and cannot change assignment or priority
        if (userRole == nameof(UserRole.DEVELOPER))
        {
            if (task.AssignedTo != userId)
            {
                throw new ForbiddenException("Developers can only update tasks assigned to them.");
            }
            if (task.Priority != request.Priority)
            {
                throw new ForbiddenException("Developers cannot modify task priority.");
            }
            if (task.AssignedTo != request.AssignedTo)
            {
                throw new ForbiddenException("Developers cannot reassign tasks.");
            }
        }

        var oldStatus = task.Status;
        var oldPriority = task.Priority;
        var oldAssignedTo = task.AssignedTo;
        var oldAssigneeName = task.Assignee?.Name ?? "Unassigned";

        task.Title = request.Title.Trim();
        task.Description = request.Description?.Trim() ?? string.Empty;
        task.Type = request.Type;
        task.Priority = request.Priority;
        task.Status = request.Status;
        task.AssignedTo = request.AssignedTo;
        task.DueDate = request.DueDate;
        task.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Tasks.Update(task);

        // Record history for changes
        if (oldStatus != request.Status)
        {
            await _unitOfWork.TaskHistories.AddAsync(new TaskHistory
            {
                TaskId = task.Id,
                UserId = userId,
                Action = "Changed status",
                OldValue = oldStatus.ToString(),
                NewValue = request.Status.ToString(),
                CreatedAt = DateTime.UtcNow
            }, cancellationToken);
        }

        if (oldPriority != request.Priority)
        {
            await _unitOfWork.TaskHistories.AddAsync(new TaskHistory
            {
                TaskId = task.Id,
                UserId = userId,
                Action = "Changed priority",
                OldValue = oldPriority.ToString(),
                NewValue = request.Priority.ToString(),
                CreatedAt = DateTime.UtcNow
            }, cancellationToken);
        }

        if (oldAssignedTo != request.AssignedTo)
        {
            string newAssigneeName = "Unassigned";
            if (request.AssignedTo.HasValue)
            {
                var newAssignee = await _unitOfWork.Users.GetByIdAsync(request.AssignedTo.Value, cancellationToken);
                newAssigneeName = newAssignee?.Name ?? "Unknown";
            }

            await _unitOfWork.TaskHistories.AddAsync(new TaskHistory
            {
                TaskId = task.Id,
                UserId = userId,
                Action = "Assigned task",
                OldValue = oldAssigneeName,
                NewValue = newAssigneeName,
                CreatedAt = DateTime.UtcNow
            }, cancellationToken);
        }

        await _unitOfWork.CompleteAsync(cancellationToken);

        return await GetTaskByIdAsync(task.Id, userId, userRole, cancellationToken);
    }

    public async Task<TaskDto> UpdateStatusAsync(int id, TaskStatus newStatus, int userId, string userRole, CancellationToken cancellationToken = default)
    {
        if (userRole == nameof(UserRole.VIEWER))
        {
            throw new ForbiddenException("Viewers cannot update task status.");
        }

        var task = await _unitOfWork.Tasks.GetByIdAsync(id, cancellationToken);
        if (task == null)
        {
            throw new NotFoundException($"Task with ID {id} not found.");
        }

        if (task.Status == newStatus)
        {
            return await GetTaskByIdAsync(id, userId, userRole, cancellationToken);
        }

        var oldStatus = task.Status;
        task.Status = newStatus;
        task.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Tasks.Update(task);

        await _unitOfWork.TaskHistories.AddAsync(new TaskHistory
        {
            TaskId = task.Id,
            UserId = userId,
            Action = "Changed status",
            OldValue = oldStatus.ToString(),
            NewValue = newStatus.ToString(),
            CreatedAt = DateTime.UtcNow
        }, cancellationToken);

        await _unitOfWork.CompleteAsync(cancellationToken);

        return await GetTaskByIdAsync(id, userId, userRole, cancellationToken);
    }

    public async Task<TaskDto> UpdatePriorityAsync(int id, TaskPriority newPriority, int userId, string userRole, CancellationToken cancellationToken = default)
    {
        if (userRole == nameof(UserRole.VIEWER) || userRole == nameof(UserRole.DEVELOPER))
        {
            throw new ForbiddenException("Only Managers and Admins can update task priority.");
        }

        var task = await _unitOfWork.Tasks.GetByIdAsync(id, cancellationToken);
        if (task == null)
        {
            throw new NotFoundException($"Task with ID {id} not found.");
        }

        if (task.Priority == newPriority)
        {
            return await GetTaskByIdAsync(id, userId, userRole, cancellationToken);
        }

        var oldPriority = task.Priority;
        task.Priority = newPriority;
        task.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Tasks.Update(task);

        await _unitOfWork.TaskHistories.AddAsync(new TaskHistory
        {
            TaskId = task.Id,
            UserId = userId,
            Action = "Changed priority",
            OldValue = oldPriority.ToString(),
            NewValue = newPriority.ToString(),
            CreatedAt = DateTime.UtcNow
        }, cancellationToken);

        await _unitOfWork.CompleteAsync(cancellationToken);

        return await GetTaskByIdAsync(id, userId, userRole, cancellationToken);
    }

    public async Task<TaskDto> UpdateAssigneeAsync(int id, int? assigneeId, int userId, string userRole, CancellationToken cancellationToken = default)
    {
        if (userRole == nameof(UserRole.VIEWER) || userRole == nameof(UserRole.DEVELOPER))
        {
            throw new ForbiddenException("Only Managers and Admins can assign tasks.");
        }

        var task = await _unitOfWork.Tasks.Query()
            .Include(t => t.Assignee)
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);

        if (task == null)
        {
            throw new NotFoundException($"Task with ID {id} not found.");
        }

        var oldAssigneeName = task.Assignee?.Name ?? "Unassigned";
        string newAssigneeName = "Unassigned";

        if (assigneeId.HasValue)
        {
            var assignee = await _unitOfWork.Users.GetByIdAsync(assigneeId.Value, cancellationToken);
            if (assignee == null)
            {
                throw new BadRequestException($"Assigned user ID {assigneeId.Value} does not exist.");
            }
            newAssigneeName = assignee.Name;
        }

        task.AssignedTo = assigneeId;
        task.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Tasks.Update(task);

        await _unitOfWork.TaskHistories.AddAsync(new TaskHistory
        {
            TaskId = task.Id,
            UserId = userId,
            Action = "Assigned task",
            OldValue = oldAssigneeName,
            NewValue = newAssigneeName,
            CreatedAt = DateTime.UtcNow
        }, cancellationToken);

        await _unitOfWork.CompleteAsync(cancellationToken);

        return await GetTaskByIdAsync(id, userId, userRole, cancellationToken);
    }

    public async Task DeleteTaskAsync(int id, int userId, string userRole, CancellationToken cancellationToken = default)
    {
        if (userRole == nameof(UserRole.VIEWER) || userRole == nameof(UserRole.DEVELOPER))
        {
            throw new ForbiddenException("Only Managers and Admins can delete tasks.");
        }

        var task = await _unitOfWork.Tasks.GetByIdAsync(id, cancellationToken);
        if (task == null)
        {
            throw new NotFoundException($"Task with ID {id} not found.");
        }

        _unitOfWork.Tasks.Remove(task);
        await _unitOfWork.CompleteAsync(cancellationToken);
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
            DueDate = task.DueDate,
            CommentCount = task.Comments?.Count ?? 0
        };
    }
}
