import { Image } from 'expo-image';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card, Pill, PrimaryButton, Screen, Subtitle, Title } from '../../components/ui';
import { useApp } from '../../context/AppProvider';
import { firstParam } from '../../lib/params';
import { colors, space } from '../../theme';

function formatWhen(value: string): string {
  return new Date(value).toLocaleString();
}

export default function StaffProfileScreen() {
  const router = useRouter();
  const staffId = firstParam(useLocalSearchParams<{ staffId: string | string[] }>().staffId);
  const { session, staff, records } = useApp();
  const person = staff.find((item) => item.id === staffId);
  const history = records.filter((item) => item.staffId === staffId);

  if (!session || session.role !== 'admin') {
    return <Redirect href="/" />;
  }
  if (!person) {
    return (
      <Screen>
        <Title>Staff not found</Title>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Title>{person.name}</Title>
        <Subtitle>{person.employeeId}</Subtitle>
        <Pill
          label={person.faceEmbedding ? 'Face enrolled' : 'Face not enrolled'}
          tone={person.faceEmbedding ? 'success' : 'warn'}
        />

        {person.enrolledFaceUri ? (
          <Image source={{ uri: person.enrolledFaceUri }} style={styles.photo} />
        ) : null}

        <PrimaryButton
          title={person.faceEmbedding ? 'Re-enrol face' : 'Enrol face'}
          onPress={() => router.push(`/admin/enrol/${person.id}`)}
        />

        <Text style={styles.section}>Attendance</Text>
        {history.length === 0 ? (
          <Text style={styles.empty}>No attendance yet.</Text>
        ) : (
          history.map((item) => (
            <Card key={item.id} style={styles.row}>
              {item.selfieUri ? <Image source={{ uri: item.selfieUri }} style={styles.thumb} /> : null}
              <View style={{ flex: 1 }}>
                <Text style={styles.when}>{formatWhen(item.timestamp)}</Text>
                <Text style={styles.meta}>
                  {item.latitude.toFixed(5)}, {item.longitude.toFixed(5)}
                </Text>
                <Text style={styles.meta}>Liveness: {item.livenessChallenge.replace('_', ' ')}</Text>
              </View>
            </Card>
          ))
        )}
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
  photo: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    backgroundColor: colors.line,
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
