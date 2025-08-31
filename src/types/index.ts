// User related types
export interface User {
  id: number;
  username: string;
  email: string;
  password?: string; // Optional for responses
  created_at: string;
}

export interface UserLoginRequest {
  email: string;
  password: string;
}

export interface UserRegistrationRequest {
  username: string;
  email: string;
  password: string;
}

// Task Status types
export interface TaskStatus {
  id: number;
  name: string;
}

// Task related types
export interface Task {
  id: number;
  user_id: User;
  title: string;
  description: string;
  task_status_id: TaskStatus;
  created_at: string;
  updated_at: string;
}

export interface TaskCreateRequest {
  title: string;
  description: string;
  task_status_id: number;
  user_id: number;
}

export interface TaskUpdateRequest {
  id: number;
  title: string;
  description: string;
  task_status_id: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface LoginResponse {
  user: User;
  token?: string;
}

// Navigation types (already defined in App.tsx but including here for reference)
export type RootStackParamList = {
  Login: undefined;
  TaskList: undefined;
  AddTask: { taskId?: number; isEdit?: boolean };
};

// Storage keys
export const STORAGE_KEYS = {
  USER_TOKEN: 'userToken',
  USER_DATA: 'userData',
  OFFLINE_TASKS: 'offlineTasks',
} as const;