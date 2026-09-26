import type { Challenge, FaceFrameFeatures, LivenessSession } from '../types';
import { hasUsableFace } from './face';

export const LIVENESS_TIMEOUT_MS = 12_000;
export const HEAD_TURN_DELTA = 0.08;
export const CENTER_TOLERANCE = 0.055;
export const BLINK_DROP = 14;

const INSTRUCTIONS: Record<Challenge, string> = {
  blink: 'Blink slowly — close your eyes, then open them',
  turn_left: 'Turn your head to your left, then face the camera again',
  turn_right: 'Turn your head to your right, then face the camera again',
};

export function pickChallenge(random = Math.random): Challenge {
  const options: Challenge[] = ['blink', 'turn_left', 'turn_right'];
  return options[Math.floor(random() * options.length)];
}

export function createLivenessSession(
  now: number,
  challenge: Challenge = pickChallenge(),
): LivenessSession {
  return {
    phase: 'seek_face',
    challenge,
    instruction: 'Center your face in the oval',
    startedAt: now,
    baselineX: null,
    baselineEyeBrightness: null,
    sawClosedEyes: false,
    sawOpenEyesAfter: false,
  };
}

export function reduceLiveness(
  session: LivenessSession,
  features: FaceFrameFeatures,
  now: number,
): LivenessSession {
  if (session.phase === 'passed' || session.phase === 'failed') {
    return session;
  }
  if (now - session.startedAt > LIVENESS_TIMEOUT_MS) {
    return {
      ...session,
      phase: 'failed',
      instruction: 'Liveness timed out. Try again in better light.',
    };
  }
  const faceOk =
    session.baselineX == null
      ? hasUsableFace(features)
      : features.skinRatio >= 0.08;

  if (!faceOk) {
    return {
      ...session,
      phase: session.baselineX == null ? 'seek_face' : session.phase,
      instruction:
        session.baselineX == null
          ? 'Center your face in the oval'
          : 'Keep your face in the oval',
    };
  }

  if (session.phase === 'seek_face') {
    return {
      ...session,
      phase: 'challenge',
      baselineX: features.centroidX,
      baselineEyeBrightness: features.eyeBrightness,
      instruction: INSTRUCTIONS[session.challenge],
    };
  }

  if (session.challenge === 'blink') {
    return reduceBlink(session, features);
  }
  return reduceHeadTurn(session, features);
}

function reduceBlink(
  session: LivenessSession,
  features: FaceFrameFeatures,
): LivenessSession {
  const baseline = session.baselineEyeBrightness ?? features.eyeBrightness;
  if (!session.sawClosedEyes && features.eyeBrightness <= baseline - BLINK_DROP) {
    return {
      ...session,
      sawClosedEyes: true,
      instruction: 'Now open your eyes',
    };
  }
  if (
    session.sawClosedEyes &&
    features.eyeBrightness >= baseline - BLINK_DROP / 2
  ) {
    return {
      ...session,
      phase: 'passed',
      sawOpenEyesAfter: true,
      instruction: 'Liveness passed',
    };
  }
  return session;
}

function reduceHeadTurn(
  session: LivenessSession,
  features: FaceFrameFeatures,
): LivenessSession {
  const baseline = session.baselineX ?? 0.5;
  const delta = features.centroidX - baseline;
  // Front camera is mirrored, so accept a turn in either direction.
  const turned = Math.abs(delta) >= HEAD_TURN_DELTA;

  if (session.phase === 'challenge' && turned) {
    return {
      ...session,
      phase: 'return_center',
      instruction: 'Look straight at the camera',
    };
  }
  if (session.phase === 'return_center' && Math.abs(delta) <= CENTER_TOLERANCE) {
    return {
      ...session,
      phase: 'passed',
      instruction: 'Liveness passed',
    };
  }
  return session;
}
