using System.ComponentModel.DataAnnotations;

namespace WorkGrid.Api.Entities;

public class TaskHistory
{
    public int Id { get; set; }

    public int TaskId { get; set; }
    public TaskItem? Task { get; set; }

    public int UserId { get; set; }
    public User? User { get; set; }

    [Required]
    [MaxLength(100)]
    public string Action { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? OldValue { get; set; }

    [MaxLength(500)]
    public string? NewValue { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
