import { create } from 'zustand';
import { supabase, supabaseConfigured } from '../lib/supabaseClient';
import { uploadAvatar, uploadAvatarFromBase64 } from '../lib/uploadAvatar';
import { dummyUsers } from '../data/dummyUsers';
import { challenges } from '../data/challenges';
import { defaultWorkoutPlan, WorkoutType } from '../data/workoutPlans';
import { gyms } from '../data/gyms';
import { getLevelFromXp } from '../utils/xpCalculator';

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
  phone: string;
};

type AppState = {
  users: UserProfile[];
  currentUserId: string | null;
  loading: boolean;
  error: string | null;
  demoMode: boolean;
  init: () => Promise<void>;
  signUp: (profile: Omit<UserProfile, 'id' | 'xp' | 'level' | 'streak' | 'longestStreak' | 'checkIns' | 'challengesCompleted' | 'attendanceHistory' | 'dailyChallenges' | 'freezeTokens' | 'achievements' | 'lastCheckInDate' | 'workoutPlan'> & { gymId: string; workoutPlan?: Record<string, WorkoutType>; avatarFile?: File; phone?: string }) => Promise<{ success: boolean; message?: string; needsConfirmation?: boolean }>;
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

const STORAGE_KEY = 'prime_app_data';

// ── Daily challenge persistence (date-keyed, expires at midnight) ─────────
const dailyKey = (uid: string) => `prime_daily_${uid}`;

function loadDailyChallenges(uid: string): DailyChallengeState[] | null {
  try {
    const raw = localStorage.getItem(dailyKey(uid));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.date !== new Date().toISOString().slice(0, 10)) return null;
    return parsed.challenges as DailyChallengeState[];
  } catch { return null; }
}

function saveDailyChallenges(uid: string, ch: DailyChallengeState[]) {
  try {
    localStorage.setItem(
      dailyKey(uid),
      JSON.stringify({ date: new Date().toISOString().slice(0, 10), challenges: ch })
    );
  } catch {}
}

// Deterministic seeded shuffle — same 3 challenges for all users on the same day
function generateDailySet(dateStr: string): DailyChallengeState[] {
  let seed = 0;
  for (let i = 0; i < dateStr.length; i++) seed = (seed * 31 + dateStr.charCodeAt(i)) | 0;
  const ids = challenges.map((c) => c.id);
  for (let i = ids.length - 1; i > 0; i--) {
    seed = (seed * 1664525 + 1013904223) | 0;
    [ids[i], ids[Math.abs(seed) % (i + 1)]] = [ids[Math.abs(seed) % (i + 1)], ids[i]];
  }
  return ids.slice(0, 3).map((id) => ({ id, completed: false }));
}

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
    name: 'Rasheed',
    email: 'demo@prime.app',
    password: 'demo1234',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=512&q=80',
    rankTitle: 'Monarch',
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
    achievements: ['first-checkin', 'seven-day-streak'],
    lastCheckInDate: new Date().toISOString().slice(0, 10),
    phone: '',
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
      achievements: ['first-checkin'],
      lastCheckInDate: undefined,
      phone: '',
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
  rankTitle: profile.rank_title ?? 'Initiate',
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
  lastCheckInDate: profile.last_checkin_date ?? undefined,
  phone: profile.phone ?? '',
});


