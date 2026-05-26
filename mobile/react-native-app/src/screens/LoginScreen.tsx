import React, { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { RootStackParamList } from '../navigation/RootNavigator';
import { login } from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('demo3@example.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.');
      return;
    }

    setLoading(true);
    try {
      await login({ email: email.trim(), password: password.trim() });
      Alert.alert('Login success', 'Authenticated with backend API.', [
        { text: 'Continue', onPress: () => navigation.replace('TaskList') },
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to manage tasks.</Text>
        <View style={styles.demoBox}>
          <Text style={styles.demoText}>Demo: demo3@example.com / password</Text>
        </View>

        <Text style={styles.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput value={password} onChangeText={setPassword} style={styles.input} secureTextEntry />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable style={[styles.primaryButton, loading && styles.buttonDisabled]} onPress={onLogin} disabled={loading}>
          <Text style={styles.primaryButtonText}>{loading ? 'Please wait...' : 'Login'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 16, justifyContent: 'center', backgroundColor: '#f7f5f1' },
  card: {
    borderWidth: 1,
    borderColor: '#ded9d2',
    borderRadius: 10,
    backgroundColor: '#ffffff',
    padding: 16,
    gap: 10,
  },
  title: { fontSize: 28, fontWeight: '600', color: '#2c2c2c' },
  subtitle: { color: '#6e7781', marginBottom: 4 },
  demoBox: { borderWidth: 1, borderColor: '#ded9d2', borderRadius: 8, backgroundColor: '#f3f0eb', padding: 10 },
  demoText: { color: '#6e7781', fontSize: 12 },
  label: { fontWeight: '600', color: '#2c2c2c' },
  input: { borderWidth: 1, borderColor: '#d6d2cb', borderRadius: 8, padding: 10, backgroundColor: '#fff' },
  primaryButton: { marginTop: 4, backgroundColor: '#2b2b2b', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontWeight: '600' },
  buttonDisabled: { opacity: 0.65 },
  error: { color: '#d1242f' },
});
