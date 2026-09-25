import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Card, ErrorText, Field, PrimaryButton, Screen, Subtitle, Title } from '../components/ui';
import { useApp } from '../context/AppProvider';
import { DEMO } from '../lib/storage';
import { colors, space } from '../theme';

export default function LoginScreen() {
  const router = useRouter();
  const { session, login, resetDemo } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (session) {
    return <Redirect href={session.role === 'admin' ? '/admin' : '/staff'} />;
  }

  const onSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      await login(username, password);
      router.replace('/');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.kicker}>On-device attendance</Text>
        <Title>Sign in</Title>
        <Subtitle>Dummy accounts. Everything stays in app storage on this phone.</Subtitle>
      </View>

      <View style={styles.form}>
        <Field label="Username" value={username} onChangeText={setUsername} placeholder="admin" />
        <Field
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
        />
        <ErrorText message={error} />
        <PrimaryButton title="Login" onPress={() => void onSubmit()} loading={loading} />
      </View>

      <Card>
        <Text style={styles.hintTitle}>Demo credentials</Text>
        <Text style={styles.hint}>Admin — {DEMO.admin.username} / {DEMO.admin.password}</Text>
        <Text style={styles.hint}>
          Staff — {DEMO.staff.username} / {DEMO.staff.password} (enrol a face first)
        </Text>
      </Card>

      <PrimaryButton
        title="Reset local demo data"
        tone="ghost"
        onPress={() => {
          Alert.alert('Reset this phone?', 'Staff, faces, and attendance on this device will be cleared.', [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Reset',
              style: 'destructive',
              onPress: () => {
                void resetDemo();
              },
            },
          ]);
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingTop: space.xl,
    marginBottom: space.lg,
  },
  kicker: {
    color: colors.accent,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.4,
  },
  form: {
    gap: space.md,
    marginBottom: space.lg,
  },
  hintTitle: {
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 6,
  },
  hint: {
    color: colors.muted,
    lineHeight: 20,
  },
});
