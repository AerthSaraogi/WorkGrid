using System.ComponentModel.DataAnnotations;

namespace WorkGrid.Api.Entities;

public class TaskItem
{
    public int Id { get; set; }

    public int ProjectId { get; set; }
    public Project? Project { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(4000)]
    public string Description { get; set; } = string.Empty;

    public TaskType Type { get; set; } = TaskType.TASK;

    public TaskStatus Status { get; set; } = TaskStatus.TODO;

    public TaskPriority Priority { get; set; } = TaskPriority.MEDIUM;

    public int? AssignedTo { get; set; }
    public User? Assignee { get; set; }

    public int CreatedBy { get; set; }
    public User? Creator { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? DueDate { get; set; }

    // Navigations
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public ICollection<TaskHistory> TaskHistories { get; set; } = new List<TaskHistory>();
}
