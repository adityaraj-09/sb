import { Image } from 'expo-image';
import { Redirect, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card, Pill, PrimaryButton, Screen, Subtitle, Title } from '../../components/ui';
import { useApp } from '../../context/AppProvider';
import { colors, space } from '../../theme';

function formatWhen(value: string): string {
  return new Date(value).toLocaleString();
}

export default function StaffHomeScreen() {
  const router = useRouter();
  const { session, currentStaff, records, logout } = useApp();
  const history = records.filter((item) => item.staffId === currentStaff?.id);

  if (!session) {
    return <Redirect href="/login" />;
  }
  if (session.role !== 'staff') {
    return <Redirect href="/admin" />;
  }

  const enrolled = Boolean(currentStaff?.faceEmbedding?.length);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Title>{currentStaff?.name ?? 'Staff'}</Title>
        <Subtitle>{currentStaff?.employeeId ?? 'Unknown staff record'}</Subtitle>
        <Pill
          label={enrolled ? 'Ready to mark attendance' : 'Ask admin to enrol your face'}
          tone={enrolled ? 'success' : 'warn'}
        />

        <PrimaryButton
          title="Mark attendance"
          disabled={!enrolled}
          onPress={() => router.push('/staff/mark')}
        />

        <Text style={styles.section}>Your history</Text>
        {history.length === 0 ? (
          <Text style={styles.empty}>No attendance on this phone yet.</Text>
        ) : (
          history.map((item) => (
            <Card key={item.id} style={styles.row}>
              {item.selfieUri ? <Image source={{ uri: item.selfieUri }} style={styles.thumb} /> : null}
              <View style={{ flex: 1 }}>
                <Text style={styles.when}>{formatWhen(item.timestamp)}</Text>
                <Text style={styles.meta}>
                  {item.latitude.toFixed(5)}, {item.longitude.toFixed(5)}
                </Text>
              </View>
            </Card>
          ))
        )}

        <PrimaryButton title="Log out" tone="ghost" onPress={() => void logout()} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: space.sm,
    paddingBottom: space.xl,
    gap: space.md,
  },
  section: {
    marginTop: space.sm,
    fontSize: 18,
    fontWeight: '700',
    color: colors.ink,
  },
  empty: {
    color: colors.muted,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: colors.line,
  },
  when: {
    fontWeight: '700',
    color: colors.ink,
  },
  meta: {
    color: colors.muted,
    marginTop: 2,
  },
});
