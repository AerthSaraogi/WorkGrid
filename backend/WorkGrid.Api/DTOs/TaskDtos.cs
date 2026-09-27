using System.ComponentModel.DataAnnotations;
using WorkGrid.Api.Entities;
using TaskStatus = WorkGrid.Api.Entities.TaskStatus;

namespace WorkGrid.Api.DTOs;

public class TaskDto
{
    public int Id { get; set; }
    public int ProjectId { get; set; }
    public string ProjectName { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public TaskType Type { get; set; }
    public TaskStatus Status { get; set; }
    public TaskPriority Priority { get; set; }
    public int? AssignedTo { get; set; }
    public string? AssigneeName { get; set; }
    public int CreatedBy { get; set; }
    public string CreatorName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public DateTime? DueDate { get; set; }
    public int CommentCount { get; set; }
}

public class CreateTaskRequest
{
    [Required]
    public int ProjectId { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(4000)]
    public string Description { get; set; } = string.Empty;

    public TaskType Type { get; set; } = TaskType.TASK;
    public TaskPriority Priority { get; set; } = TaskPriority.MEDIUM;
    public TaskStatus Status { get; set; } = TaskStatus.TODO;

    public int? AssignedTo { get; set; }
    public DateTime? DueDate { get; set; }
}

public class UpdateTaskRequest
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(4000)]
    public string Description { get; set; } = string.Empty;

    public TaskType Type { get; set; }
    public TaskPriority Priority { get; set; }
    public TaskStatus Status { get; set; }
    public int? AssignedTo { get; set; }
    public DateTime? DueDate { get; set; }
}

public class UpdateTaskStatusRequest
{
    [Required]
    public TaskStatus Status { get; set; }
}

public class UpdateTaskPriorityRequest
{
    [Required]
    public TaskPriority Priority { get; set; }
}

public class UpdateTaskAssigneeRequest
{
    public int? AssignedTo { get; set; }
}

public class TaskFilterParams
{
    public string? Search { get; set; }
    public TaskStatus? Status { get; set; }
    public TaskPriority? Priority { get; set; }
    public TaskType? Type { get; set; }
    public int? AssignedTo { get; set; }
    public int PageIndex { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? SortBy { get; set; } = "CreatedAt";
    public bool IsDescending { get; set; } = true;
}
