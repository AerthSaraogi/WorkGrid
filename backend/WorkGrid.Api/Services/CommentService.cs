using Microsoft.EntityFrameworkCore;
using WorkGrid.Api.DTOs;
using WorkGrid.Api.Entities;
using WorkGrid.Api.Middleware;
using WorkGrid.Api.Repositories;

namespace WorkGrid.Api.Services;

public class CommentService : ICommentService
{
    private readonly IUnitOfWork _unitOfWork;

    public CommentService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<CommentDto>> GetCommentsByTaskIdAsync(int taskId, CancellationToken cancellationToken = default)
    {
        var taskExists = await _unitOfWork.Tasks.Query().AnyAsync(t => t.Id == taskId, cancellationToken);
        if (!taskExists)
        {
            throw new NotFoundException($"Task with ID {taskId} not found.");
        }

        var comments = await _unitOfWork.Comments.Query()
            .Include(c => c.User)
            .Where(c => c.TaskId == taskId)
            .OrderBy(c => c.CreatedAt)
            .ToListAsync(cancellationToken);

        return comments.Select(MapToCommentDto).ToList();
    }

    public async Task<CommentDto> AddCommentAsync(int taskId, CreateCommentRequest request, int userId, string userRole, CancellationToken cancellationToken = default)
    {
        if (userRole == nameof(UserRole.VIEWER))
        {
            throw new ForbiddenException("Viewers cannot add comments.");
        }

        var task = await _unitOfWork.Tasks.GetByIdAsync(taskId, cancellationToken);
        if (task == null)
        {
            throw new NotFoundException($"Task with ID {taskId} not found.");
        }

        var comment = new Comment
        {
            TaskId = taskId,
            UserId = userId,
            Content = request.Content.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Comments.AddAsync(comment, cancellationToken);

        // Record history entry
        var preview = comment.Content.Length > 60 ? comment.Content.Substring(0, 57) + "..." : comment.Content;
        await _unitOfWork.TaskHistories.AddAsync(new TaskHistory
        {
            TaskId = taskId,
            UserId = userId,
            Action = "Added comment",
            OldValue = null,
            NewValue = preview,
            CreatedAt = DateTime.UtcNow
        }, cancellationToken);

        await _unitOfWork.CompleteAsync(cancellationToken);

        var loadedComment = await _unitOfWork.Comments.Query()
            .Include(c => c.User)
            .FirstAsync(c => c.Id == comment.Id, cancellationToken);

        return MapToCommentDto(loadedComment);
    }

    private static CommentDto MapToCommentDto(Comment comment)
    {
        return new CommentDto
        {
            Id = comment.Id,
            TaskId = comment.TaskId,
            UserId = comment.UserId,
            UserName = comment.User?.Name ?? "Unknown",
            UserEmail = comment.User?.Email ?? string.Empty,
            Content = comment.Content,
            CreatedAt = comment.CreatedAt
        };
    }
}
