using Microsoft.EntityFrameworkCore;
using WorkGrid.Api.Entities;

namespace WorkGrid.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<TaskItem> Tasks => Set<TaskItem>();
    public DbSet<Comment> Comments => Set<Comment>();
    public DbSet<TaskHistory> TaskHistories => Set<TaskHistory>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Map TaskItem to "Tasks" table
        modelBuilder.Entity<TaskItem>().ToTable("Tasks");

        // User Configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(u => u.Id);
            entity.HasIndex(u => u.Email).IsUnique();
            entity.Property(u => u.Name).IsRequired().HasMaxLength(100);
            entity.Property(u => u.Email).IsRequired().HasMaxLength(150);
            entity.Property(u => u.PasswordHash).IsRequired();
            entity.Property(u => u.Role).HasConversion<string>().HasMaxLength(20);
        });

        // Project Configuration
        modelBuilder.Entity<Project>(entity =>
        {
            entity.HasKey(p => p.Id);
            entity.Property(p => p.Name).IsRequired().HasMaxLength(150);
            entity.Property(p => p.Description).HasMaxLength(1000);

            entity.HasOne(p => p.Creator)
                  .WithMany(u => u.CreatedProjects)
                  .HasForeignKey(p => p.CreatedBy)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Task Configuration
        modelBuilder.Entity<TaskItem>(entity =>
        {
            entity.HasKey(t => t.Id);
            entity.Property(t => t.Title).IsRequired().HasMaxLength(200);
            entity.Property(t => t.Description).HasMaxLength(4000);

            entity.Property(t => t.Type).HasConversion<string>().HasMaxLength(20);
            entity.Property(t => t.Status).HasConversion<string>().HasMaxLength(20);
            entity.Property(t => t.Priority).HasConversion<string>().HasMaxLength(20);

            // Required Indexes
            entity.HasIndex(t => t.ProjectId);
            entity.HasIndex(t => t.AssignedTo);
            entity.HasIndex(t => t.Status);
            entity.HasIndex(t => t.Priority);
            entity.HasIndex(t => t.CreatedAt);

            // Relationships
            entity.HasOne(t => t.Project)
                  .WithMany(p => p.Tasks)
                  .HasForeignKey(t => t.ProjectId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(t => t.Assignee)
                  .WithMany(u => u.AssignedTasks)
                  .HasForeignKey(t => t.AssignedTo)
                  .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(t => t.Creator)
                  .WithMany(u => u.CreatedTasks)
                  .HasForeignKey(t => t.CreatedBy)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Comment Configuration
        modelBuilder.Entity<Comment>(entity =>
        {
            entity.HasKey(c => c.Id);
            entity.Property(c => c.Content).IsRequired().HasMaxLength(2000);

            entity.HasOne(c => c.Task)
                  .WithMany(t => t.Comments)
                  .HasForeignKey(c => c.TaskId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(c => c.User)
                  .WithMany(u => u.Comments)
                  .HasForeignKey(c => c.UserId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(c => c.TaskId);
        });

        // TaskHistory Configuration
        modelBuilder.Entity<TaskHistory>(entity =>
        {
            entity.HasKey(h => h.Id);
            entity.Property(h => h.Action).IsRequired().HasMaxLength(100);
            entity.Property(h => h.OldValue).HasMaxLength(500);
            entity.Property(h => h.NewValue).HasMaxLength(500);

            entity.HasOne(h => h.Task)
                  .WithMany(t => t.TaskHistories)
                  .HasForeignKey(h => h.TaskId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(h => h.User)
                  .WithMany(u => u.TaskHistories)
                  .HasForeignKey(h => h.UserId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(h => h.TaskId);
            entity.HasIndex(h => h.CreatedAt);
        });
    }
}
