namespace WorkGrid.Api.Entities;

public enum TaskType
{
    TASK,
    INCIDENT
}

public enum TaskStatus
{
    TODO,
    IN_PROGRESS,
    REVIEW,
    DONE
}

public enum TaskPriority
{
    LOW,
    MEDIUM,
    HIGH,
    CRITICAL
}
