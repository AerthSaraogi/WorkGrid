using Microsoft.EntityFrameworkCore;
using WorkGrid.Api.DTOs;
using WorkGrid.Api.Entities;
using WorkGrid.Api.Middleware;
using WorkGrid.Api.Repositories;

namespace WorkGrid.Api.Services;

public class TaskHistoryService : ITaskHistoryService
{
    private readonly IUnitOfWork _unitOfWork;

    public TaskHistoryService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<TaskHistoryDto>> GetHistoryByTaskIdAsync(int taskId, CancellationToken cancellationToken = default)
    {
        var taskExists = await _unitOfWork.Tasks.Query().AnyAsync(t => t.Id == taskId, cancellationToken);
        if (!taskExists)
        {
            throw new NotFoundException($"Task with ID {taskId} not found.");
        }

        var histories = await _unitOfWork.TaskHistories.Query()
            .Include(h => h.User)
            .Include(h => h.Task)
            .Where(h => h.TaskId == taskId)
            .OrderByDescending(h => h.CreatedAt)
            .ToListAsync(cancellationToken);

        return histories.Select(MapToHistoryDto).ToList();
    }

    private static TaskHistoryDto MapToHistoryDto(TaskHistory history)
    {
        return new TaskHistoryDto
        {
            Id = history.Id,
            TaskId = history.TaskId,
            TaskTitle = history.Task?.Title ?? string.Empty,
            UserId = history.UserId,
            UserName = history.User?.Name ?? "System",
            Action = history.Action,
            OldValue = history.OldValue,
            NewValue = history.NewValue,
            CreatedAt = history.CreatedAt
        };
    }
}
