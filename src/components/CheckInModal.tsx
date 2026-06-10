import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Radio, ToggleLeft, ToggleRight } from 'lucide-react';
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
          style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
          onClick={closeCheckInModal}
        >
          <motion.div
            initial={{ scale: 0.93, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.93, opacity: 0, y: 16 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className="card-glass w-full max-w-md p-6"
            style={{ boxShadow: '0 30px 90px rgba(0,0,0,0.85), 0 0 0 1px rgba(212,175,55,0.08)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="label">Commitment Verification</p>
                <h2 className="mt-1.5 text-xl font-black text-white">Prove Your Attendance</h2>
                <p className="mt-1 text-xs" style={{ color: '#4A4A4A' }}>
                  Every visit is evidence. Every proof advances your rank.
                </p>
              </div>
              <button
                onClick={closeCheckInModal}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.07] bg-white/[0.03] text-zinc-600 transition-colors hover:bg-white/[0.07] hover:text-zinc-300"
              >
                <X size={15} />
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {/* Location panel */}
              <div
                className="rounded-xl p-4"
                style={{ background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.12)' }}
              >
                <div className="flex items-center gap-2" style={{ color: '#D4AF37' }}>
                  <MapPin size={15} />
                  <span className="text-sm font-semibold">Location Status</span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-xs" style={{ color: '#4A4A4A' }}>Distance to facility</p>
                  <span
                    className="rounded-full px-3 py-1 text-sm font-bold"
                    style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', color: '#D4AF37' }}
                  >
                    {distance === null ? 'Calculating…' : `${Math.round(distance)}m`}
                  </span>
                </div>
              </div>

              {/* Demo toggle */}
              <div
                className="rounded-xl p-4"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="label">Verification Override</p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      {atGymOverride ? 'Location confirmed ✓' : 'Location unverified'}
                    </p>
                  </div>
                  <button
                    onClick={toggleAtGymOverride}
                    className="flex items-center gap-1.5 text-xs font-semibold transition-colors"
                    style={{ color: atGymOverride ? '#2ECC71' : '#3A3A3A' }}
                  >
                    {atGymOverride ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                  </button>
                </div>
              </div>

              {/* Message panel */}
              {lastCheckInMessage && (
                <div
                  className="rounded-xl p-4 text-center"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <p className="text-sm" style={{ color: '#B3B3B3' }}>{lastCheckInMessage}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={verifyGymLocation}
                className="btn-secondary flex items-center gap-2"
              >
                <Radio size={14} /> Verify Location
              </button>
              <button
                type="button"
                disabled={verifying}
                onClick={checkInToday}
                className="btn-primary"
                style={verifying ? { opacity: 0.7 } : {}}
              >
                {verifying ? 'Verifying…' : 'Mark Commitment'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
