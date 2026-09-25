import { CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { persistPhoto } from '../lib/files';
import { analyzeFrame, hasUsableFace } from '../lib/face';
import { embeddingFromUri, imageFromUri } from '../lib/image';
import { createLivenessSession, reduceLiveness } from '../lib/liveness';
import { colors, radius } from '../theme';
import type { Challenge, LivenessSession } from '../types';
import { ErrorText, PrimaryButton } from './ui';

export type CaptureResult = {
  uri: string;
  embedding: number[];
  challenge: Challenge;
};

type Props = {
  mode: 'enrol' | 'attendance';
  fileId: string;
  onCaptured: (result: CaptureResult) => void;
};

export function LivenessCamera({ mode, fileId, onCaptured }: Props) {
  const cameraRef = useRef<CameraView>(null);
  const busyRef = useRef(false);
  const completedRef = useRef(false);
  const sessionRef = useRef<LivenessSession>(createLivenessSession(Date.now()));
  const onCapturedRef = useRef(onCaptured);
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);
  const [session, setSession] = useState(sessionRef.current);
  const [error, setError] = useState<string | null>(null);
  const [finishing, setFinishing] = useState(false);

  onCapturedRef.current = onCaptured;

  const resetSession = () => {
    completedRef.current = false;
    sessionRef.current = createLivenessSession(Date.now());
    setSession(sessionRef.current);
    setFinishing(false);
    setError(null);
  };

  useEffect(() => {
    const terminal = session.phase === 'failed' || session.phase === 'passed' || finishing;
    if (!permission?.granted || !cameraReady || terminal) {
      return;
    }

    const timer = setInterval(() => {
      void sampleFrame();
    }, 900);

    return () => clearInterval(timer);
  }, [permission?.granted, cameraReady, session.phase, finishing]);

  const sampleFrame = async () => {
    if (busyRef.current || finishing || completedRef.current) {
      return;
    }
    const camera = cameraRef.current;
    if (!camera) {
      return;
    }
    busyRef.current = true;
    try {
      const photo = await camera.takePictureAsync({
        quality: 0.4,
        shutterSound: false,
      });
      if (!photo?.uri) {
        return;
      }
      const image = await imageFromUri(photo.uri, { size: 96 });
      const features = analyzeFrame(image);
      const next = reduceLiveness(sessionRef.current, features, Date.now());
      sessionRef.current = next;
      setSession(next);

      if (next.phase !== 'passed' || completedRef.current) {
        return;
      }
      completedRef.current = true;
      setFinishing(true);

      const finalPhoto = await camera.takePictureAsync({
        quality: 0.8,
        shutterSound: false,
      });
      if (!finalPhoto?.uri) {
        throw new Error('Could not capture selfie');
      }
      const finalImage = await imageFromUri(finalPhoto.uri, { size: 96 });
      if (!hasUsableFace(analyzeFrame(finalImage))) {
        throw new Error('Final selfie did not contain a clear face');
      }
      const embedding = await embeddingFromUri(finalPhoto.uri);
      const stored = await persistPhoto(
        finalPhoto.uri,
        mode === 'enrol' ? 'faces' : 'attendance',
        fileId,
      );
      onCapturedRef.current({
        uri: stored,
        embedding,
        challenge: next.challenge,
      });
    } catch (caught) {
      if (completedRef.current || finishing) {
        setError(caught instanceof Error ? caught.message : 'Camera capture failed');
        resetSession();
      }
    } finally {
      busyRef.current = false;
    }
  };

  if (!permission) {
    return <View style={styles.center} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.copy}>
          Camera access is required for {mode === 'enrol' ? 'face enrolment' : 'attendance'}.
        </Text>
        <PrimaryButton title="Allow camera" onPress={() => void requestPermission()} />
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="front"
        mirror
        animateShutter={false}
        mode="picture"
        onCameraReady={() => setCameraReady(true)}
        onMountError={() => setError('Could not start the camera')}
      />
      <View style={styles.oval} pointerEvents="none" />
      <View style={styles.banner}>
        <Text style={styles.bannerKicker}>
          {mode === 'enrol' ? 'Enrol face' : 'Mark attendance'} ·{' '}
          {session.challenge.replaceAll('_', ' ')}
        </Text>
        <Text style={styles.bannerText}>
          {finishing ? 'Saving selfie…' : session.instruction}
        </Text>
      </View>
      <ErrorText message={error} />
      {session.phase === 'failed' ? (
        <PrimaryButton title="Try again" onPress={resetSession} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    gap: 12,
  },
  camera: {
    flex: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  oval: {
    position: 'absolute',
    top: '18%',
    left: '16%',
    right: '16%',
    height: '48%',
    borderRadius: 999,
    borderWidth: 3,
    borderColor: colors.oval,
  },
  banner: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: 14,
  },
  bannerKicker: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  bannerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
  },
  copy: {
    fontSize: 16,
    color: colors.ink,
    textAlign: 'center',
  },
});
