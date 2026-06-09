import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Sparkles, Radio, ToggleLeft, ToggleRight } from 'lucide-react';
import { useGymStore } from '../store/gymStore';

export default function CheckInModal() {
  const { checkInModalOpen, closeCheckInModal, verifyGymLocation, checkInToday, verifying, distance, lastCheckInMessage, atGymOverride, toggleAtGymOverride } = useGymStore();

  return (
    <AnimatePresence>
      {checkInModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
          onClick={closeCheckInModal}
        >
          <motion.div
            initial={{ scale: 0.93, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.93, opacity: 0, y: 16 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className="card-glass w-full max-w-md p-6"
            style={{ boxShadow: '0 30px 90px rgba(0,0,0,0.75)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="label">Gym Verification</p>
                <h2 className="mt-1 text-xl font-black text-white">Check In Today</h2>
              </div>
              <button
                onClick={closeCheckInModal}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-zinc-400 transition-colors hover:bg-white/[0.08] hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {/* Location panel */}
              <div className="rounded-xl border border-white/[0.07] bg-black/20 p-4">
                <div className="flex items-center gap-2 text-glow">
                  <MapPin size={16} />
                  <span className="text-sm font-semibold">Location Status</span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-xs text-zinc-400">Distance to gym</p>
                  <span className="rounded-full bg-glow/10 px-3 py-1 text-sm font-bold text-glow">
                    {distance === null ? 'Calculating…' : `${Math.round(distance)}m`}
                  </span>
                </div>
              </div>

              {/* Demo toggle */}
              <div className="rounded-xl border border-white/[0.07] bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="label">Demo Override</p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      {atGymOverride ? 'At the gym ✓' : 'Away from gym'}
                    </p>
                  </div>
                  <button
                    onClick={toggleAtGymOverride}
                    className="flex items-center gap-1.5 text-xs font-semibold transition-colors"
                    style={{ color: atGymOverride ? '#10B981' : '#71717a' }}
                  >
                    {atGymOverride ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                  </button>
                </div>
              </div>

              {/* Message panel */}
              <div className="rounded-xl border border-white/[0.07] bg-black/20 p-4 text-center">
                <Sparkles size={24} className="mx-auto mb-2 text-glow" />
                <p className="text-sm text-zinc-300">
                  {lastCheckInMessage ?? 'Ready to verify your presence at the gym.'}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={verifyGymLocation}
                className="btn-secondary flex items-center gap-2"
              >
                <Radio size={14} /> Probe Location
              </button>
              <button
                type="button"
                disabled={verifying}
                onClick={checkInToday}
                className="btn-primary"
                style={verifying ? { opacity: 0.7 } : {}}
              >
                {verifying ? 'Verifying…' : 'Check In Now'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
