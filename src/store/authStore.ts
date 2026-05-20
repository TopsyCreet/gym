import { create } from 'zustand';
import { dummyUsers } from '../data/dummyUsers';
import { challenges } from '../data/challenges';
import { defaultWorkoutPlan, WorkoutType } from '../data/workoutPlans';

export type AttendanceHistory = Record<string, boolean>;
export type DailyChallengeState = {
  id: number;
  completed: boolean;
  startedAt?: string;
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  password: string;
  avatar: string;
  rankTitle: string;
  schedule: string[];
  workoutPlan: Record<string, WorkoutType>;
  xp: number;
  level: number;
  streak: number;
  longestStreak: number;
  checkIns: number;
  challengesCompleted: number;
  attendanceHistory: AttendanceHistory;
  dailyChallenges: DailyChallengeState[];
  freezeTokens: number;
  lastCheckInDate?: string;
  achievements: string[];
};

type AppState = {
  users: UserProfile[];
  currentUserId: string | null;
  loading: boolean;
  error: string | null;
  demoMode: boolean;
  init: () => void;
  signUp: (profile: Omit<UserProfile, 'id' | 'xp' | 'level' | 'streak' | 'longestStreak' | 'checkIns' | 'challengesCompleted' | 'attendanceHistory' | 'dailyChallenges' | 'freezeTokens' | 'achievements' | 'lastCheckInDate'>) => void;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  updateUser: (user: UserProfile) => void;
  setDemoMode: (enabled: boolean) => void;
  getUser: () => UserProfile | null;
  awardXp: (amount: number) => void;
  resetStreak: () => void;
  startChallenge: (challengeId: number) => void;
  completeChallenge: (challengeId: number, xp: number) => void;
  addCheckIn: (date: string) => void;
};

const STORAGE_KEY = 'irongate_app_data';

const generateAttendance = (days = 30) => {
  const history: AttendanceHistory = {};
  const today = new Date();
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const key = date.toISOString().slice(0, 10);
    history[key] = Math.random() < 0.45;
  }
  return history;
};

const buildDemoUser = (): UserProfile => {
  const history = generateAttendance(30);
  const checkIns = Object.values(history).filter(Boolean).length;
  const streak = 15;
  const xp = 1300;
  return {
    id: 'demo-user',
    name: 'Sung Jinwoo',
    email: 'demo@irongate.app',
    password: 'demo1234',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=512&q=80',
    rankTitle: 'Shadow Monarch',
    schedule: ['Mon', 'Wed', 'Fri', 'Sat'],
    workoutPlan: defaultWorkoutPlan,
    xp,
    level: 4,
    streak,
    longestStreak: streak,
    checkIns,
    challengesCompleted: 28,
    attendanceHistory: history,
    dailyChallenges: challenges.slice(0, 3).map((challenge) => ({ id: challenge.id, completed: false })),
    freezeTokens: 2,
    achievements: ['First Check-in', '7-Day Streak'],
    lastCheckInDate: new Date().toISOString().slice(0, 10)
  };
};

const seedUsers = (): UserProfile[] => {
  const demoData = buildDemoUser();
  const built = [
    demoData,
    ...dummyUsers.map((user, index) => ({
      id: `user-${index}`,
      name: user.name,
      email: user.email,
      password: user.password,
      avatar: '',
      rankTitle: user.rankTitle,
      schedule: user.schedule,
      workoutPlan: defaultWorkoutPlan,
      xp: user.xp,
      level: user.level,
      streak: user.streak,
      longestStreak: user.streak,
      checkIns: user.checkIns,
      challengesCompleted: user.challengesCompleted,
      attendanceHistory: user.history || generateAttendance(30),
      dailyChallenges: challenges.slice(0, 3).map((challenge) => ({ id: challenge.id, completed: false })),
      freezeTokens: Math.max(0, Math.floor(user.streak / 7)),
      achievements: ['Demo Warrior'],
      lastCheckInDate: undefined
    }))
  ];
  return built;
};

