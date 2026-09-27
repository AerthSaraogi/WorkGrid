using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WorkGrid.Api.DTOs;
using WorkGrid.Api.DTOs.Common;
using WorkGrid.Api.Services;

namespace WorkGrid.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class DashboardController : BaseApiController
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet("project/{projectId:int}")]
    public async Task<ActionResult<ApiResponse<ProjectDashboardDto>>> GetProjectDashboard(int projectId, CancellationToken cancellationToken)
    {
        var dashboard = await _dashboardService.GetProjectDashboardAsync(projectId, cancellationToken);
        return Ok(ApiResponse<ProjectDashboardDto>.Ok(dashboard));
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<GlobalDashboardDto>>> GetGlobalDashboard(CancellationToken cancellationToken)
    {
        var dashboard = await _dashboardService.GetGlobalDashboardAsync(cancellationToken);
        return Ok(ApiResponse<GlobalDashboardDto>.Ok(dashboard));
    }
}
