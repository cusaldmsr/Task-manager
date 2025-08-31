// API Configuration
export const API_BASE_URL = 'https://d75de466cae8.ngrok-free.app/TaskManager'; // Adjust port if different
export const API_ENDPOINTS = {
  // User endpoints
  LOGIN: '/api/user/login',
  REGISTER: '/api/user/register',
  
  // Task endpoints
  TASKS: '/api/tasks',
  TASK_BY_ID: (id: number) => `/api/tasks/${id}`,
  TASKS_BY_USER: (userId: number) => `/api/tasks/user/${userId}`,
  
  // Task Status endpoints
  TASK_STATUSES: '/api/taskstatus',
} as const;

// Default Task Statuses
export const DEFAULT_TASK_STATUSES = [
  { id: 1, name: 'Pending' },
  { id: 2, name: 'In Progress' },
  { id: 3, name: 'Completed' },
] as const;

// App Configuration
export const APP_CONFIG = {
  REQUEST_TIMEOUT: 10000, // 10 seconds
  MAX_TITLE_LENGTH: 15, // As defined in your Task entity
  MAX_USERNAME_LENGTH: 45,
  MAX_EMAIL_LENGTH: 100,
  MAX_PASSWORD_LENGTH: 20,
} as const;

// Colors
export const COLORS = {
  PRIMARY: '#2563eb',
  SECONDARY: '#64748b',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  WHITE: '#ffffff',
  LIGHT_GRAY: '#f8fafc',
  DARK_GRAY: '#374151',
  BORDER: '#d1d5db',
} as const;

// Screen names
export const SCREENS = {
  LOGIN: 'Login',
  TASK_LIST: 'TaskList',
  ADD_TASK: 'AddTask',
} as const;