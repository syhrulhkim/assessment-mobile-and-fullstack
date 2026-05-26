import React, { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { RootStackParamList } from '../navigation/RootNavigator';
import { createTask, TaskPriority } from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'Form'>;

export default function FormScreen({ navigation }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError('');

    if (title.trim().length < 3) {
      setError('Title must be at least 3 characters.');
      return;
    }

    setLoading(true);

    try {
      await createTask({ title: title.trim(), description: description.trim(), priority });
      Alert.alert('Success', 'Task created successfully.');
      setTitle('');
      setDescription('');
      setPriority('medium');
      navigation.replace('TaskList');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.title}>Create task</Text>
        <Text style={styles.subtitle}>Add a clear task with the right priority.</Text>

        <Text style={styles.label}>Title</Text>
        <TextInput value={title} onChangeText={setTitle} style={styles.input} />

        <Text style={styles.label}>Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          style={[styles.input, styles.textarea]}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />
        <Text style={styles.label}>Priority</Text>
        <View style={styles.row}>
          {(['low', 'medium', 'high'] as TaskPriority[]).map((value) => (
            <Pressable
              key={value}
              style={[styles.chip, priority === value && styles.chipActive]}
              onPress={() => setPriority(value)}
            >
              <Text style={[styles.chipText, priority === value && styles.chipTextActive]}>
                {value.charAt(0).toUpperCase() + value.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.meta}>Selected: {priority}</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable style={[styles.primaryButton, loading && styles.buttonDisabled]} onPress={onSubmit} disabled={loading}>
          <Text style={styles.primaryButtonText}>{loading ? 'Creating...' : 'Create Task'}</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => navigation.replace('TaskList')}>
          <Text style={styles.secondaryButtonText}>Back to Tasks</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f7f5f1' },
  content: { padding: 16 },
  card: { borderWidth: 1, borderColor: '#ded9d2', borderRadius: 10, backgroundColor: '#fff', padding: 16, gap: 8 },
  title: { fontSize: 30, fontWeight: '600', color: '#2c2c2c' },
  subtitle: { color: '#6e7781', marginBottom: 4 },
  label: { fontWeight: '600', color: '#2c2c2c' },
  input: { borderWidth: 1, borderColor: '#d6d2cb', borderRadius: 8, padding: 10, backgroundColor: '#fff' },
  textarea: { minHeight: 110 },
  error: { color: '#d1242f' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderColor: '#d6d2cb', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7, backgroundColor: '#fff' },
  chipActive: { backgroundColor: '#2b2b2b', borderColor: '#2b2b2b' },
  chipText: { color: '#2c2c2c', fontWeight: '500' },
  chipTextActive: { color: '#fff' },
  meta: { color: '#6e7781', fontSize: 12, textTransform: 'capitalize', marginBottom: 8 },
  primaryButton: { backgroundColor: '#2b2b2b', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontWeight: '600' },
  secondaryButton: { borderWidth: 1, borderColor: '#d6d2cb', paddingVertical: 11, borderRadius: 8, alignItems: 'center' },
  secondaryButtonText: { color: '#2c2c2c', fontWeight: '500' },
  buttonDisabled: { opacity: 0.65 },
});
