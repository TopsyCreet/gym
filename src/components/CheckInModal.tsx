import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Radio, ToggleLeft, ToggleRight, CheckCircle } from 'lucide-react';
import { useGymStore } from '../store/gymStore';
import { useAuthStore } from '../store/authStore';

type Stage = 'ready' | 'verify' | 'confirmed';

export default function CheckInModal() {
  const { checkInModalOpen, closeCheckInModal, verifyGymLocation, checkInToday, verifying, distance, lastCheckInMessage, atGymOverride, toggleAtGymOverride } = useGymStore();
  const user = useAuthStore((state) => state.getUser());
  const [stage, setStage] = useState<Stage>('ready');

  const handleBegin = () => setStage('verify');

  const handleCheckIn = async () => {
    await checkInToday();
    setStage('confirmed');
  };

  const handleClose = () => {
    closeCheckInModal();
    setTimeout(() => setStage('ready'), 300);
  };

  const streak = user?.streak ?? 0;

  return (
    <AnimatePresence>
      {checkInModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] flex items-end justify-center px-4 pb-24 sm:items-center sm:pb-0"
          style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(16px)' }}
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 16 }}
            transition={{ type: 'spring', stiffness: 340, damping: 26 }}
            className="card-glass w-full max-w-sm overflow-hidden"
            style={{ boxShadow: '0 40px 100px rgba(0,0,0,0.9), 0 0 0 1px rgba(212,175,55,0.08)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <AnimatePresence mode="wait">

              {/* ── Stage 1: Ready ── */}
              {stage === 'ready' && (
                <motion.div
                  key="ready"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.22 }}
                  className="p-7"
                >
                  {/* Close */}
                  <div className="flex justify-end mb-2">
                    <button
                      onClick={handleClose}
                      className="flex h-7 w-7 items-center justify-center rounded-full"
                      style={{ background: 'rgba(255,255,255,0.04)', color: '#4A4A4A' }}
                    >
                      <X size={13} />
                    </button>
                  </div>

                  {/* Mark */}
                  <div className="flex flex-col items-center text-center">
                    <motion.div
                      animate={{ scale: [1, 1.06, 1] }}
                      transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                      className="flex h-20 w-20 items-center justify-center rounded-[1.375rem]"
                      style={{
                        background: 'rgba(212,175,55,0.07)',
                        border: '1px solid rgba(212,175,55,0.18)',
                        boxShadow: '0 0 40px rgba(212,175,55,0.18)',
                      }}
                    >
                      <span className="text-4xl font-black" style={{ color: '#D4AF37' }}>▲</span>
                    </motion.div>

                    <h2 className="mt-5 text-2xl font-black text-white">You're here.</h2>
                    <p className="mt-2 text-sm leading-relaxed" style={{ color: '#6B6B6B' }}>
                      Prove your presence. Every commitment builds the record that defines you.
                    </p>

                    {streak > 0 && (
                      <div
                        className="mt-5 rounded-2xl px-5 py-3 text-center"
                        style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.12)' }}
                      >
                        <p className="text-2xl font-black tabular-nums" style={{ color: '#D4AF37' }}>{streak}</p>
                        <p className="label mt-0.5 tracking-[0.2em]">Day Streak Active</p>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleBegin}
                      className="btn-primary mt-7 w-full"
                    >
                      Record My Presence
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── Stage 2: Verify ── */}
              {stage === 'verify' && (
                <motion.div
                  key="verify"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.22 }}
                  className="p-7"
                >
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <div>
                      <p className="label tracking-[0.22em]">Verification</p>
                      <h2 className="mt-1 text-lg font-black text-white">Confirm Your Location</h2>
                    </div>
                    <button
                      onClick={handleClose}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                      style={{ background: 'rgba(255,255,255,0.04)', color: '#4A4A4A' }}
                    >
                      <X size={13} />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {/* Distance */}
                    <div
                      className="flex items-center justify-between rounded-2xl px-4 py-3.5"
                      style={{ background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.1)' }}
                    >
                      <div className="flex items-center gap-2.5">
                        <MapPin size={14} style={{ color: '#D4AF37' }} />
                        <p className="text-sm font-semibold text-white">Distance to facility</p>
                      </div>
                      <span
                        className="rounded-full px-3 py-1 text-xs font-bold tabular-nums"
                        style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', color: '#D4AF37' }}
                      >
                        {distance === null ? '—' : `${Math.round(distance)}m`}
                      </span>
                    </div>

                    {/* Override */}
                    <div
                      className="flex items-center justify-between rounded-2xl px-4 py-3.5"
                      style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      <div>
                        <p className="label tracking-[0.18em]">Manual Override</p>
                        <p className="mt-1 text-sm font-semibold" style={{ color: atGymOverride ? '#2ECC71' : '#6B6B6B' }}>
                          {atGymOverride ? 'Location confirmed' : 'Not confirmed'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={toggleAtGymOverride}
                        style={{ color: atGymOverride ? '#2ECC71' : '#3A3A3A' }}
                      >
                        {atGymOverride ? <ToggleRight size={30} /> : <ToggleLeft size={30} />}
                      </button>
                    </div>

                    {lastCheckInMessage && (
                      <p
                        className="rounded-xl px-4 py-3 text-xs"
                        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', color: '#A1A1AA' }}
                      >
                        {lastCheckInMessage}
                      </p>
                    )}
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={verifyGymLocation}
                      className="btn-secondary text-xs"
                    >
                      <Radio size={12} />
                      Verify GPS
                    </button>
                    <button
                      type="button"
                      disabled={verifying}
                      onClick={handleCheckIn}
                      className="btn-primary text-xs"
                      style={verifying ? { opacity: 0.7 } : {}}
                    >
                      {verifying ? 'Verifying…' : 'Commit'}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── Stage 3: Confirmed ── */}
              {stage === 'confirmed' && (
                <motion.div
                  key="confirmed"
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="p-7"
                >
                  <div className="flex flex-col items-center text-center py-2">
                    {/* Success ring animation */}
                    <div className="relative mb-6 flex h-20 w-20 items-center justify-center">
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        initial={{ scale: 1, opacity: 0.7 }}
                        animate={{ scale: 1.7, opacity: 0 }}
                        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.1 }}
                        style={{ background: 'rgba(46,204,113,0.18)' }}
                      />
                      <motion.div
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 18, delay: 0.08 }}
                        className="flex h-20 w-20 items-center justify-center rounded-[1.375rem]"
                        style={{
                          background: 'rgba(46,204,113,0.1)',
                          border: '1px solid rgba(46,204,113,0.25)',
                          boxShadow: '0 0 40px rgba(46,204,113,0.2)',
                        }}
                      >
                        <CheckCircle size={34} style={{ color: '#2ECC71' }} />
                      </motion.div>
                    </div>

                    <motion.h2
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-2xl font-black text-white"
                    >
                      Commitment Recorded.
                    </motion.h2>

                    <motion.p
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="mt-2 text-3xl font-black tabular-nums"
                      style={{ color: '#D4AF37' }}
                    >
                      Day {(user?.streak ?? 0)}
                    </motion.p>

                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.42 }}
                      className="mt-3 text-sm italic"
                      style={{ color: '#4A4A4A' }}
                    >
                      "Every day you return, you become harder to defeat."
                    </motion.p>

                    <motion.button
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      type="button"
                      onClick={handleClose}
                      className="btn-secondary mt-7 w-full"
                    >
                      Continue
                    </motion.button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
