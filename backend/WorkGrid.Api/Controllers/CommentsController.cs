using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WorkGrid.Api.DTOs;
using WorkGrid.Api.DTOs.Common;
using WorkGrid.Api.Services;

namespace WorkGrid.Api.Controllers;

[Authorize]
[ApiController]
public class CommentsController : BaseApiController
{
    private readonly ICommentService _commentService;

    public CommentsController(ICommentService commentService)
    {
        _commentService = commentService;
    }

    [HttpGet("/api/tasks/{taskId:int}/comments")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<CommentDto>>>> GetByTaskId(int taskId, CancellationToken cancellationToken)
    {
        var comments = await _commentService.GetCommentsByTaskIdAsync(taskId, cancellationToken);
        return Ok(ApiResponse<IReadOnlyList<CommentDto>>.Ok(comments));
    }

    [Authorize(Roles = "ADMIN,MANAGER,DEVELOPER")]
    [HttpPost("/api/tasks/{taskId:int}/comments")]
    public async Task<ActionResult<ApiResponse<CommentDto>>> Create(int taskId, [FromBody] CreateCommentRequest request, CancellationToken cancellationToken)
    {
        var comment = await _commentService.AddCommentAsync(taskId, request, CurrentUserId, CurrentUserRole, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, ApiResponse<CommentDto>.Ok(comment, "Comment added successfully", StatusCodes.Status201Created));
    }
}
