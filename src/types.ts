export type Role = 'admin' | 'staff';

export type Challenge = 'blink' | 'turn_left' | 'turn_right';

export type User = {
  id: string;
  username: string;
  password: string;
  role: Role;
  staffId?: string;
};

export type Staff = {
  id: string;
  name: string;
  employeeId: string;
  enrolledFaceUri?: string;
  faceEmbedding?: number[];
  enrolledAt?: string;
};

export type AttendanceRecord = {
  id: string;
  staffId: string;
  timestamp: string;
  selfieUri: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  livenessPassed: boolean;
  livenessChallenge: Challenge;
};

export type Session = {
  userId: string;
  role: Role;
  staffId?: string;
};

export type FaceFrameFeatures = {
  skinRatio: number;
  variance: number;
  centroidX: number;
  centroidY: number;
  eyeBrightness: number;
  sharpness: number;
};

export type LivenessPhase =
  | 'seek_face'
  | 'challenge'
  | 'return_center'
  | 'passed'
  | 'failed';

export type LivenessSession = {
  phase: LivenessPhase;
  challenge: Challenge;
  instruction: string;
  startedAt: number;
  baselineX: number | null;
  baselineEyeBrightness: number | null;
  sawClosedEyes: boolean;
  sawOpenEyesAfter: boolean;
};
