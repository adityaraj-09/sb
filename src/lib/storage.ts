import AsyncStorage from '@react-native-async-storage/async-storage';

import type { AttendanceRecord, Session, Staff, User } from '../types';
import { createId, normalizeEmployeeId } from './ids';

const KEYS = {
  users: 'attendance.users',
  staff: 'attendance.staff',
  records: 'attendance.records',
  session: 'attendance.session',
  seeded: 'attendance.seeded',
};

export const DEMO = {
  admin: { username: 'admin', password: 'admin123' },
  staff: { username: 'EMP001', password: 'staff123', name: 'Asha Kumar' },
  defaultStaffPassword: 'staff123',
};

async function readJson<T>(key: string, fallback: T): Promise<T> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) {
    return fallback;
  }
  return JSON.parse(raw) as T;
}

async function writeJson(key: string, value: unknown): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function seedIfNeeded(): Promise<void> {
  const seeded = await AsyncStorage.getItem(KEYS.seeded);
  if (seeded === '1') {
    return;
  }

  const staffId = 'staff_demo_asha';
  const staff: Staff[] = [
    {
      id: staffId,
      name: DEMO.staff.name,
      employeeId: DEMO.staff.username,
    },
  ];
  const users: User[] = [
    {
      id: 'user_admin',
      username: DEMO.admin.username,
      password: DEMO.admin.password,
      role: 'admin',
    },
    {
      id: 'user_staff_asha',
      username: DEMO.staff.username,
      password: DEMO.staff.password,
      role: 'staff',
      staffId,
    },
  ];

  await writeJson(KEYS.users, users);
  await writeJson(KEYS.staff, staff);
  await writeJson(KEYS.records, []);
  await AsyncStorage.setItem(KEYS.seeded, '1');
}

export async function getUsers(): Promise<User[]> {
  return readJson<User[]>(KEYS.users, []);
}

export async function getStaff(): Promise<Staff[]> {
  return readJson<Staff[]>(KEYS.staff, []);
}

export async function getRecords(): Promise<AttendanceRecord[]> {
  return readJson<AttendanceRecord[]>(KEYS.records, []);
}

export async function getSession(): Promise<Session | null> {
  return readJson<Session | null>(KEYS.session, null);
}

export async function saveSession(session: Session | null): Promise<void> {
  if (!session) {
    await AsyncStorage.removeItem(KEYS.session);
    return;
  }
  await writeJson(KEYS.session, session);
}

export async function login(username: string, password: string): Promise<Session> {
  if (!username.trim() || !password) {
    throw new Error('Enter a username and password');
  }
  const users = await getUsers();
  const match = users.find(
    (user) =>
      user.username.toLowerCase() === username.trim().toLowerCase() &&
      user.password === password,
  );
  if (!match) {
    throw new Error('Invalid username or password');
  }
  const session: Session = {
    userId: match.id,
    role: match.role,
    staffId: match.staffId,
  };
  await saveSession(session);
  return session;
}

export async function addStaff(name: string, employeeId: string): Promise<{
  staff: Staff;
  username: string;
  password: string;
}> {
  const trimmedName = name.trim();
  const normalizedId = normalizeEmployeeId(employeeId);
  if (!trimmedName) {
    throw new Error('Name is required');
  }
  if (!normalizedId) {
    throw new Error('Employee ID is required');
  }

  const staffList = await getStaff();
  const users = await getUsers();
  if (staffList.some((item) => item.employeeId === normalizedId)) {
    throw new Error('Employee ID already exists');
  }
  if (users.some((user) => user.username.toLowerCase() === normalizedId.toLowerCase())) {
    throw new Error('That username is already taken');
  }

  const staff: Staff = {
    id: createId('staff'),
    name: trimmedName,
    employeeId: normalizedId,
  };
  const user: User = {
    id: createId('user'),
    username: normalizedId,
    password: DEMO.defaultStaffPassword,
    role: 'staff',
    staffId: staff.id,
  };

  await writeJson(KEYS.staff, [staff, ...staffList]);
  await writeJson(KEYS.users, [...users, user]);
  return {
    staff,
    username: user.username,
    password: user.password,
  };
}

export async function saveStaffFace(
  staffId: string,
  enrolledFaceUri: string,
  faceEmbedding: number[],
): Promise<Staff> {
  const staffList = await getStaff();
  const index = staffList.findIndex((item) => item.id === staffId);
  if (index < 0) {
    throw new Error('Staff member not found');
  }
  const updated: Staff = {
    ...staffList[index],
    enrolledFaceUri,
    faceEmbedding,
    enrolledAt: new Date().toISOString(),
  };
  staffList[index] = updated;
  await writeJson(KEYS.staff, staffList);
  return updated;
}

export async function addAttendance(record: AttendanceRecord): Promise<AttendanceRecord> {
  const records = await getRecords();
  await writeJson(KEYS.records, [record, ...records]);
  return record;
}

export async function resetAllData(): Promise<void> {
  await AsyncStorage.multiRemove(Object.values(KEYS));
  await seedIfNeeded();
}
