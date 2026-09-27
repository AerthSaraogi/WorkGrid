using WorkGrid.Api.DTOs;
using WorkGrid.Api.DTOs.Common;
using WorkGrid.Api.Entities;
using TaskStatus = WorkGrid.Api.Entities.TaskStatus;

namespace WorkGrid.Api.Services;

public interface ITaskService
{
    Task<PagedResult<TaskDto>> GetTasksByProjectAsync(int projectId, TaskFilterParams filterParams, int currentUserId, string currentUserRole, CancellationToken cancellationToken = default);
    Task<TaskDto> GetTaskByIdAsync(int id, int currentUserId, string currentUserRole, CancellationToken cancellationToken = default);
    Task<TaskDto> CreateTaskAsync(CreateTaskRequest request, int userId, string userRole, CancellationToken cancellationToken = default);
    Task<TaskDto> UpdateTaskAsync(int id, UpdateTaskRequest request, int userId, string userRole, CancellationToken cancellationToken = default);
    Task<TaskDto> UpdateStatusAsync(int id, TaskStatus newStatus, int userId, string userRole, CancellationToken cancellationToken = default);
    Task<TaskDto> UpdatePriorityAsync(int id, TaskPriority newPriority, int userId, string userRole, CancellationToken cancellationToken = default);
    Task<TaskDto> UpdateAssigneeAsync(int id, int? assigneeId, int userId, string userRole, CancellationToken cancellationToken = default);
    Task DeleteTaskAsync(int id, int userId, string userRole, CancellationToken cancellationToken = default);
}