export const useAuthStore = create<AppState>((set, get) => ({
  users: [],
  currentUserId: null,
  loading: true,
  error: null,
  demoMode: false,
  init: () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { users: UserProfile[]; currentUserId: string | null };
      const normalizedUsers = parsed.users.map((user) => ({
        ...user,
        workoutPlan: user.workoutPlan ?? defaultWorkoutPlan
      }));
      set({ users: normalizedUsers, currentUserId: parsed.currentUserId, loading: false });
      return;
    }
    const users = seedUsers();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ users, currentUserId: null }));
    set({ users, currentUserId: null, loading: false });
  },
  login: (email, password) => {
    const state = get();
    const found = state.users.find((user) => user.email === email && user.password === password);
    if (!found) {
      set({ error: 'Credentials not found' });
      return false;
    }
    set({ currentUserId: found.id, error: null });
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ users: state.users, currentUserId: found.id }));
    return true;
  },
  logout: () => {
    const state = get();
    set({ currentUserId: null });
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ users: state.users, currentUserId: null }));
  },
  signUp: (profile) => {
    const state = get();
    const id = `user-${Date.now()}`;
    const newUser: UserProfile = {
      id,
      xp: 0,
      level: 1,
      streak: 0,
      longestStreak: 0,
      checkIns: 0,
      challengesCompleted: 0,
      attendanceHistory: {},
      dailyChallenges: [],
      freezeTokens: 0,
      achievements: ['First Signup'],
      lastCheckInDate: undefined,
      workoutPlan: defaultWorkoutPlan,
      ...profile
    };
    const users = [...state.users, newUser];
    set({ users, currentUserId: id });
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ users, currentUserId: id }));
  },
  updateUser: (user) => {
    const state = get();
    const users = state.users.map((item) => (item.id === user.id ? user : item));
    set({ users });
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ users, currentUserId: state.currentUserId }));
  },
  setDemoMode: (enabled) => set({ demoMode: enabled }),
  getUser: () => {
    const state = get();
    return state.users.find((user) => user.id === state.currentUserId) ?? null;
  },
  awardXp: (amount) => {
    const state = get();
    const user = state.users.find((item) => item.id === state.currentUserId);
    if (!user) return;
    const nextXp = user.xp + amount;
    const nextLevel = user.level + (nextXp >= 300 + (user.level - 1) * 400 ? 1 : 0);
    const updated = { ...user, xp: nextXp, level: nextLevel };
    if (nextLevel > user.level) {
      updated.achievements = Array.from(new Set([...updated.achievements, 'Level Up']));
    }
    const users = state.users.map((item) => (item.id === updated.id ? updated : item));
    set({ users });
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ users, currentUserId: state.currentUserId }));
  },
  resetStreak: () => {
    const state = get();
    const user = state.users.find((item) => item.id === state.currentUserId);
    if (!user) return;
    const updated = { ...user, streak: 0, achievements: Array.from(new Set([...user.achievements, 'Streak Reset'])) };
    const users = state.users.map((item) => (item.id === updated.id ? updated : item));
    set({ users });
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ users, currentUserId: state.currentUserId }));
  },
  startChallenge: (challengeId) => {
    const state = get();
    const user = state.users.find((item) => item.id === state.currentUserId);
    if (!user) return;
    const existing = user.dailyChallenges.find((item) => item.id === challengeId);
    if (!existing || existing.completed || existing.startedAt) return;
    const dailyChallenges = user.dailyChallenges.map((item) => 
      item.id === challengeId ? { ...item, startedAt: new Date().toISOString() } : item
    );
    const updated = { ...user, dailyChallenges };
    const users = state.users.map((item) => (item.id === updated.id ? updated : item));
    set({ users });
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ users, currentUserId: state.currentUserId }));
  },
  completeChallenge: (challengeId, xp) => {
    const state = get();
    const user = state.users.find((item) => item.id === state.currentUserId);
    if (!user) return;
    const existing = user.dailyChallenges.find((item) => item.id === challengeId);
    if (existing?.completed) return;
    const dailyChallenges = user.dailyChallenges.map((item) => item.id === challengeId ? { ...item, completed: true } : item);
    const updated = {
      ...user,
      xp: user.xp + xp,
      challengesCompleted: user.challengesCompleted + 1,
      dailyChallenges,
      achievements: Array.from(new Set([...user.achievements, 'Challenge Beast']))
    };
    const users = state.users.map((item) => (item.id === updated.id ? updated : item));
    set({ users });
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ users, currentUserId: state.currentUserId }));
  },
  addCheckIn: (date) => {
    const state = get();
    const user = state.users.find((item) => item.id === state.currentUserId);
    if (!user) return;
    const newHistory = { ...user.attendanceHistory, [date]: true };
    const currentStreak = user.streak + 1;
    const updated = {
      ...user,
      attendanceHistory: newHistory,
      streak: currentStreak,
      longestStreak: Math.max(user.longestStreak, currentStreak),
      checkIns: user.checkIns + 1,
      xp: user.xp + 100,
      lastCheckInDate: date,
      freezeTokens: user.freezeTokens + (currentStreak % 7 === 0 ? 1 : 0),
      achievements: Array.from(new Set([...user.achievements, 'First Check-in']))
    };
    const users = state.users.map((item) => (item.id === updated.id ? updated : item));
    set({ users });
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ users, currentUserId: state.currentUserId }));
  }
}));
