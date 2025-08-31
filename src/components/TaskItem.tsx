import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Task } from '../types';
import { COLORS } from '../utils/constants';

interface Props {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
  onStatusChange: (task: Task) => void;
}

const TaskItem: React.FC<Props> = ({ task, onEdit, onDelete, onStatusChange }) => {
  const getStatusColor = (statusName: string): string => {
    switch (statusName.toLowerCase()) {
      case 'pending':
        return COLORS.WARNING;
      case 'in progress':
        return COLORS.PRIMARY;
      case 'completed':
        return COLORS.SUCCESS;
      default:
        return COLORS.SECONDARY;
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(task.id),
        },
      ]
    );
  };

  const handleStatusPress = () => {
    const statuses = ['Pending', 'In Progress', 'Completed'];
    const currentStatus = task.task_status_id.name;
    const otherStatuses = statuses.filter(status => status !== currentStatus);
    
    Alert.alert(
      'Change Status',
      `Current status: ${currentStatus}`,
      [
        ...otherStatuses.map(status => ({
          text: status,
          onPress: () => {
            const newTask = {
              ...task,
              task_status_id: { ...task.task_status_id, name: status }
            };
            onStatusChange(newTask);
          },
        })),
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          {task.title}
        </Text>
        <TouchableOpacity
          style={[styles.statusBadge, { backgroundColor: getStatusColor(task.task_status_id.name) }]}
          onPress={handleStatusPress}
        >
          <Text style={styles.statusText}>{task.task_status_id.name}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.description} numberOfLines={3}>
        {task.description}
      </Text>

      <View style={styles.footer}>
        <View style={styles.dateContainer}>
          <Text style={styles.dateLabel}>Created:</Text>
          <Text style={styles.dateText}>{formatDate(task.created_at)}</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.editButton} onPress={() => onEdit(task)}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 10,
    padding: 15,
    marginVertical: 5,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.DARK_GRAY,
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: COLORS.WHITE,
    fontSize: 12,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: COLORS.SECONDARY,
    lineHeight: 20,
    marginBottom: 15,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: COLORS.SECONDARY,
    fontWeight: '500',
  },
  dateText: {
    fontSize: 12,
    color: COLORS.DARK_GRAY,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  editButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  editButtonText: {
    color: COLORS.WHITE,
    fontSize: 12,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: COLORS.ERROR,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: COLORS.WHITE,
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default TaskItem;