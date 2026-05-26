import React, { useCallback, useEffect, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { RootStackParamList } from '../navigation/RootNavigator';
import { deleteTask, fetchTasks, logout, Task, TaskPriority, TaskStatus, updateTask } from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskList'>;

export default function TaskListScreen({ navigation }: Props) {
  const [items, setItems] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [isOfflineData, setIsOfflineData] = useState(false);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | ''>('');
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState<TaskStatus>('pending');
  const [editPriority, setEditPriority] = useState<TaskPriority>('medium');

  const loadData = useCallback(async () => {
    setError('');

    try {
      const result = await fetchTasks(statusFilter, priorityFilter);
      setItems(result.data);
      setIsOfflineData(result.source === 'cache');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      setIsOfflineData(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [priorityFilter, statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      loadData();
    }, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, [loadData]);

  const startEdit = (task: Task) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditStatus(task.status);
    setEditPriority(task.priority);
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
  };

  const saveEdit = async (taskId: number) => {
    if (!editTitle.trim()) {
      Alert.alert('Validation', 'Title is required.');
      return;
    }

    try {
      setLoading(true);
      await updateTask(taskId, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        status: editStatus,
        priority: editPriority,
      });
      setEditingTaskId(null);
      await loadData();
    } catch (e) {
      Alert.alert('Update failed', e instanceof Error ? e.message : 'Unable to update task.');
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (taskId: number) => {
    try {
      setLoading(true);
      await deleteTask(taskId);
      await loadData();
    } catch (e) {
      Alert.alert('Delete failed', e instanceof Error ? e.message : 'Unable to delete task.');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (task: Task) => {
    const nextStatus: TaskStatus = task.status === 'completed' ? 'pending' : 'completed';

    try {
      setLoading(true);
      await updateTask(task.id, { status: nextStatus });
      await loadData();
    } catch (e) {
      Alert.alert('Update failed', e instanceof Error ? e.message : 'Unable to update status.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text>Loading data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        <Pressable style={styles.primaryButton} onPress={loadData}>
          <Text style={styles.primaryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.headerCard}>
        <View>
          <Text style={styles.headerEyebrow}>TASK WORKSPACE</Text>
          <Text style={styles.headerTitle}>Practical Task Manager</Text>
        </View>
        <View style={styles.row}>
          <Pressable style={styles.secondaryButton} onPress={loadData}>
            <Text style={styles.secondaryButtonText}>Refresh</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate('Form')}>
            <Text style={styles.secondaryButtonText}>Create Task</Text>
          </Pressable>
          <Pressable
            style={styles.secondaryButton}
            onPress={async () => {
              await logout();
              navigation.replace('Login');
            }}
          >
            <Text style={styles.secondaryButtonText}>Logout</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.listCard}>
        <Text style={styles.sectionTitle}>Task List</Text>
        <Text style={styles.sectionSubtitle}>Filter, complete, and clean up tasks quickly.</Text>

        <Text style={styles.filterTitle}>Status</Text>
        <View style={styles.row}>
          {(['', 'pending', 'completed'] as Array<TaskStatus | ''>).map((value) => (
            <Pressable
              key={`status-${value || 'all'}`}
              style={[styles.chip, statusFilter === value && styles.chipActive]}
              onPress={() => setStatusFilter(value)}
            >
              <Text style={[styles.chipText, statusFilter === value && styles.chipTextActive]}>
                {value ? value.charAt(0).toUpperCase() + value.slice(1) : 'All'}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.filterTitle}>Priority</Text>
        <View style={styles.row}>
          {(['', 'low', 'medium', 'high'] as Array<TaskPriority | ''>).map((value) => (
            <Pressable
              key={`priority-${value || 'all'}`}
              style={[styles.chip, priorityFilter === value && styles.chipActive]}
              onPress={() => setPriorityFilter(value)}
            >
              <Text style={[styles.chipText, priorityFilter === value && styles.chipTextActive]}>
                {value ? value.charAt(0).toUpperCase() + value.slice(1) : 'All'}
              </Text>
            </Pressable>
          ))}
        </View>

        {isOfflineData ? <Text style={styles.offline}>Showing cached offline data.</Text> : null}

        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          scrollEnabled={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadData();
              }}
            />
          }
          ListEmptyComponent={<Text style={styles.empty}>No tasks found.</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {editingTaskId === item.id ? (
                <>
                  <TextInput value={editTitle} onChangeText={setEditTitle} style={styles.input} />
                  <TextInput
                    value={editDescription}
                    onChangeText={setEditDescription}
                    style={[styles.input, styles.inputMultiline]}
                    multiline
                  />
                  <Text style={styles.meta}>Status</Text>
                  <View style={styles.row}>
                    {(['pending', 'completed'] as TaskStatus[]).map((value) => (
                      <Pressable
                        key={`edit-status-${item.id}-${value}`}
                        style={[styles.chip, editStatus === value && styles.chipActive]}
                        onPress={() => setEditStatus(value)}
                      >
                        <Text style={[styles.chipText, editStatus === value && styles.chipTextActive]}>
                          {value.charAt(0).toUpperCase() + value.slice(1)}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                  <Text style={styles.meta}>Priority</Text>
                  <View style={styles.row}>
                    {(['low', 'medium', 'high'] as TaskPriority[]).map((value) => (
                      <Pressable
                        key={`edit-priority-${item.id}-${value}`}
                        style={[styles.chip, editPriority === value && styles.chipActive]}
                        onPress={() => setEditPriority(value)}
                      >
                        <Text style={[styles.chipText, editPriority === value && styles.chipTextActive]}>
                          {value.charAt(0).toUpperCase() + value.slice(1)}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                  <View style={styles.row}>
                    <Pressable style={styles.primaryButton} onPress={() => saveEdit(item.id)} disabled={loading || !editTitle.trim()}>
                      <Text style={styles.primaryButtonText}>Save</Text>
                    </Pressable>
                    <Pressable style={styles.secondaryButton} onPress={cancelEdit}>
                      <Text style={styles.secondaryButtonText}>Cancel</Text>
                    </Pressable>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.badgeRow}>
                    <Text style={styles.badge}>{item.status}</Text>
                    <Text style={styles.badge}>{item.priority}</Text>
                  </View>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.description}>{item.description || 'No description'}</Text>
                  <View style={styles.row}>
                    <Pressable style={styles.secondaryButton} onPress={() => toggleStatus(item)} disabled={loading}>
                      <Text style={styles.secondaryButtonText}>
                        {item.status === 'completed' ? 'Mark Pending' : 'Mark Completed'}
                      </Text>
                    </Pressable>
                    <Pressable style={styles.secondaryButton} onPress={() => startEdit(item)}>
                      <Text style={styles.secondaryButtonText}>Edit</Text>
                    </Pressable>
                    <Pressable style={styles.dangerButton} onPress={() => onDelete(item.id)} disabled={loading}>
                      <Text style={styles.dangerButtonText}>Delete</Text>
                    </Pressable>
                  </View>
                </>
              )}
            </View>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 12, backgroundColor: '#f7f5f1' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  headerCard: {
    borderWidth: 1,
    borderColor: '#ded9d2',
    borderRadius: 10,
    backgroundColor: '#fff',
    padding: 14,
    marginBottom: 10,
    gap: 10,
  },
  headerEyebrow: { fontSize: 11, letterSpacing: 1.3, color: '#6e7781' },
  headerTitle: { fontSize: 30, fontWeight: '600', color: '#2c2c2c' },
  listCard: { borderWidth: 1, borderColor: '#ded9d2', borderRadius: 10, backgroundColor: '#fff', padding: 14 },
  sectionTitle: { fontSize: 34, fontWeight: '600', color: '#2c2c2c' },
  sectionSubtitle: { color: '#6e7781', marginBottom: 8 },
  filterTitle: { fontWeight: '600', color: '#2c2c2c', marginTop: 4 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  card: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, paddingBottom: 12, paddingTop: 8, marginTop: 10 },
  title: { fontWeight: '700', marginTop: 2, marginBottom: 4, color: '#2c2c2c', fontSize: 20 },
  description: { color: '#6e7781', marginBottom: 10 },
  meta: { marginTop: 6, color: '#6e7781', fontSize: 12, fontWeight: '500' },
  badgeRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 6, flexWrap: 'wrap' },
  badge: {
    borderWidth: 1,
    borderColor: '#d6d2cb',
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
    color: '#2c2c2c',
    textTransform: 'capitalize',
    fontWeight: '500',
    overflow: 'hidden',
  },
  error: { color: '#d1242f' },
  offline: { color: '#6e7781', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#d6d2cb', borderRadius: 8, padding: 10, backgroundColor: '#fff' },
  inputMultiline: { minHeight: 80, textAlignVertical: 'top' },
  chip: { borderWidth: 1, borderColor: '#d6d2cb', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7, backgroundColor: '#fff' },
  chipActive: { backgroundColor: '#2b2b2b', borderColor: '#2b2b2b' },
  chipText: { color: '#2c2c2c', fontWeight: '500' },
  chipTextActive: { color: '#fff' },
  primaryButton: { backgroundColor: '#2b2b2b', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8 },
  primaryButtonText: { color: '#fff', fontWeight: '600' },
  secondaryButton: { borderWidth: 1, borderColor: '#d6d2cb', backgroundColor: '#f5f2ed', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8 },
  secondaryButtonText: { color: '#2c2c2c', fontWeight: '500' },
  dangerButton: { backgroundColor: '#cf2f28', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8 },
  dangerButtonText: { color: '#fff', fontWeight: '600' },
  empty: { color: '#6e7781', marginTop: 12 },
});
