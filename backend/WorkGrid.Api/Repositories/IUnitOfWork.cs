using WorkGrid.Api.Entities;

namespace WorkGrid.Api.Repositories;

public interface IUnitOfWork : IDisposable
{
    IRepository<User> Users { get; }
    IRepository<Project> Projects { get; }
    IRepository<TaskItem> Tasks { get; }
    IRepository<Comment> Comments { get; }
    IRepository<TaskHistory> TaskHistories { get; }

    Task<int> CompleteAsync(CancellationToken cancellationToken = default);
}
