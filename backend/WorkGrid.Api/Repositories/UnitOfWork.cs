using WorkGrid.Api.Data;
using WorkGrid.Api.Entities;

namespace WorkGrid.Api.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _context;
    private IRepository<User>? _users;
    private IRepository<Project>? _projects;
    private IRepository<TaskItem>? _tasks;
    private IRepository<Comment>? _comments;
    private IRepository<TaskHistory>? _taskHistories;

    public UnitOfWork(AppDbContext context)
    {
        _context = context;
    }

    public IRepository<User> Users => _users ??= new Repository<User>(_context);
    public IRepository<Project> Projects => _projects ??= new Repository<Project>(_context);
    public IRepository<TaskItem> Tasks => _tasks ??= new Repository<TaskItem>(_context);
    public IRepository<Comment> Comments => _comments ??= new Repository<Comment>(_context);
    public IRepository<TaskHistory> TaskHistories => _taskHistories ??= new Repository<TaskHistory>(_context);

    public async Task<int> CompleteAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }

    public void Dispose()
    {
        _context.Dispose();
        GC.SuppressFinalize(this);
    }
}
