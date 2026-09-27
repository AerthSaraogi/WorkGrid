export type UserRole = 'ADMIN' | 'MANAGER' | 'DEVELOPER' | 'VIEWER';

export type TaskType = 'TASK' | 'INCIDENT';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  createdBy: number;
  creatorName: string;
  createdAt: string;
  taskCount: number;
  openTaskCount: number;
}

export interface TaskItem {
  id: number;
  projectId: number;
  projectName: string;
  title: string;
  description: string;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: number | null;
  assigneeName?: string | null;
  createdBy: number;
  creatorName: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string | null;
  commentCount: number;
}

export interface Comment {
  id: number;
  taskId: number;
  userId: number;
  userName: string;
  userEmail: string;
  content: string;
  createdAt: string;
}

export interface TaskHistory {
  id: number;
  taskId: number;
  taskTitle: string;
  userId: number;
  userName: string;
  action: string;
  oldValue?: string | null;
  newValue?: string | null;
  createdAt: string;
}

export interface PagedResult<T> {
  items: T[];
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  data: T;
  errors?: string[] | null;
}

export interface ProjectDashboard {
  projectId: number;
  projectName: string;
  totalTasks: number;
  todoCount: number;
  inProgressCount: number;
  reviewCount: number;
  doneCount: number;
  criticalIncidentsCount: number;
  recentTasks: TaskItem[];
  criticalIncidents: TaskItem[];
  recentActivity: TaskHistory[];
}

export interface GlobalDashboard {
  totalProjects: number;
  totalTasks: number;
  todoCount: number;
  inProgressCount: number;
  reviewCount: number;
  doneCount: number;
  criticalIncidentsCount: number;
  recentTasks: TaskItem[];
  criticalIncidents: TaskItem[];
  recentActivity: TaskHistory[];
}

export interface TaskFilterOptions {
  search?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  type?: TaskType;
  assignedTo?: number;
  pageIndex?: number;
  pageSize?: number;
  sortBy?: string;
  isDescending?: boolean;
}
