import { Stack } from 'expo-router';

import { stackScreenOptions } from '../../theme';

export default function AdminLayout() {
  return (
    <Stack screenOptions={stackScreenOptions}>
      <Stack.Screen name="index" options={{ title: 'Staff' }} />
      <Stack.Screen name="add" options={{ title: 'Add staff', presentation: 'modal' }} />
      <Stack.Screen name="[staffId]" options={{ title: 'Profile' }} />
      <Stack.Screen name="enrol/[staffId]" options={{ title: 'Enrol face', presentation: 'fullScreenModal' }} />
    </Stack>
  );
}
