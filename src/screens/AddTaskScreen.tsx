import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, Task, User, TaskCreateRequest, TaskUpdateRequest, TaskStatus } from '../types';
import { apiService } from '../services/api';
import { storageService } from '../services/storage';
import { COLORS, APP_CONFIG, DEFAULT_TASK_STATUSES } from '../utils/constants';

type AddTaskScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddTask'>;
type AddTaskScreenRouteProp = RouteProp<RootStackParamList, 'AddTask'>;

interface Props {
  navigation: AddTaskScreenNavigationProp;
  route: AddTaskScreenRouteProp;
}

const AddTaskScreen: React.FC<Props> = ({ navigation, route }) => {
  const { taskId, isEdit } = route.params || {};
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedStatusId, setSelectedStatusId] = useState(1); // Default to 'Pending'
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [taskStatuses, setTaskStatuses] = useState<TaskStatus[]>([...DEFAULT_TASK_STATUSES]);

  useEffect(() => {
    loadUserData();
    loadTaskStatuses();
    
    if (isEdit && taskId) {
      loadTaskData();
    }
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await storageService.getUserData();
      setUser(userData);
    } catch (error) {
      console.error('Error loading user data:', error);
      navigation.goBack();
    }
  };

  const loadTaskStatuses = async () => {
    try {
      const response = await apiService.getTaskStatuses();
      if (response.success && response.data) {
        setTaskStatuses(response.data);
      }
    } catch (error) {
      console.error('Error loading task statuses:', error);
      // Use default statuses if API fails
    }
  };

  const loadTaskData = async () => {
    if (!taskId) return;

    try {
      const response = await apiService.getTaskById(taskId);
      
      if (response.success && response.data) {
        const task = response.data;
        setTitle(task.title);
        setDescription(task.description);
        setSelectedStatusId(task.task_status_id.id);
      } else {
        Alert.alert('Error', 'Failed to load task data');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error loading task data:', error);
      Alert.alert('Error', 'Unable to load task data');
      navigation.goBack();
    }
  };

  const validateForm = (): boolean => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Title is required');
      return false;
    }
    if (title.length > APP_CONFIG.MAX_TITLE_LENGTH) {
      Alert.alert('Validation Error', `Title must be less than ${APP_CONFIG.MAX_TITLE_LENGTH} characters`);
      return false;
    }
    if (!description.trim()) {
      Alert.alert('Validation Error', 'Description is required');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm() || !user) return;

    setLoading(true);
    try {
      if (isEdit && taskId) {
        // Update existing task
        const updateData: TaskUpdateRequest = {
          id: taskId,
          title: title.trim(),
          description: description.trim(),
          task_status_id: selectedStatusId,
        };

        const response = await apiService.updateTask(updateData);
        
        if (response.success) {
          Alert.alert('Success', 'Task updated successfully');
          navigation.goBack();
        } else {
          Alert.alert('Error', response.message || 'Failed to update task');
        }
      } else {
        // Create new task
        const createData: TaskCreateRequest = {
          title: title.trim(),
          description: description.trim(),
          task_status_id: selectedStatusId,
          user_id: user.id,
        };

        const response = await apiService.createTask(createData);
        
        if (response.success) {
          Alert.alert('Success', 'Task created successfully');
          navigation.goBack();
        } else {
          Alert.alert('Error', response.message || 'Failed to create task');
        }
      }
    } catch (error) {
      console.error('Error saving task:', error);
      Alert.alert('Error', 'Unable to save task. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const renderStatusSelector = () => (
    <View style={styles.statusContainer}>
      <Text style={styles.label}>Status</Text>
      <View style={styles.statusButtons}>
        {taskStatuses.map((status) => (
          <TouchableOpacity
            key={status.id}
            style={[
              styles.statusButton,
              selectedStatusId === status.id && styles.statusButtonSelected,
            ]}
            onPress={() => setSelectedStatusId(status.id)}
          >
            <Text
              style={[
                styles.statusButtonText,
                selectedStatusId === status.id && styles.statusButtonTextSelected,
              ]}
            >
              {status.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter task title"
              value={title}
              onChangeText={setTitle}
              maxLength={APP_CONFIG.MAX_TITLE_LENGTH}
              editable={!loading}
            />
            <Text style={styles.charCount}>
              {title.length}/{APP_CONFIG.MAX_TITLE_LENGTH}
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter task description"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={!loading}
            />
          </View>

          {renderStatusSelector()}

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={() => navigation.goBack()}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.saveButton, loading && styles.buttonDisabled]} 
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.WHITE} />
              ) : (
                <Text style={styles.saveButtonText}>
                  {isEdit ? 'Update' : 'Create'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.LIGHT_GRAY,
  },
  scrollContainer: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.DARK_GRAY,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: COLORS.WHITE,
  },
  textArea: {
    height: 100,
    paddingTop: 15,
  },
  charCount: {
    fontSize: 12,
    color: COLORS.SECONDARY,
    textAlign: 'right',
    marginTop: 5,
  },
  statusContainer: {
    marginBottom: 30,
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statusButton: {
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.WHITE,
  },
  statusButtonSelected: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY,
  },
  statusButtonText: {
    fontSize: 14,
    color: COLORS.DARK_GRAY,
  },
  statusButtonTextSelected: {
    color: COLORS.WHITE,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  saveButton: {
    backgroundColor: COLORS.PRIMARY,
  },
  buttonDisabled: {
    backgroundColor: COLORS.SECONDARY,
  },
  cancelButtonText: {
    color: COLORS.DARK_GRAY,
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddTaskScreen;