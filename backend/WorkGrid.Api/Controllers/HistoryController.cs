using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WorkGrid.Api.DTOs;
using WorkGrid.Api.DTOs.Common;
using WorkGrid.Api.Services;

namespace WorkGrid.Api.Controllers;

[Authorize]
[ApiController]
public class HistoryController : BaseApiController
{
    private readonly ITaskHistoryService _historyService;

    public HistoryController(ITaskHistoryService historyService)
    {
        _historyService = historyService;
    }

    [HttpGet("/api/tasks/{taskId:int}/history")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<TaskHistoryDto>>>> GetByTaskId(int taskId, CancellationToken cancellationToken)
    {
        var history = await _historyService.GetHistoryByTaskIdAsync(taskId, cancellationToken);
        return Ok(ApiResponse<IReadOnlyList<TaskHistoryDto>>.Ok(history));
    }
}
