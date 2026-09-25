import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { useApp } from '../context/AppProvider';
import { colors } from '../theme';

export default function Index() {
  const { ready, session } = useApp();

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/login" />;
  }
  if (session.role === 'admin') {
    return <Redirect href="/admin" />;
  }
  return <Redirect href="/staff" />;
}
