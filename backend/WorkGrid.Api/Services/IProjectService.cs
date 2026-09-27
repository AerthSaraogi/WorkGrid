using WorkGrid.Api.DTOs;

namespace WorkGrid.Api.Services;

public interface IProjectService
{
    Task<IReadOnlyList<ProjectDto>> GetAllProjectsAsync(CancellationToken cancellationToken = default);
    Task<ProjectDto> GetProjectByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<ProjectDto> CreateProjectAsync(CreateProjectRequest request, int userId, CancellationToken cancellationToken = default);
    Task<ProjectDto> UpdateProjectAsync(int id, UpdateProjectRequest request, int userId, string userRole, CancellationToken cancellationToken = default);
    Task DeleteProjectAsync(int id, int userId, string userRole, CancellationToken cancellationToken = default);
}
