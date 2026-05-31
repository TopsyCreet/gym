import { create } from 'zustand';
import { supabase, supabaseConfigured } from '../lib/supabaseClient';
import { dummyUsers } from '../data/dummyUsers';
import { challenges } from '../data/challenges';
import { defaultWorkoutPlan, WorkoutType } from '../data/workoutPlans';
import { gyms } from '../data/gyms';

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
  gymId: string;
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
  init: () => Promise<void>;
  signUp: (profile: Omit<UserProfile, 'id' | 'xp' | 'level' | 'streak' | 'longestStreak' | 'checkIns' | 'challengesCompleted' | 'attendanceHistory' | 'dailyChallenges' | 'freezeTokens' | 'achievements' | 'lastCheckInDate' | 'workoutPlan'> & { gymId: string; workoutPlan?: Record<string, WorkoutType> }) => Promise<{ success: boolean; message?: string; needsConfirmation?: boolean }>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
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
    gymId: gyms[0].id,
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
      gymId: gyms[index % gyms.length].id,
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

const mapProfileToUser = (profile: any, email: string): UserProfile => ({
  id: profile.id,
  name: profile.name ?? '',
  email,
  password: '',
  avatar: profile.avatar ?? '',
  rankTitle: profile.rank_title ?? 'Novice',
  schedule: profile.schedule ?? [],
  workoutPlan: profile.workout_plan ?? defaultWorkoutPlan,
  gymId: profile.gym_id ?? gyms[0].id,
  xp: profile.xp ?? 0,
  level: profile.level ?? 1,
  streak: profile.streak ?? 0,
  longestStreak: profile.longest_streak ?? 0,
  checkIns: profile.check_ins ?? 0,
  challengesCompleted: profile.challenges_completed ?? 0,
  attendanceHistory: profile.attendance_history ?? {},
  dailyChallenges: [],
  freezeTokens: 0,
  achievements: profile.achievements ?? [],
  lastCheckInDate: profile.last_checkin_date ?? undefined
});

const buildFallbackSupabaseUser = (user: { id: string; email: string | null }, gymId: string): UserProfile => ({
  id: user.id,
  name: '',
  email: user.email ?? '',
  password: '',
  avatar: '',
  rankTitle: 'Novice',
  schedule: [],
  workoutPlan: defaultWorkoutPlan,
  gymId,
  xp: 0,
  level: 1,
  streak: 0,
  longestStreak: 0,
  checkIns: 0,
  challengesCompleted: 0,
  attendanceHistory: {},
  dailyChallenges: [],
  freezeTokens: 0,
  achievements: [],
  lastCheckInDate: undefined
});

