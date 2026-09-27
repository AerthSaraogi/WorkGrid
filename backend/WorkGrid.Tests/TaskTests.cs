using Microsoft.EntityFrameworkCore;
using WorkGrid.Api.Data;
using WorkGrid.Api.DTOs;
using WorkGrid.Api.Entities;
using WorkGrid.Api.Middleware;
using WorkGrid.Api.Repositories;
using WorkGrid.Api.Services;
using Xunit;
using TaskStatus = WorkGrid.Api.Entities.TaskStatus;

namespace WorkGrid.Tests;

public class TaskTests
{
    private static async Task<(TaskService taskService, AppDbContext dbContext, int projectId, int managerId, int devId)> CreateTestSetupAsync()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        var dbContext = new AppDbContext(options);
        var unitOfWork = new UnitOfWork(dbContext);

        var manager = new User
        {
            Name = "Manager User",
            Email = "manager.test@workgrid.io",
            PasswordHash = "hash",
            Role = UserRole.MANAGER
        };

        var dev = new User
        {
            Name = "Dev User",
            Email = "dev.test@workgrid.io",
            PasswordHash = "hash",
            Role = UserRole.DEVELOPER
        };

        await dbContext.Users.AddRangeAsync(manager, dev);
        await dbContext.SaveChangesAsync();

        var project = new Project
        {
            Name = "Test Project",
            Description = "Test Project Description",
            CreatedBy = manager.Id
        };

        await dbContext.Projects.AddAsync(project);
        await dbContext.SaveChangesAsync();

        var taskService = new TaskService(unitOfWork);
        return (taskService, dbContext, project.Id, manager.Id, dev.Id);
    }

    [Fact]
    public async Task CreateTaskAsync_ManagerRole_CreatesTaskAndHistory()
    {
        // Arrange
        var (taskService, dbContext, projectId, managerId, devId) = await CreateTestSetupAsync();
        var request = new CreateTaskRequest
        {
            ProjectId = projectId,
            Title = "Fix database latency",
            Description = "Optimize index scan",
            Type = TaskType.INCIDENT,
            Priority = TaskPriority.HIGH,
            Status = TaskStatus.TODO,
            AssignedTo = devId
        };

        // Act
        var createdTask = await taskService.CreateTaskAsync(request, managerId, nameof(UserRole.MANAGER));

        // Assert
        Assert.NotNull(createdTask);
        Assert.Equal("Fix database latency", createdTask.Title);
        Assert.Equal(TaskPriority.HIGH, createdTask.Priority);

        var history = await dbContext.TaskHistories.Where(h => h.TaskId == createdTask.Id).ToListAsync();
        Assert.NotEmpty(history);
        Assert.Contains(history, h => h.Action == "Created task");
    }

    [Fact]
    public async Task CreateTaskAsync_ViewerRole_ThrowsForbiddenException()
    {
        // Arrange
        var (taskService, _, projectId, _, _) = await CreateTestSetupAsync();
        var request = new CreateTaskRequest
        {
            ProjectId = projectId,
            Title = "Unauthorized Task",
            Description = "Unauthorized Description",
            Type = TaskType.TASK,
            Priority = TaskPriority.LOW,
            Status = TaskStatus.TODO
        };

        // Act & Assert
        await Assert.ThrowsAsync<ForbiddenException>(() =>
            taskService.CreateTaskAsync(request, 999, nameof(UserRole.VIEWER)));
    }

    [Fact]
    public async Task UpdateStatusAsync_DeveloperAssigned_UpdatesStatusAndAddsHistory()
    {
        // Arrange
        var (taskService, dbContext, projectId, managerId, devId) = await CreateTestSetupAsync();
        var task = await taskService.CreateTaskAsync(new CreateTaskRequest
        {
            ProjectId = projectId,
            Title = "Build auth feature",
            Description = "JWT Token implementation",
            Type = TaskType.TASK,
            Priority = TaskPriority.MEDIUM,
            Status = TaskStatus.TODO,
            AssignedTo = devId
        }, managerId, nameof(UserRole.MANAGER));

        // Act
        var updatedTask = await taskService.UpdateStatusAsync(task.Id, TaskStatus.IN_PROGRESS, devId, nameof(UserRole.DEVELOPER));

        // Assert
        Assert.Equal(TaskStatus.IN_PROGRESS, updatedTask.Status);

        var statusHistory = await dbContext.TaskHistories
            .FirstOrDefaultAsync(h => h.TaskId == task.Id && h.Action == "Changed status");
        Assert.NotNull(statusHistory);
        Assert.Equal("TODO", statusHistory.OldValue);
        Assert.Equal("IN_PROGRESS", statusHistory.NewValue);
    }

    [Fact]
    public async Task UpdateStatusAsync_ViewerRole_ThrowsForbiddenException()
    {
        // Arrange
        var (taskService, _, projectId, managerId, devId) = await CreateTestSetupAsync();
        var task = await taskService.CreateTaskAsync(new CreateTaskRequest
        {
            ProjectId = projectId,
            Title = "Sample Task",
            Type = TaskType.TASK,
            Priority = TaskPriority.MEDIUM,
            Status = TaskStatus.TODO,
            AssignedTo = devId
        }, managerId, nameof(UserRole.MANAGER));

        // Act & Assert
        await Assert.ThrowsAsync<ForbiddenException>(() =>
            taskService.UpdateStatusAsync(task.Id, TaskStatus.DONE, 999, nameof(UserRole.VIEWER)));
    }
}
