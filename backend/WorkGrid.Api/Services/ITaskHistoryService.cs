using WorkGrid.Api.DTOs;

namespace WorkGrid.Api.Services;

public interface ITaskHistoryService
{
    Task<IReadOnlyList<TaskHistoryDto>> GetHistoryByTaskIdAsync(int taskId, CancellationToken cancellationToken = default);
}
