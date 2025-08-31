import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Task, STORAGE_KEYS } from '../types';

class StorageService {
  getTaskList() {
      throw new Error('Method not implemented.');
  }
  // User data methods
  async saveUserData(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user data:', error);
      throw new Error('Failed to save user data');
    }
  }

  async getUserData(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  async saveUserToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_TOKEN, token);
    } catch (error) {
      console.error('Error saving user token:', error);
      throw new Error('Failed to save user token');
    }
  }

  async getUserToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
    } catch (error) {
      console.error('Error getting user token:', error);
      return null;
    }
  }

  // Offline task storage methods
  async saveOfflineTasks(tasks: Task[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_TASKS, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving offline tasks:', error);
      throw new Error('Failed to save offline tasks');
    }
  }

  async getOfflineTasks(): Promise<Task[]> {
    try {
      const tasks = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_TASKS);
      return tasks ? JSON.parse(tasks) : [];
    } catch (error) {
      console.error('Error getting offline tasks:', error);
      return [];
    }
  }

  // Clear all data (logout)
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.USER_TOKEN,
        STORAGE_KEYS.OFFLINE_TASKS,
      ]);
    } catch (error) {
      console.error('Error clearing data:', error);
      throw new Error('Failed to clear data');
    }
  }

  // Check if user is logged in
  async isLoggedIn(): Promise<boolean> {
    try {
      const token = await this.getUserToken();
      return !!token;
    } catch (error) {
      console.error('Error checking login status:', error);
      return false;
    }
  }

  // Save individual task for offline use
  async saveTaskOffline(task: Task): Promise<void> {
    try {
      const existingTasks = await this.getOfflineTasks();
      const taskIndex = existingTasks.findIndex(t => t.id === task.id);
      
      if (taskIndex >= 0) {
        existingTasks[taskIndex] = task;
      } else {
        existingTasks.push(task);
      }
      
      await this.saveOfflineTasks(existingTasks);
    } catch (error) {
      console.error('Error saving task offline:', error);
      throw new Error('Failed to save task offline');
    }
  }

  // Remove task from offline storage
  async removeTaskOffline(taskId: number): Promise<void> {
    try {
      const existingTasks = await this.getOfflineTasks();
      const filteredTasks = existingTasks.filter(t => t.id !== taskId);
      await this.saveOfflineTasks(filteredTasks);
    } catch (error) {
      console.error('Error removing task offline:', error);
      throw new Error('Failed to remove task offline');
    }
  }
}

export const storageService = new StorageService();