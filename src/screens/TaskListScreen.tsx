import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList, Task, User, TaskUpdateRequest } from '../types';
import { apiService } from '../services/api';
import { storageService } from '../services/storage';
import TaskItem from '../components/TaskItem';
import { COLORS, DEFAULT_TASK_STATUSES } from '../utils/constants';

type TaskListScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'TaskList'>;

interface Props {
  navigation: TaskListScreenNavigationProp;
}

const TaskListScreen: React.FC<Props> = ({ navigation }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Load user data on component mount
  useEffect(() => {
    loadUserData();
  }, []);

  // Refresh tasks when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (user) {
        loadTasks();
      }
    }, [user])
  );

  const loadUserData = async () => {
    try {
      const userData = await storageService.getUserData();
      if (userData) {
        setUser(userData);
      } else {
        handleLogout();
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      handleLogout();
    }
  };

  const loadTasks = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Try to fetch from server
      const response = await apiService.getTasks(user.id);
      
      if (response.success && response.data) {
        setTasks(response.data);
        // Save to offline storage
        await storageService.saveOfflineTasks(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch tasks');
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      
      // Fall back to offline storage
      const offlineTasks = await storageService.getOfflineTasks();
      setTasks(offlineTasks);
      
      Alert.alert(
        'Connection Error', 
        'Unable to sync with server. Showing offline data.'
      );
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  };

  const handleAddTask = () => {
    navigation.navigate('AddTask', {});
  };

  const handleEditTask = (task: Task) => {
    navigation.navigate('AddTask', { 
      taskId: task.id, 
      isEdit: true 
    });
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      const response = await apiService.deleteTask(taskId);
      
      if (response.success) {
        setTasks(prev => prev.filter(task => task.id !== taskId));
        await storageService.removeTaskOffline(taskId);
        Alert.alert('Success', 'Task deleted successfully');
      } else {
        Alert.alert('Error', response.message || 'Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      
      // Remove from local state and storage for offline handling
      setTasks(prev => prev.filter(task => task.id !== taskId));
      await storageService.removeTaskOffline(taskId);
      
      Alert.alert(
        'Offline Mode', 
        'Task removed locally. Changes will sync when connection is restored.'
      );
    }
  };

  const handleStatusChange = async (updatedTask: Task) => {
    try {
      // Find the status ID based on the name
      const statusId = DEFAULT_TASK_STATUSES.find(
        status => status.name === updatedTask.task_status_id.name
      )?.id || 1;

      const updateData: TaskUpdateRequest = {
        id: updatedTask.id,
        title: updatedTask.title,
        description: updatedTask.description,
        task_status_id: statusId,
      };

      const response = await apiService.updateTask(updateData);
      
      if (response.success && response.data) {
        setTasks(prev => 
          prev.map(task => 
            task.id === updatedTask.id ? response.data! : task
          )
        );
        await storageService.saveTaskOffline(response.data);
      } else {
        Alert.alert('Error', response.message || 'Failed to update task status');
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      
      // Update locally for offline handling
      setTasks(prev => 
        prev.map(task => 
          task.id === updatedTask.id ? updatedTask : task
        )
      );
      await storageService.saveTaskOffline(updatedTask);
      
      Alert.alert(
        'Offline Mode', 
        'Status updated locally. Changes will sync when connection is restored.'
      );
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await storageService.clearAllData();
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  const renderTaskItem = ({ item }: { item: Task }) => (
    <TaskItem
      task={item}
      onEdit={handleEditTask}
      onDelete={handleDeleteTask}
      onStatusChange={handleStatusChange}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No Tasks Yet</Text>
      <Text style={styles.emptySubtitle}>Create your first task to get started!</Text>
      <TouchableOpacity style={styles.emptyButton} onPress={handleAddTask}>
        <Text style={styles.emptyButtonText}>Add Task</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Loading tasks...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Welcome, {user?.username || 'User'}!
        </Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{tasks.length}</Text>
          <Text style={styles.statLabel}>Total Tasks</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {tasks.filter(task => task.task_status_id.name === 'Completed').length}
          </Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {tasks.filter(task => task.task_status_id.name === 'Pending').length}
          </Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
      </View>

      <FlatList
        data={tasks}
        renderItem={renderTaskItem}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={tasks.length === 0 ? styles.emptyListContainer : undefined}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity style={styles.fab} onPress={handleAddTask}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.LIGHT_GRAY,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.DARK_GRAY,
  },
  logoutButton: {
    backgroundColor: COLORS.ERROR,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  logoutText: {
    color: COLORS.WHITE,
    fontSize: 14,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.WHITE,
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 10,
    padding: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.SECONDARY,
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.SECONDARY,
  },
  emptyListContainer: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.DARK_GRAY,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: COLORS.SECONDARY,
    textAlign: 'center',
    marginBottom: 30,
  },
  emptyButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: COLORS.PRIMARY,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  fabText: {
    color: COLORS.WHITE,
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default TaskListScreen;