using System.ComponentModel.DataAnnotations;

namespace WorkGrid.Api.Entities;

public class Comment
{
    public int Id { get; set; }

    public int TaskId { get; set; }
    public TaskItem? Task { get; set; }

    public int UserId { get; set; }
    public User? User { get; set; }

    [Required]
    [MaxLength(2000)]
    public string Content { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
