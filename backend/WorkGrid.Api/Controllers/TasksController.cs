using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WorkGrid.Api.DTOs;
using WorkGrid.Api.DTOs.Common;
using WorkGrid.Api.Services;

namespace WorkGrid.Api.Controllers;

[Authorize]
public class TasksController : BaseApiController
{
    private readonly ITaskService _taskService;

    public TasksController(ITaskService taskService)
    {
        _taskService = taskService;
    }

    [HttpGet("/api/projects/{projectId:int}/tasks")]
    public async Task<ActionResult<ApiResponse<PagedResult<TaskDto>>>> GetByProject(
        int projectId,
        [FromQuery] TaskFilterParams filterParams,
        CancellationToken cancellationToken)
    {
        var result = await _taskService.GetTasksByProjectAsync(projectId, filterParams, CurrentUserId, CurrentUserRole, cancellationToken);
        return Ok(ApiResponse<PagedResult<TaskDto>>.Ok(result));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ApiResponse<TaskDto>>> GetById(int id, CancellationToken cancellationToken)
    {
        var task = await _taskService.GetTaskByIdAsync(id, CurrentUserId, CurrentUserRole, cancellationToken);
        return Ok(ApiResponse<TaskDto>.Ok(task));
    }

    [Authorize(Roles = "ADMIN,MANAGER")]
    [HttpPost]
    public async Task<ActionResult<ApiResponse<TaskDto>>> Create([FromBody] CreateTaskRequest request, CancellationToken cancellationToken)
    {
        var task = await _taskService.CreateTaskAsync(request, CurrentUserId, CurrentUserRole, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, ApiResponse<TaskDto>.Ok(task, "Task created successfully", StatusCodes.Status201Created));
    }

    [Authorize(Roles = "ADMIN,MANAGER,DEVELOPER")]
    [HttpPut("{id:int}")]
    public async Task<ActionResult<ApiResponse<TaskDto>>> Update(int id, [FromBody] UpdateTaskRequest request, CancellationToken cancellationToken)
    {
        var task = await _taskService.UpdateTaskAsync(id, request, CurrentUserId, CurrentUserRole, cancellationToken);
        return Ok(ApiResponse<TaskDto>.Ok(task, "Task updated successfully"));
    }

    [Authorize(Roles = "ADMIN,MANAGER")]
    [HttpDelete("{id:int}")]
    public async Task<ActionResult<ApiResponse<object?>>> Delete(int id, CancellationToken cancellationToken)
    {
        await _taskService.DeleteTaskAsync(id, CurrentUserId, CurrentUserRole, cancellationToken);
        return Ok(ApiResponse<object?>.Ok(null, "Task deleted successfully"));
    }

    [Authorize(Roles = "ADMIN,MANAGER,DEVELOPER")]
    [HttpPatch("{id:int}/status")]
    public async Task<ActionResult<ApiResponse<TaskDto>>> UpdateStatus(int id, [FromBody] UpdateTaskStatusRequest request, CancellationToken cancellationToken)
    {
        var task = await _taskService.UpdateStatusAsync(id, request.Status, CurrentUserId, CurrentUserRole, cancellationToken);
        return Ok(ApiResponse<TaskDto>.Ok(task, "Task status updated successfully"));
    }

    [Authorize(Roles = "ADMIN,MANAGER")]
    [HttpPatch("{id:int}/priority")]
    public async Task<ActionResult<ApiResponse<TaskDto>>> UpdatePriority(int id, [FromBody] UpdateTaskPriorityRequest request, CancellationToken cancellationToken)
    {
        var task = await _taskService.UpdatePriorityAsync(id, request.Priority, CurrentUserId, CurrentUserRole, cancellationToken);
        return Ok(ApiResponse<TaskDto>.Ok(task, "Task priority updated successfully"));
    }

    [Authorize(Roles = "ADMIN,MANAGER")]
    [HttpPatch("{id:int}/assignee")]
    public async Task<ActionResult<ApiResponse<TaskDto>>> UpdateAssignee(int id, [FromBody] UpdateTaskAssigneeRequest request, CancellationToken cancellationToken)
    {
        var task = await _taskService.UpdateAssigneeAsync(id, request.AssignedTo, CurrentUserId, CurrentUserRole, cancellationToken);
        return Ok(ApiResponse<TaskDto>.Ok(task, "Task assignee updated successfully"));
    }
}
