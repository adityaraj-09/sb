import { Stack } from 'expo-router';

import { colors } from '../../theme';

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.primary,
        headerTitleStyle: { color: colors.ink, fontWeight: '700' },
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Staff' }} />
      <Stack.Screen name="add" options={{ title: 'Add staff', presentation: 'modal' }} />
      <Stack.Screen name="[staffId]" options={{ title: 'Profile' }} />
      <Stack.Screen name="enrol/[staffId]" options={{ title: 'Enrol face', presentation: 'fullScreenModal' }} />
    </Stack>
  );
}