export const useAuthStore = create<AppState>((set, get) => ({
  users: [],
  currentUserId: null,
  loading: true,
  error: null,
  demoMode: false,
  init: async () => {
    set({ loading: true });
    // seed local demo users for leaderboards
    const users = seedUsers();
    set({ users, loading: false });

    if (!supabaseConfigured || !supabase) {
      return;
    }

    try {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (session?.user) {
        const userId = session.user.id;
        const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
        if (!error && profile) {
          const mapped: UserProfile = {
            id: profile.id,
            name: profile.name ?? '',
            email: session.user.email ?? '',
            password: '',
            avatar: profile.avatar ?? '',
            rankTitle: profile.rank_title ?? 'Novice',
            schedule: profile.schedule ?? [],
            workoutPlan: profile.workout_plan ?? defaultWorkoutPlan,
            gymId: profile.gym_id ?? gyms[0].id,
            xp: profile.xp ?? 0,
            level: profile.level ?? 1,
            streak: profile.streak ?? 0,
            longestStreak: profile.longest_streak ?? 0,
            checkIns: profile.check_ins ?? 0,
            challengesCompleted: profile.challenges_completed ?? 0,
            attendanceHistory: profile.attendance_history ?? {},
            dailyChallenges: [],
            freezeTokens: 0,
            achievements: profile.achievements ?? [],
            lastCheckInDate: profile.last_checkin_date ?? undefined
          };

          set((s) => ({ users: [mapped, ...s.users.filter((u) => u.id !== mapped.id)], currentUserId: userId }));
        }
      }
    } catch (err) {
      // ignore for now
    }
  },
  login: async (email, password) => {
    try {
      if (!supabaseConfigured || !supabase) {
        set({ error: 'No Supabase backend configured' });
        return false;
      }
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        const message = error.code === 'email_not_confirmed' || error.message.toLowerCase().includes('confirm')
          ? 'Please confirm your email address before logging in.'
          : error.message;
        set({ error: message });
        return false;
      }
      if (!data.session?.user) {
        set({ error: 'Login failed' });
        return false;
      }

      const userId = data.session.user.id;
      let profile: any = null;
      try {
        const { data: profileData, error: profileError } = await supabase.from('profiles').select('*').eq('id', userId).single();
        if (!profileError) profile = profileData;
      } catch {
        profile = null;
      }

      let mapped: UserProfile;
      if (profile) {
        mapped = mapProfileToUser(profile, data.session.user.email ?? email);
      } else {
        const newProfile = {
          id: userId,
          name: '',
          avatar: '',
          rank_title: 'Novice',
          schedule: [],
          workout_plan: defaultWorkoutPlan,
          gym_id: gyms[0].id,
          xp: 0,
          level: 1,
          streak: 0,
          longest_streak: 0,
          check_ins: 0,
          challenges_completed: 0,
          attendance_history: {},
          achievements: [],
          last_checkin_date: null
        };
        try {
          await supabase.from('profiles').insert([newProfile]);
        } catch {
          // fallback if the table is not present or insert fails
        }
        mapped = {
          id: newProfile.id,
          name: newProfile.name,
          email,
          password: '',
          avatar: newProfile.avatar,
          rankTitle: 'Novice',
          schedule: [],
          workoutPlan: defaultWorkoutPlan,
          gymId: newProfile.gym_id,
          xp: 0,
          level: 1,
          streak: 0,
          longestStreak: 0,
          checkIns: 0,
          challengesCompleted: 0,
          attendanceHistory: {},
          dailyChallenges: [],
          freezeTokens: 0,
          achievements: [],
          lastCheckInDate: undefined
        };
      }

      set((s) => ({ users: [mapped, ...s.users.filter((u) => u.id !== mapped.id)], currentUserId: userId, error: null }));
      return true;
    } catch (err: any) {
      set({ error: String(err) });
      return false;
    }
  },
  logout: async () => {
    if (supabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    set({ currentUserId: null });
  },
  signUp: async (profile) => {
    if (!supabaseConfigured || !supabase) {
      const state = get();
      const id = `user-${Date.now()}`;
      const newUser: UserProfile = {
        id,
        name: profile.name,
        email: profile.email,
        password: profile.password,
        avatar: profile.avatar,
        rankTitle: profile.rankTitle,
        schedule: profile.schedule,
        workoutPlan: profile.workoutPlan ?? defaultWorkoutPlan,
        gymId: profile.gymId,
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
        lastCheckInDate: undefined
      };
      const users = [...state.users, newUser];
      set({ users, currentUserId: id });
      return { success: true };
    }

    try {
      const { data, error } = await supabase.auth.signUp({ email: profile.email, password: profile.password });
      if (error || !data.user) {
        const message = error?.code === 'email_not_confirmed'
          ? 'Signup succeeded, but email confirmation is required before login.'
          : error?.message ?? 'Signup failed';
        set({ error: message });
        return { success: false, message };
      }
      const userId = data.user.id;
      const row = {
        id: userId,
        name: profile.name,
        avatar: profile.avatar,
        rank_title: profile.rankTitle,
        schedule: profile.schedule,
        workout_plan: profile.workoutPlan ?? defaultWorkoutPlan,
        gym_id: profile.gymId,
        xp: 0,
        level: 1,
        streak: 0,
        longest_streak: 0,
        check_ins: 0,
        challenges_completed: 0,
        attendance_history: {},
        achievements: ['First Signup'],
        last_checkin_date: null
      };

      let insertError = null;
      try {
        const { error: profileError } = await supabase.from('profiles').insert([row]);
        if (profileError) insertError = profileError;
      } catch (err: any) {
        insertError = err;
      }

      const newUser: UserProfile = {
        id: userId,
        name: profile.name,
        email: profile.email,
        password: '',
        avatar: profile.avatar,
        rankTitle: profile.rankTitle,
        schedule: profile.schedule,
        workoutPlan: profile.workoutPlan ?? defaultWorkoutPlan,
        gymId: profile.gymId,
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
        lastCheckInDate: undefined
      };
      set((s) => ({ users: [...s.users, newUser], currentUserId: data.session?.user.id ?? s.currentUserId, error: null }));

      const needsConfirmation = !data.session;
      const message = needsConfirmation
        ? 'Signup complete. Please confirm your email before logging in.'
        : 'Signup complete. Redirecting to dashboard.';
      if (insertError) {
        console.warn('Supabase profile insert failed:', insertError);
      }
      return { success: true, needsConfirmation, message };
    } catch (err: any) {
      const message = String(err);
      set({ error: message });
      return { success: false, message };
    }
  },
  updateUser: (user) => {
    const state = get();
    const users = state.users.map((item) => (item.id === user.id ? user : item));
    set({ users });
    if (!supabaseConfigured || !supabase) {
      return;
    }
    (async () => {
      try {
        await supabase.from('profiles').upsert({
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          rank_title: user.rankTitle,
          schedule: user.schedule,
          workout_plan: user.workoutPlan,
          gym_id: user.gymId,
          xp: user.xp,
          level: user.level,
          streak: user.streak,
          longest_streak: user.longestStreak,
          check_ins: user.checkIns,
          challenges_completed: user.challengesCompleted,
          attendance_history: user.attendanceHistory,
          achievements: user.achievements,
          last_checkin_date: user.lastCheckInDate ?? null
        });
      } catch (e) {
        // ignore
      }
    })();
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
