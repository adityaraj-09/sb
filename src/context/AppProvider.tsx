import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { AttendanceRecord, Session, Staff, User } from '../types';
import {
  addAttendance as persistAttendance,
  addStaff as persistStaff,
  getRecords,
  getSession,
  getStaff,
  getUsers,
  login as persistLogin,
  resetAllData,
  saveSession,
  saveStaffFace,
  seedIfNeeded,
} from '../lib/storage';

type AppContextValue = {
  ready: boolean;
  session: Session | null;
  users: User[];
  staff: Staff[];
  records: AttendanceRecord[];
  currentStaff: Staff | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  addStaff: (name: string, employeeId: string) => Promise<{
    username: string;
    password: string;
  }>;
  enrolFace: (staffId: string, uri: string, embedding: number[]) => Promise<void>;
  markAttendance: (record: AttendanceRecord) => Promise<void>;
  resetDemo: () => Promise<void>;
  reload: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);

  const reload = async () => {
    await seedIfNeeded();
    const [nextUsers, nextStaff, nextRecords, nextSession] = await Promise.all([
      getUsers(),
      getStaff(),
      getRecords(),
      getSession(),
    ]);
    setUsers(nextUsers);
    setStaff(nextStaff);
    setRecords(nextRecords);
    setSession(nextSession);
  };

  useEffect(() => {
    reload()
      .catch((error) => {
        console.warn('Failed to load local data', error);
      })
      .finally(() => setReady(true));
  }, []);

  const value = useMemo<AppContextValue>(() => {
    const currentStaff =
      session?.staffId != null ? staff.find((item) => item.id === session.staffId) ?? null : null;

    return {
      ready,
      session,
      users,
      staff,
      records,
      currentStaff,
      login: async (username, password) => {
        const next = await persistLogin(username, password);
        setSession(next);
      },
      logout: async () => {
        await saveSession(null);
        setSession(null);
      },
      addStaff: async (name, employeeId) => {
        const created = await persistStaff(name, employeeId);
        await reload();
        return { username: created.username, password: created.password };
      },
      enrolFace: async (staffId, uri, embedding) => {
        await saveStaffFace(staffId, uri, embedding);
        await reload();
      },
      markAttendance: async (record) => {
        await persistAttendance(record);
        await reload();
      },
      resetDemo: async () => {
        await resetAllData();
        setSession(null);
        await reload();
      },
      reload,
    };
  }, [ready, records, session, staff, users]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const value = useContext(AppContext);
  if (!value) {
    throw new Error('useApp must be used inside AppProvider');
  }
  return value;
}
