import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  addStaff,
  DEMO,
  getStaff,
  getUsers,
  login,
  resetAllData,
  saveStaffFace,
  seedIfNeeded,
} from '../src/lib/storage';

jest.mock('@react-native-async-storage/async-storage', () => {
  let store: Record<string, string> = {};
  return {
    setItem: jest.fn(async (key: string, value: string) => {
      store[key] = value;
    }),
    getItem: jest.fn(async (key: string) => store[key] ?? null),
    removeItem: jest.fn(async (key: string) => {
      delete store[key];
    }),
    multiRemove: jest.fn(async (keys: string[]) => {
      keys.forEach((key) => {
        delete store[key];
      });
    }),
    clear: jest.fn(async () => {
      store = {};
    }),
  };
});

describe('local storage', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('seeds demo admin and staff', async () => {
    await seedIfNeeded();
    const users = await getUsers();
    const staff = await getStaff();
    expect(users.map((user) => user.username)).toEqual(['admin', 'EMP001']);
    expect(staff[0]?.name).toBe(DEMO.staff.name);
  });

  it('logs in dummy accounts and rejects bad passwords', async () => {
    await seedIfNeeded();
    const admin = await login('admin', 'admin123');
    expect(admin.role).toBe('admin');
    await expect(login('admin', 'nope')).rejects.toThrow('Invalid username or password');
  });

  it('adds unique staff and stores an enrolled face locally', async () => {
    await seedIfNeeded();
    const created = await addStaff('Priya Shah', 'emp014');
    expect(created.username).toBe('EMP014');
    expect(created.password).toBe('staff123');
    await expect(addStaff('Other', 'EMP014')).rejects.toThrow('Employee ID already exists');

    const enrolled = await saveStaffFace(created.staff.id, 'file://faces/EMP014.jpg', [0.1, 0.2]);
    expect(enrolled.faceEmbedding).toEqual([0.1, 0.2]);
    const staffLogin = await login('EMP014', 'staff123');
    expect(staffLogin.role).toBe('staff');
    expect(staffLogin.staffId).toBe(created.staff.id);
  });

  it('resets back to the seeded demo', async () => {
    await seedIfNeeded();
    await addStaff('Temp', 'EMP999');
    await resetAllData();
    const staff = await getStaff();
    expect(staff).toHaveLength(1);
    expect(staff[0]?.employeeId).toBe('EMP001');
  });
});
