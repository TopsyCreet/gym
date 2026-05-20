import { motion } from 'framer-motion';
import { X, MapPin, Sparkles } from 'lucide-react';
import { useGymStore } from '../store/gymStore';

export default function CheckInModal() {
  const { checkInModalOpen, closeCheckInModal, verifyGymLocation, checkInToday, verifying, distance, lastCheckInMessage, atGymOverride, toggleAtGymOverride } = useGymStore();
  if (!checkInModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-lg rounded-3xl border border-white/10 bg-surface2 p-6 shadow-soft"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">Gym Verification</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Verifying you&apos;re at the gym...</h2>
          </div>
          <button onClick={closeCheckInModal} className="rounded-full bg-white/5 p-2 text-zinc-300 hover:bg-white/10">
            <X size={20} />
          </button>
        </div>
        <div className="mt-6 grid gap-5">
          <div className="rounded-3xl border border-white/10 bg-[#081225] p-5">
            <div className="flex items-center gap-3 text-glow">
              <MapPin size={18} />
              <span className="font-semibold">Location check</span>
            </div>
            <p className="mt-3 text-sm text-zinc-300">Simulated distance to gym and admin override are both visible for investor demo.</p>
            <p className="mt-4 text-lg text-white">Distance: {distance === null ? 'calculating…' : `${Math.round(distance)}m`}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-surface p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">Demo Control</p>
                <p className="mt-2 text-white">{atGymOverride ? 'User is at gym' : 'User is away'}</p>
              </div>
              <button onClick={toggleAtGymOverride} className="btn-secondary">
                Toggle Mode
              </button>
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-surface p-5 text-center">
            <Sparkles className="mx-auto mb-3 text-glow" size={32} />
            <p className="text-sm text-zinc-400">When successful, a celebration burst appears and XP is awarded.</p>
            <p className="mt-3 text-white">{lastCheckInMessage ?? 'Awaiting check-in...'}</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3 sm:justify-end">
          <button
            type="button"
            disabled={verifying}
            onClick={checkInToday}
            className="btn-primary min-w-[10rem]"
          >
            {verifying ? 'Verifying…' : 'Check In Today'}
          </button>
          <button
            type="button"
            onClick={verifyGymLocation}
            className="btn-secondary min-w-[10rem]"
          >
            Probe Location
          </button>
        </div>
      </motion.div>
    </div>
  );
}
