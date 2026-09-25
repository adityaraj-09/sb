import { Stack } from 'expo-router';

import { colors } from '../../theme';

export default function StaffLayout() {
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
      <Stack.Screen name="index" options={{ title: 'Attendance' }} />
      <Stack.Screen name="mark" options={{ title: 'Mark attendance', presentation: 'fullScreenModal' }} />
    </Stack>
  );
}
