using Microsoft.EntityFrameworkCore;
using WorkGrid.Api.Entities;
using TaskStatus = WorkGrid.Api.Entities.TaskStatus;

namespace WorkGrid.Api.Data;

public static class DbInitializer
{
    public static async Task SeedAsync(AppDbContext context)
    {
        if (await context.Users.AnyAsync())
        {
            return; // DB has been seeded
        }

        var defaultPasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!");

        // 1. Seed Users
        var admin = new User
        {
            Name = "System Admin",
            Email = "admin@workgrid.io",
            PasswordHash = defaultPasswordHash,
            Role = UserRole.ADMIN,
            CreatedAt = DateTime.UtcNow.AddMonths(-3)
        };

        var manager = new User
        {
            Name = "Alex Vance (Manager)",
            Email = "manager@workgrid.io",
            PasswordHash = defaultPasswordHash,
            Role = UserRole.MANAGER,
            CreatedAt = DateTime.UtcNow.AddMonths(-3)
        };

        var dev1 = new User
        {
            Name = "Rahul Sharma",
            Email = "dev1@workgrid.io",
            PasswordHash = defaultPasswordHash,
            Role = UserRole.DEVELOPER,
            CreatedAt = DateTime.UtcNow.AddMonths(-2)
        };

        var dev2 = new User
        {
            Name = "Elena Rostova",
            Email = "dev2@workgrid.io",
            PasswordHash = defaultPasswordHash,
            Role = UserRole.DEVELOPER,
            CreatedAt = DateTime.UtcNow.AddMonths(-2)
        };

        var viewer = new User
        {
            Name = "Sarah Jenkins (Auditor)",
            Email = "viewer@workgrid.io",
            PasswordHash = defaultPasswordHash,
            Role = UserRole.VIEWER,
            CreatedAt = DateTime.UtcNow.AddMonths(-1)
        };

        await context.Users.AddRangeAsync(admin, manager, dev1, dev2, viewer);
        await context.SaveChangesAsync();

        // 2. Seed Projects
        var project1 = new Project
        {
            Name = "Payment Gateway Integration",
            Description = "High-availability financial transactions, 3DS2 verification, and multi-currency webhooks integration.",
            CreatedBy = manager.Id,
            CreatedAt = DateTime.UtcNow.AddDays(-45)
        };

        var project2 = new Project
        {
            Name = "Cloud Infrastructure & Reliability",
            Description = "Kubernetes cluster migration, disaster recovery failover automation, and incident observability.",
            CreatedBy = admin.Id,
            CreatedAt = DateTime.UtcNow.AddDays(-30)
        };

        await context.Projects.AddRangeAsync(project1, project2);
        await context.SaveChangesAsync();

        // 3. Seed Tasks & Incidents
        var incident1 = new TaskItem
        {
            ProjectId = project1.Id,
            Title = "Production Payment Webhook 500 Spike",
            Description = "Intermittent HTTP 500 responses detected from Stripe webhook receiver during peak settlement batch window. Needs urgent investigation.",
            Type = TaskType.INCIDENT,
            Status = TaskStatus.IN_PROGRESS,
            Priority = TaskPriority.CRITICAL,
            AssignedTo = dev1.Id,
            CreatedBy = manager.Id,
            CreatedAt = DateTime.UtcNow.AddDays(-2),
            UpdatedAt = DateTime.UtcNow.AddHours(-3),
            DueDate = DateTime.UtcNow.AddDays(1)
        };

        var task1 = new TaskItem
        {
            ProjectId = project1.Id,
            Title = "Implement 3D Secure 2.0 Challenge Handler",
            Description = "Integrate frictionless and challenge verification flows into the checkout payment intent lifecycle.",
            Type = TaskType.TASK,
            Status = TaskStatus.REVIEW,
            Priority = TaskPriority.HIGH,
            AssignedTo = dev1.Id,
            CreatedBy = manager.Id,
            CreatedAt = DateTime.UtcNow.AddDays(-10),
            UpdatedAt = DateTime.UtcNow.AddHours(-1),
            DueDate = DateTime.UtcNow.AddDays(3)
        };

        var task2 = new TaskItem
        {
            ProjectId = project1.Id,
            Title = "Reconcile Stripe & Adyen Settlement Reports",
            Description = "Automate daily cron generation of CSV variance reports for the accounting operations team.",
            Type = TaskType.TASK,
            Status = TaskStatus.TODO,
            Priority = TaskPriority.MEDIUM,
            AssignedTo = dev2.Id,
            CreatedBy = manager.Id,
            CreatedAt = DateTime.UtcNow.AddDays(-5),
            UpdatedAt = DateTime.UtcNow.AddDays(-5),
            DueDate = DateTime.UtcNow.AddDays(7)
        };

        var task3 = new TaskItem
        {
            ProjectId = project1.Id,
            Title = "Update API Error Documentation for Merchants",
            Description = "Document all standardized RFC 7807 problem details error codes returned by the public checkout endpoints.",
            Type = TaskType.TASK,
            Status = TaskStatus.DONE,
            Priority = TaskPriority.LOW,
            AssignedTo = dev2.Id,
            CreatedBy = manager.Id,
            CreatedAt = DateTime.UtcNow.AddDays(-14),
            UpdatedAt = DateTime.UtcNow.AddDays(-2),
            DueDate = DateTime.UtcNow.AddDays(-1)
        };

        var incident2 = new TaskItem
        {
            ProjectId = project2.Id,
            Title = "Memory leak in ingress controller pods",
            Description = "Worker nodes experiencing OOM kills due to unclosed socket connections in reverse proxy ingress.",
            Type = TaskType.INCIDENT,
            Status = TaskStatus.IN_PROGRESS,
            Priority = TaskPriority.CRITICAL,
            AssignedTo = dev1.Id,
            CreatedBy = admin.Id,
            CreatedAt = DateTime.UtcNow.AddDays(-1),
            UpdatedAt = DateTime.UtcNow.AddHours(-5),
            DueDate = DateTime.UtcNow.AddDays(1)
        };

        var task4 = new TaskItem
        {
            ProjectId = project2.Id,
            Title = "Automate Postgres WAL Backup Archival to S3",
            Description = "Setup pgBackRest and test point-in-time recovery on staging database replica.",
            Type = TaskType.TASK,
            Status = TaskStatus.TODO,
            Priority = TaskPriority.HIGH,
            AssignedTo = dev2.Id,
            CreatedBy = admin.Id,
            CreatedAt = DateTime.UtcNow.AddDays(-7),
            UpdatedAt = DateTime.UtcNow.AddDays(-7),
            DueDate = DateTime.UtcNow.AddDays(5)
        };

        await context.Tasks.AddRangeAsync(incident1, task1, task2, task3, incident2, task4);
        await context.SaveChangesAsync();

        // 4. Seed Comments
        var comment1 = new Comment
        {
            TaskId = incident1.Id,
            UserId = dev1.Id,
            Content = "Identified root cause: database connection pool saturation during concurrent retry spikes. Implementing backoff limiter now.",
            CreatedAt = DateTime.UtcNow.AddHours(-8)
        };

        var comment2 = new Comment
        {
            TaskId = incident1.Id,
            UserId = manager.Id,
            Content = "Good catch Rahul. Keep me posted when the hotfix is staged for canary deploy.",
            CreatedAt = DateTime.UtcNow.AddHours(-6)
        };

        var comment3 = new Comment
        {
            TaskId = task1.Id,
            UserId = dev1.Id,
            Content = "PR #142 submitted. Includes unit tests for fingerprinting and challenge modal fallback.",
            CreatedAt = DateTime.UtcNow.AddHours(-2)
        };

        await context.Comments.AddRangeAsync(comment1, comment2, comment3);

        // 5. Seed Task History
        var history1 = new TaskHistory
        {
            TaskId = incident1.Id,
            UserId = manager.Id,
            Action = "Created task",
            OldValue = null,
            NewValue = "TODO",
            CreatedAt = DateTime.UtcNow.AddDays(-2)
        };

        var history2 = new TaskHistory
        {
            TaskId = incident1.Id,
            UserId = manager.Id,
            Action = "Assigned task",
            OldValue = "Unassigned",
            NewValue = dev1.Name,
            CreatedAt = DateTime.UtcNow.AddDays(-2).AddMinutes(15)
        };

        var history3 = new TaskHistory
        {
            TaskId = incident1.Id,
            UserId = dev1.Id,
            Action = "Changed status",
            OldValue = "TODO",
            NewValue = "IN_PROGRESS",
            CreatedAt = DateTime.UtcNow.AddDays(-1).AddHours(2)
        };

        var history4 = new TaskHistory
        {
            TaskId = incident1.Id,
            UserId = dev1.Id,
            Action = "Added comment",
            OldValue = null,
            NewValue = "Identified root cause: database connection pool saturation...",
            CreatedAt = DateTime.UtcNow.AddHours(-8)
        };

        var history5 = new TaskHistory
        {
            TaskId = task1.Id,
            UserId = manager.Id,
            Action = "Created task",
            OldValue = null,
            NewValue = "TODO",
            CreatedAt = DateTime.UtcNow.AddDays(-10)
        };

        var history6 = new TaskHistory
        {
            TaskId = task1.Id,
            UserId = dev1.Id,
            Action = "Changed status",
            OldValue = "IN_PROGRESS",
            NewValue = "REVIEW",
            CreatedAt = DateTime.UtcNow.AddHours(-1)
        };

        await context.TaskHistories.AddRangeAsync(history1, history2, history3, history4, history5, history6);
        await context.SaveChangesAsync();
    }
}
