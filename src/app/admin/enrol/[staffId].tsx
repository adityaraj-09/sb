import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, StyleSheet, View } from 'react-native';

import { LivenessCamera } from '../../../components/LivenessCamera';
import { Screen, Subtitle, Title } from '../../../components/ui';
import { useApp } from '../../../context/AppProvider';
import { space } from '../../../theme';

export default function EnrolFaceScreen() {
  const router = useRouter();
  const { staffId } = useLocalSearchParams<{ staffId: string }>();
  const { session, staff, enrolFace } = useApp();
  const person = staff.find((item) => item.id === staffId);

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
    <Screen style={styles.screen}>
      <View style={styles.header}>
        <Title>Enrol {person.name}</Title>
        <Subtitle>Complete the random liveness check, then we store the face locally.</Subtitle>
      </View>
      <LivenessCamera
        mode="enrol"
        fileId={person.id}
        onCaptured={({ uri, embedding }) => {
          void enrolFace(person.id, uri, embedding).then(() => {
            Alert.alert('Face enrolled', `${person.name} can now mark attendance.`, [
              { text: 'OK', onPress: () => router.back() },
            ]);
          });
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingBottom: space.md,
  },
  header: {
    marginBottom: space.md,
  },
});
