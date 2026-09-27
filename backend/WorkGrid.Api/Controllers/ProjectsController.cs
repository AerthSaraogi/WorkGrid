using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WorkGrid.Api.DTOs;
using WorkGrid.Api.DTOs.Common;
using WorkGrid.Api.Services;

namespace WorkGrid.Api.Controllers;

[Authorize]
public class ProjectsController : BaseApiController
{
    private readonly IProjectService _projectService;

    public ProjectsController(IProjectService projectService)
    {
        _projectService = projectService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<ProjectDto>>>> GetAll(CancellationToken cancellationToken)
    {
        var projects = await _projectService.GetAllProjectsAsync(cancellationToken);
        return Ok(ApiResponse<IReadOnlyList<ProjectDto>>.Ok(projects));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ApiResponse<ProjectDto>>> GetById(int id, CancellationToken cancellationToken)
    {
        var project = await _projectService.GetProjectByIdAsync(id, cancellationToken);
        return Ok(ApiResponse<ProjectDto>.Ok(project));
    }

    [Authorize(Roles = "ADMIN,MANAGER")]
    [HttpPost]
    public async Task<ActionResult<ApiResponse<ProjectDto>>> Create([FromBody] CreateProjectRequest request, CancellationToken cancellationToken)
    {
        var project = await _projectService.CreateProjectAsync(request, CurrentUserId, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, ApiResponse<ProjectDto>.Ok(project, "Project created successfully", StatusCodes.Status201Created));
    }

    [Authorize(Roles = "ADMIN,MANAGER")]
    [HttpPut("{id:int}")]
    public async Task<ActionResult<ApiResponse<ProjectDto>>> Update(int id, [FromBody] UpdateProjectRequest request, CancellationToken cancellationToken)
    {
        var project = await _projectService.UpdateProjectAsync(id, request, CurrentUserId, CurrentUserRole, cancellationToken);
        return Ok(ApiResponse<ProjectDto>.Ok(project, "Project updated successfully"));
    }

    [Authorize(Roles = "ADMIN")]
    [HttpDelete("{id:int}")]
    public async Task<ActionResult<ApiResponse<object?>>> Delete(int id, CancellationToken cancellationToken)
    {
        await _projectService.DeleteProjectAsync(id, CurrentUserId, CurrentUserRole, cancellationToken);
        return Ok(ApiResponse<object?>.Ok(null, "Project deleted successfully"));
    }
}
