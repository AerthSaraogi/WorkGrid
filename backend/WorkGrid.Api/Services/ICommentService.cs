using WorkGrid.Api.DTOs;

namespace WorkGrid.Api.Services;

public interface ICommentService
{
    Task<IReadOnlyList<CommentDto>> GetCommentsByTaskIdAsync(int taskId, CancellationToken cancellationToken = default);
    Task<CommentDto> AddCommentAsync(int taskId, CreateCommentRequest request, int userId, string userRole, CancellationToken cancellationToken = default);
}
