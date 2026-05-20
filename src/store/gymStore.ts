import { create } from 'zustand';
import { useAuthStore } from './authStore';
import { challenges } from '../data/challenges';
import { getDistanceMeters } from '../utils/geofence';

export type GymState = {
  verifying: boolean;
  distance: number | null;
  atGymOverride: boolean;
  lastCheckInMessage: string | null;
  checkInModalOpen: boolean;
  openCheckInModal: () => void;
  closeCheckInModal: () => void;
  verifyGymLocation: () => Promise<boolean>;
  checkInToday: () => Promise<void>;
  toggleAtGymOverride: () => void;
  assignDailyChallenges: () => void;
  isAtGym: () => Promise<boolean>;
};

const GYM_COORDS = { latitude: 6.5244, longitude: 3.3792 };

export const useGymStore = create<GymState>((set, get) => ({
  verifying: false,
  distance: null,
  atGymOverride: true,
  lastCheckInMessage: null,
  checkInModalOpen: false,
  openCheckInModal: () => set({ checkInModalOpen: true, lastCheckInMessage: null }),
  closeCheckInModal: () => set({ checkInModalOpen: false, verifying: false }),
  toggleAtGymOverride: () => set((state) => ({ atGymOverride: !state.atGymOverride })),
  verifyGymLocation: async () => {
    set({ verifying: true, distance: null, lastCheckInMessage: null });
    if (get().atGymOverride) {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      set({ verifying: false, distance: 120, lastCheckInMessage: 'Location verified via demo override.' });
      return true;
    }
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const distance = getDistanceMeters(
            { latitude: position.coords.latitude, longitude: position.coords.longitude },
            GYM_COORDS
          );
          set({ distance, verifying: false, lastCheckInMessage: `Distance: ${Math.round(distance)}m` });
          resolve(distance <= 500);
        },
        () => {
          set({ verifying: false, lastCheckInMessage: 'Unable to verify location.' });
          resolve(false);
        },
        { timeout: 5000 }
      );
    });
  },
  checkInToday: async () => {
    const auth = useAuthStore.getState();
    const user = auth.getUser();
    if (!user) return;
    const today = new Date().toISOString().slice(0, 10);
    
    // Check if already checked in today
    if (user.lastCheckInDate === today) {
      set({ lastCheckInMessage: 'You\'ve already checked in today. Come back tomorrow!' });
      return;
    }
    
    const ok = await get().verifyGymLocation();
    if (!ok) {
      set({ lastCheckInMessage: 'Check-in failed. Move closer to the gym.' });
      return;
    }
    useAuthStore.getState().addCheckIn(today);
    get().assignDailyChallenges();
    set({ lastCheckInMessage: `Checked in at ${today}. STREAK: ${user.streak + 1} DAYS 🔥` });
  },
  assignDailyChallenges: () => {
    const auth = useAuthStore.getState();
    const user = auth.getUser();
    if (!user) return;
    const today = new Date().toISOString().slice(0, 10);
    const selected = [...challenges].sort(() => Math.random() - 0.5).slice(0, 3);
    const dailyChallenges = selected.map((challenge) => ({ id: challenge.id, completed: false }));
    auth.updateUser({ ...user, dailyChallenges, lastCheckInDate: today });
  },
  isAtGym: async () => {
    const isVerified = await get().verifyGymLocation();
    return isVerified;
  }
}));
