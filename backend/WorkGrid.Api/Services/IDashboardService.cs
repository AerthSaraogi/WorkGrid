using WorkGrid.Api.DTOs;

namespace WorkGrid.Api.Services;

public interface IDashboardService
{
    Task<ProjectDashboardDto> GetProjectDashboardAsync(int projectId, CancellationToken cancellationToken = default);
    Task<GlobalDashboardDto> GetGlobalDashboardAsync(CancellationToken cancellationToken = default);
}
