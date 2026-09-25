import { Redirect, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { LivenessCamera } from '../../components/LivenessCamera';
import { ErrorText, PrimaryButton, Screen, Subtitle, Title } from '../../components/ui';
import { useApp } from '../../context/AppProvider';
import { facesMatch, MATCH_THRESHOLD } from '../../lib/face';
import { createId } from '../../lib/ids';
import { getRequiredLocation } from '../../lib/location';
import { colors, space } from '../../theme';

export default function MarkAttendanceScreen() {
  const router = useRouter();
  const { session, currentStaff, markAttendance } = useApp();
  const [locationError, setLocationError] = useState<string | null>(null);
  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
    accuracy?: number;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const attendanceId = useMemo(() => createId('att'), []);

  useEffect(() => {
    let active = true;
    getRequiredLocation()
      .then((value) => {
        if (active) {
          setCoords(value);
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setLocationError(error instanceof Error ? error.message : 'Location unavailable');
        }
      });
    return () => {
      active = false;
    };
  }, []);

  if (!session || session.role !== 'staff' || !currentStaff) {
    return <Redirect href="/" />;
  }
  if (!currentStaff.faceEmbedding) {
    return (
      <Screen>
        <Title>Face not enrolled</Title>
        <Subtitle>Ask an admin to enrol your face before marking attendance.</Subtitle>
        <PrimaryButton title="Back" onPress={() => router.back()} />
      </Screen>
    );
  }

  if (locationError) {
    return (
      <Screen>
        <Title>Location required</Title>
        <Subtitle>{locationError}</Subtitle>
        <PrimaryButton title="Close" onPress={() => router.back()} />
      </Screen>
    );
  }

  if (!coords) {
    return (
      <Screen>
        <Title>Getting location…</Title>
        <Subtitle>Attendance is stored with GPS coordinates from this phone.</Subtitle>
      </Screen>
    );
  }

  return (
    <Screen style={styles.screen}>
      <View style={styles.header}>
        <Title>Mark attendance</Title>
        <Subtitle>Pass liveness, then your selfie must match the enrolled face.</Subtitle>
        <Text style={styles.coords}>
          {coords.latitude.toFixed(5)}, {coords.longitude.toFixed(5)}
        </Text>
      </View>
      {busy ? <ErrorText message="Checking face match…" /> : null}
      <LivenessCamera
        mode="attendance"
        fileId={attendanceId}
        onCaptured={({ uri, embedding, challenge }) => {
          if (busy) {
            return;
          }
          setBusy(true);
          const matched = facesMatch(currentStaff.faceEmbedding ?? [], embedding, MATCH_THRESHOLD);
          if (!matched) {
            Alert.alert(
              'Face did not match',
              'This selfie does not match the enrolled face. Attendance was not saved.',
              [{ text: 'OK', onPress: () => router.back() }],
            );
            return;
          }
          void markAttendance({
            id: attendanceId,
            staffId: currentStaff.id,
            timestamp: new Date().toISOString(),
            selfieUri: uri,
            latitude: coords.latitude,
            longitude: coords.longitude,
            accuracy: coords.accuracy,
            livenessPassed: true,
            livenessChallenge: challenge,
          }).then(() => {
            Alert.alert('Attendance marked', `${new Date().toLocaleString()}`, [
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
    gap: 4,
  },
  coords: {
    color: colors.muted,
    marginTop: 4,
  },
});
