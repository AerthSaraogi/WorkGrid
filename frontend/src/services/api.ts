import axios, { AxiosError } from 'axios';
import type {
  ApiResponse,
  AuthResponse,
  Comment,
  GlobalDashboard,
  PagedResult,
  Project,
  ProjectDashboard,
  TaskFilterOptions,
  TaskHistory,
  TaskItem,
  TaskPriority,
  TaskStatus,
  User,
} from '../types';

export const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Extract error message cleanly
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; Message?: string }>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // If not already on auth page, redirect
      if (
        window.location.pathname !== '/login' &&
        window.location.pathname !== '/register'
      ) {
        window.location.href = '/login';
      }
    }
    const message =
      error.response?.data?.message ||
      error.response?.data?.Message ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

// Authentication APIs
export const authApi = {
  login: async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    return res.data.data;
  },
  register: async (userData: { name: string; email: string; password: string; role?: string }): Promise<AuthResponse> => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', userData);
    return res.data.data;
  },
  getMe: async (): Promise<User> => {
    const res = await apiClient.get<ApiResponse<User>>('/auth/me');
    return res.data.data;
  },
  getUsers: async (): Promise<User[]> => {
    const res = await apiClient.get<ApiResponse<User[]>>('/auth/users');
    return res.data.data;
  },
};

// Projects APIs
export const projectsApi = {
  getAll: async (): Promise<Project[]> => {
    const res = await apiClient.get<ApiResponse<Project[]>>('/projects');
    return res.data.data;
  },
  getById: async (id: number): Promise<Project> => {
    const res = await apiClient.get<ApiResponse<Project>>(`/projects/${id}`);
    return res.data.data;
  },
  create: async (data: { name: string; description: string }): Promise<Project> => {
    const res = await apiClient.post<ApiResponse<Project>>('/projects', data);
    return res.data.data;
  },
  update: async (id: number, data: { name: string; description: string }): Promise<Project> => {
    const res = await apiClient.put<ApiResponse<Project>>(`/projects/${id}`, data);
    return res.data.data;
  },
  delete: async (id: number): Promise<void> => {
    await apiClient.delete<ApiResponse<null>>(`/projects/${id}`);
  },
};

// Tasks APIs
export const tasksApi = {
  getByProject: async (projectId: number, params?: TaskFilterOptions): Promise<PagedResult<TaskItem>> => {
    const res = await apiClient.get<ApiResponse<PagedResult<TaskItem>>>(`/projects/${projectId}/tasks`, {
      params,
    });
    return res.data.data;
  },
  getById: async (id: number): Promise<TaskItem> => {
    const res = await apiClient.get<ApiResponse<TaskItem>>(`/tasks/${id}`);
    return res.data.data;
  },
  create: async (data: Partial<TaskItem> & { projectId: number; title: string }): Promise<TaskItem> => {
    const res = await apiClient.post<ApiResponse<TaskItem>>('/tasks', data);
    return res.data.data;
  },
  update: async (id: number, data: Partial<TaskItem>): Promise<TaskItem> => {
    const res = await apiClient.put<ApiResponse<TaskItem>>(`/tasks/${id}`, data);
    return res.data.data;
  },
  delete: async (id: number): Promise<void> => {
    await apiClient.delete<ApiResponse<null>>(`/tasks/${id}`);
  },
  updateStatus: async (id: number, status: TaskStatus): Promise<TaskItem> => {
    const res = await apiClient.patch<ApiResponse<TaskItem>>(`/tasks/${id}/status`, { status });
    return res.data.data;
  },
  updatePriority: async (id: number, priority: TaskPriority): Promise<TaskItem> => {
    const res = await apiClient.patch<ApiResponse<TaskItem>>(`/tasks/${id}/priority`, { priority });
    return res.data.data;
  },
  updateAssignee: async (id: number, assignedTo: number | null): Promise<TaskItem> => {
    const res = await apiClient.patch<ApiResponse<TaskItem>>(`/tasks/${id}/assignee`, { assignedTo });
    return res.data.data;
  },
};

// Comments APIs
export const commentsApi = {
  getByTask: async (taskId: number): Promise<Comment[]> => {
    const res = await apiClient.get<ApiResponse<Comment[]>>(`/tasks/${taskId}/comments`);
    return res.data.data;
  },
  create: async (taskId: number, content: string): Promise<Comment> => {
    const res = await apiClient.post<ApiResponse<Comment>>(`/tasks/${taskId}/comments`, { content });
    return res.data.data;
  },
};

// Task History APIs
export const historyApi = {
  getByTask: async (taskId: number): Promise<TaskHistory[]> => {
    const res = await apiClient.get<ApiResponse<TaskHistory[]>>(`/tasks/${taskId}/history`);
    return res.data.data;
  },
};

// Dashboard APIs
export const dashboardApi = {
  getProjectDashboard: async (projectId: number): Promise<ProjectDashboard> => {
    const res = await apiClient.get<ApiResponse<ProjectDashboard>>(`/dashboard/project/${projectId}`);
    return res.data.data;
  },
  getGlobalDashboard: async (): Promise<GlobalDashboard> => {
    const res = await apiClient.get<ApiResponse<GlobalDashboard>>('/dashboard');
    return res.data.data;
  },
};