export const useAuthStore = create<AppState>((set, get) => ({
  users: [],
  currentUserId: null,
  loading: true,
  error: null,
  demoMode: false,
  init: async () => {
    set({ loading: true });

    // Restore any previously saved session from localStorage
    let savedUserId: string | null = null;
    let savedUserData: UserProfile | null = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        savedUserId = parsed.currentUserId ?? null;
        if (savedUserId && Array.isArray(parsed.users)) {
          savedUserData = parsed.users.find((u: UserProfile) => u.id === savedUserId) ?? null;
        }
      }
    } catch {}

    const baseUsers = seedUsers();
    // Merge: keep saved user data intact, use fresh seeds for everyone else
    const users = savedUserData
      ? [savedUserData, ...baseUsers.filter((u) => u.id !== savedUserData!.id)]
      : baseUsers;

    set({ users, loading: false, currentUserId: savedUserId });

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
            rankTitle: profile.rank_title ?? 'Initiate',
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
            lastCheckInDate: profile.last_checkin_date ?? undefined,
            phone: profile.phone ?? '',
          };

          // Preserve dailyChallenges from existing in-memory state — not stored in Supabase
          const existing = get().users.find((u) => u.id === userId);
          mapped.dailyChallenges = existing?.dailyChallenges ?? [];
          set((s) => ({ users: [mapped, ...s.users.filter((u) => u.id !== mapped.id)], currentUserId: userId }));
        }
      }
    } catch (err) {
      // ignore
    }
  },
  login: async (email, password) => {
    if (email === 'demo@prime.app' && password === 'demo1234') {
      const demoUser = get().users.find((user) => user.id === 'demo-user');
      if (demoUser) {
        set({ currentUserId: demoUser.id, demoMode: true, error: null });
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ users: [demoUser], currentUserId: demoUser.id })); } catch {}
        return true;
      }
      const users = seedUsers();
      const demo = users.find((user) => user.id === 'demo-user');
      if (demo) {
        set({ users, currentUserId: demo.id, demoMode: true, error: null });
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ users: [demo], currentUserId: demo.id })); } catch {}
        return true;
      }
    }

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
          rank_title: 'Initiate',
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
          // fallback
        }
        mapped = {
          id: newProfile.id,
          name: newProfile.name,
          email,
          password: '',
          avatar: newProfile.avatar,
          rankTitle: 'Initiate',
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
          lastCheckInDate: undefined,
          phone: '',
        };
      }

      // Recover avatar that couldn't be saved during email-confirmation signup
      if (!mapped.avatar) {
        try {
          const pendingBase64 = localStorage.getItem(`prime_pending_avatar_${userId}`);
          if (pendingBase64) {
            // Try uploading to Storage now that the user is authenticated
            const uploaded = await uploadAvatarFromBase64(pendingBase64, userId);
            const avatarUrl = uploaded ?? pendingBase64; // fall back to base64 if Storage fails
            mapped.avatar = avatarUrl;
            await supabase.from('profiles').update({ avatar: avatarUrl }).eq('id', userId);
            localStorage.removeItem(`prime_pending_avatar_${userId}`);
          }
        } catch {}
      } else {
        // Avatar already set — clean up any stale pending entry
        try { localStorage.removeItem(`prime_pending_avatar_${userId}`); } catch {}
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
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...parsed, currentUserId: null }));
      }
    } catch {}
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
        achievements: ['first-signup'],
        lastCheckInDate: undefined,
        phone: profile.phone ?? '',
      };
      const users = [...state.users, newUser];
      set({ users, currentUserId: id });
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ users: [newUser], currentUserId: id })); } catch {}
      return { success: true };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: profile.email,
        password: profile.password,
        options: {
          data: {
            display_name: profile.name,
            full_name: profile.name,
            phone: profile.phone ?? '',
          },
        },
      });
      if (error || !data.user) {
        const message = error?.code === 'email_not_confirmed'
          ? 'Signup succeeded, but email confirmation is required before login.'
          : error?.message ?? 'Signup failed';
        set({ error: message });
        return { success: false, message };
      }
      const userId = data.user.id;
      let avatarUrl = profile.avatar;
      if (profile.avatarFile) {
        const uploaded = await uploadAvatar(profile.avatarFile, userId);
        if (uploaded) avatarUrl = uploaded;
      }
      const row = {
        id: userId,
        name: profile.name,
        avatar: avatarUrl,
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
        achievements: ['first-signup'],
        last_checkin_date: null,
        phone: profile.phone ?? '',
      };

      let insertError = null;
      try {
        const { error: profileError } = await supabase.from('profiles').upsert([row], { onConflict: 'id' });
        if (profileError) insertError = profileError;
      } catch (err: any) {
        insertError = err;
      }

      const newUser: UserProfile = {
        id: userId,
        name: profile.name,
        email: profile.email,
        password: '',
        avatar: avatarUrl,
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
        achievements: ['first-signup'],
        lastCheckInDate: undefined,
        phone: profile.phone ?? '',
      };
      set((s) => ({ users: [...s.users, newUser], currentUserId: data.session?.user.id ?? s.currentUserId, error: null }));

      const needsConfirmation = !data.session;
      // If email confirmation is required the user isn't authenticated yet, so the
      // Storage upload and DB upsert above both fail silently due to RLS.
      // Save the base64 avatar locally so login() can recover and re-upload it.
      if (needsConfirmation && profile.avatar) {
        try {
          localStorage.setItem(`prime_pending_avatar_${userId}`, profile.avatar);
        } catch {}
      }
      const message = needsConfirmation
        ? 'Account created. Please confirm your email before logging in.'
        : 'Welcome to Prime. Redirecting to your dashboard.';
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ users, currentUserId: state.currentUserId }));
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
    const nextLevel = getLevelFromXp(nextXp);
    const updated: UserProfile = { ...user, xp: nextXp, level: nextLevel };
    if (nextLevel > user.level) {
      updated.achievements = Array.from(new Set([...updated.achievements, 'level-two']));
    }
    get().updateUser(updated);
  },
  resetStreak: () => {
    const state = get();
    const user = state.users.find((item) => item.id === state.currentUserId);
    if (!user) return;
    const updated = { ...user, streak: 0 };
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
    const newXp = user.xp + xp;
    const dailyChallenges = user.dailyChallenges.map((item) => item.id === challengeId ? { ...item, completed: true } : item);
    const updated: UserProfile = {
      ...user,
      xp: newXp,
      level: getLevelFromXp(newXp),
      challengesCompleted: user.challengesCompleted + 1,
      dailyChallenges,
      achievements: Array.from(new Set([...user.achievements, 'challenge-beast']))
    };
    get().updateUser(updated);
  },
  addCheckIn: (date) => {
    const state = get();
    const user = state.users.find((item) => item.id === state.currentUserId);
    if (!user) return;
    const newHistory = { ...user.attendanceHistory, [date]: true };
    const currentStreak = user.streak + 1;
    const newXp = user.xp + 100;
    // Generate trials on first check-in if none exist (new users or Supabase users)
    const dailyChallenges = user.dailyChallenges.length > 0
      ? user.dailyChallenges
      : challenges.slice(0, 3).map((c) => ({ id: c.id, completed: false }));
    const updated: UserProfile = {
      ...user,
      attendanceHistory: newHistory,
      streak: currentStreak,
      longestStreak: Math.max(user.longestStreak, currentStreak),
      checkIns: user.checkIns + 1,
      xp: newXp,
      level: getLevelFromXp(newXp),
      lastCheckInDate: date,
      dailyChallenges,
      freezeTokens: user.freezeTokens + (currentStreak % 7 === 0 ? 1 : 0),
      achievements: Array.from(new Set([...user.achievements, 'first-checkin']))
    };
    get().updateUser(updated);
  }
}));
