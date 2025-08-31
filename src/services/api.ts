import { API_BASE_URL, API_ENDPOINTS, APP_CONFIG } from '../utils/constants';
import { 
  User, 
  Task, 
  TaskStatus, 
  UserLoginRequest, 
  UserRegistrationRequest, 
  TaskCreateRequest, 
  TaskUpdateRequest, 
  ApiResponse, 
  LoginResponse 
} from '../types';
import { storageService } from './storage';

class ApiService {
  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = await storageService.getUserToken();
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), APP_CONFIG.REQUEST_TIMEOUT);

      const config: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
          ...options.headers,
        },
        signal: controller.signal,
        ...options,
      };

      try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // User Authentication APIs
  async login(credentials: UserLoginRequest): Promise<ApiResponse<LoginResponse>> {
    return this.makeRequest<LoginResponse>(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: UserRegistrationRequest): Promise<ApiResponse<User>> {
    return this.makeRequest<User>(API_ENDPOINTS.REGISTER, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Task APIs
  async getTasks(userId: number): Promise<ApiResponse<Task[]>> {
    return this.makeRequest<Task[]>(API_ENDPOINTS.TASKS_BY_USER(userId));
  }

  async getTaskById(taskId: number): Promise<ApiResponse<Task>> {
    return this.makeRequest<Task>(API_ENDPOINTS.TASK_BY_ID(taskId));
  }

  async createTask(taskData: TaskCreateRequest): Promise<ApiResponse<Task>> {
    return this.makeRequest<Task>(API_ENDPOINTS.TASKS, {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async updateTask(taskData: TaskUpdateRequest): Promise<ApiResponse<Task>> {
    return this.makeRequest<Task>(API_ENDPOINTS.TASK_BY_ID(taskData.id), {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  }

  async deleteTask(taskId: number): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(API_ENDPOINTS.TASK_BY_ID(taskId), {
      method: 'DELETE',
    });
  }

  // Task Status APIs
  async getTaskStatuses(): Promise<ApiResponse<TaskStatus[]>> {
    return this.makeRequest<TaskStatus[]>(API_ENDPOINTS.TASK_STATUSES);
  }

  // Utility method to check server connectivity
  async checkServerConnection(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        const response = await fetch(`${API_BASE_URL}/health`, {
          method: 'GET',
          signal: controller.signal,
        });
        return response.ok;
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      console.error('Server connection failed:', error);
      return false;
    }
  }
}

export const apiService = new ApiService();