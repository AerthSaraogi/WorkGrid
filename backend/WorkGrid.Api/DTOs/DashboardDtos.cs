namespace WorkGrid.Api.DTOs;

public class ProjectDashboardDto
{
    public int ProjectId { get; set; }
    public string ProjectName { get; set; } = string.Empty;
    public int TotalTasks { get; set; }
    public int TodoCount { get; set; }
    public int InProgressCount { get; set; }
    public int ReviewCount { get; set; }
    public int DoneCount { get; set; }
    public int CriticalIncidentsCount { get; set; }

    public List<TaskDto> RecentTasks { get; set; } = new();
    public List<TaskDto> CriticalIncidents { get; set; } = new();
    public List<TaskHistoryDto> RecentActivity { get; set; } = new();
}

public class GlobalDashboardDto
{
    public int TotalProjects { get; set; }
    public int TotalTasks { get; set; }
    public int TodoCount { get; set; }
    public int InProgressCount { get; set; }
    public int ReviewCount { get; set; }
    public int DoneCount { get; set; }
    public int CriticalIncidentsCount { get; set; }

    public List<TaskDto> RecentTasks { get; set; } = new();
    public List<TaskDto> CriticalIncidents { get; set; } = new();
    public List<TaskHistoryDto> RecentActivity { get; set; } = new();
}
