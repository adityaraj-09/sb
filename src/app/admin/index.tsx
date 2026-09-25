import { Link, Redirect, useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { Pill, PrimaryButton, Screen, Subtitle, Title } from '../../components/ui';
import { useApp } from '../../context/AppProvider';
import { colors, radius, space } from '../../theme';

export default function StaffListScreen() {
  const router = useRouter();
  const { session, staff, logout } = useApp();

  if (!session) {
    return <Redirect href="/login" />;
  }
  if (session.role !== 'admin') {
    return <Redirect href="/staff" />;
  }

  return (
    <Screen>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Title>Staff</Title>
          <Subtitle>Add people, open a profile, and enrol a face for attendance.</Subtitle>
        </View>
      </View>

      <PrimaryButton title="Add staff member" onPress={() => router.push('/admin/add')} />

      <FlatList
        data={staff}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No staff yet. Add the first person.</Text>}
        renderItem={({ item }) => (
          <Link href={`/admin/${item.id}`} asChild>
            <Pressable style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.meta}>{item.employeeId}</Text>
              </View>
              <Pill
                label={item.faceEmbedding ? 'Face enrolled' : 'Not enrolled'}
                tone={item.faceEmbedding ? 'success' : 'warn'}
              />
            </Pressable>
          </Link>
        )}
      />

      <PrimaryButton title="Log out" tone="ghost" onPress={() => void logout()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: space.sm,
    marginBottom: space.md,
  },
  list: {
    paddingVertical: space.md,
    gap: space.sm,
  },
  row: {
    backgroundColor: colors.card,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: space.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.ink,
  },
  meta: {
    marginTop: 2,
    color: colors.muted,
  },
  empty: {
    textAlign: 'center',
    color: colors.muted,
    paddingVertical: space.xl,
  },
});
