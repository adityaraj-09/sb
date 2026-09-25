import { Image } from 'expo-image';
import { Redirect, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card, Pill, PrimaryButton, Screen, Subtitle, Title } from '../../components/ui';
import { useApp } from '../../context/AppProvider';
import { colors, fonts, radius, space } from '../../theme';

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
        <Text style={styles.brand}>STAFF</Text>
        <Title>{currentStaff?.name ?? 'Staff'}</Title>
        <Subtitle>{currentStaff?.employeeId ?? 'Unknown staff record'}</Subtitle>
        <Pill
          label={enrolled ? 'Ready' : 'Ask admin to enrol your face'}
          tone={enrolled ? 'success' : 'warn'}
        />

        <PrimaryButton
          title="Mark attendance"
          disabled={!enrolled}
          onPress={() => router.push('/staff/mark')}
        />

        <Text style={styles.section}>History</Text>
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
  brand: {
    color: colors.muted,
    fontFamily: fonts.monoMedium,
    fontSize: 11,
    letterSpacing: 2,
  },
  section: {
    marginTop: space.sm,
    fontSize: 13,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontFamily: fonts.monoMedium,
    color: colors.muted,
  },
  empty: {
    color: colors.muted,
    fontFamily: fonts.sans,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  when: {
    fontFamily: fonts.sansMedium,
    color: colors.ink,
  },
  meta: {
    color: colors.muted,
    marginTop: 3,
    fontFamily: fonts.mono,
    fontSize: 12,
  },
});
