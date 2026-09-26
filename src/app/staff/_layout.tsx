import { Stack } from 'expo-router';

import { stackScreenOptions } from '../../theme';

export default function StaffLayout() {
  return (
    <Stack screenOptions={stackScreenOptions}>
      <Stack.Screen name="index" options={{ title: 'Attendance' }} />
      <Stack.Screen name="mark" options={{ title: 'Mark attendance', presentation: 'fullScreenModal' }} />
    </Stack>
  );
}
