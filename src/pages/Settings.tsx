/**
 * BACKEND GAP: gym transfer requests require a `gym_transfer_requests` table
 * in Supabase (user_id, from_gym_id, to_gym_id, status, created_at) with RLS
 * so the target gym's admin can approve or reject. Showing request UI until that exists.
 */

import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Camera, Save, LogOut, Check, Clock, MapPin } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { supabase, supabaseConfigured } from '../lib/supabaseClient';
import { uploadAvatar } from '../lib/uploadAvatar';
import { gyms } from '../data/gyms';
import mascotNeutral from '../assets/brand/mascot_neutral.png';

export default function Settings() {
  const navigate   = useNavigate();
  const user       = useAuthStore((s) => s.getUser());
  const updateUser = useAuthStore((s) => s.updateUser);
  const logout     = useAuthStore((s) => s.logout);

  const [name, setName]                   = useState(user?.name ?? '');
  const [phone, setPhone]                 = useState(user?.phone ?? '');
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar ?? '');
  const [pendingFile, setPendingFile]     = useState<File | null>(null);
  const [uploading, setUploading]         = useState(false);
  const [saved, setSaved]                 = useState(false);
  const [pendingGymRequest, setPendingGymRequest] = useState<string | null>(null);
  const [transferring, setTransferring]           = useState(false);
  const fileRef  = useRef<HTMLInputElement>(null);
  const demoMode = useAuthStore((s) => s.demoMode);

  // Restore any pending transfer request from Supabase on mount
  useEffect(() => {
    if (!supabaseConfigured || !supabase || !user?.id || demoMode) return;
    supabase
      .from('gym_transfer_requests')
      .select('to_gym_id')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data?.[0]) setPendingGymRequest(data[0].to_gym_id as string);
      });
  }, [user?.id, demoMode]);

  if (!user) return null;

  const isDirty =
    name.trim() !== user.name ||
    phone.trim() !== user.phone ||
    pendingFile !== null;

  const currentGym = gyms.find((g) => g.id === user.gymId);
  const initials   = user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  // ── Avatar pick ───────────────────────────────────────────────────────────
  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // ── Save account fields (name, phone, avatar) ─────────────────────────────
  const handleSave = async () => {
    if (!isDirty) return;
    setUploading(true);

    let avatarUrl = user.avatar;
    if (pendingFile) {
      const uploaded = await uploadAvatar(pendingFile, user.id);
      avatarUrl = uploaded ?? avatarPreview;
    }

    updateUser({
      ...user,
      name:   name.trim() || user.name,
      phone:  phone.trim(),
      avatar: avatarUrl,
      // gymId intentionally excluded — requires admin approval to switch
    });

    setPendingFile(null);
    setAvatarPreview(avatarUrl);
    setUploading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  // ── Gym transfer request ──────────────────────────────────────────────────
  const handleGymRequest = async (targetGymId: string) => {
    if (targetGymId === user.gymId || pendingGymRequest === targetGymId || transferring) return;
    setTransferring(true);
    if (supabaseConfigured && supabase && !demoMode) {
      const { error } = await supabase.from('gym_transfer_requests').insert({
        user_id:     user.id,
        from_gym_id: user.gymId,
        to_gym_id:   targetGymId,
        status:      'pending',
      });
      if (error) console.warn('[gym_transfer_requests]', error.message);
    }
    setPendingGymRequest(targetGymId);
    setTransferring(false);
  };

  // ── Sign out ──────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const fade = (i: number) => ({
    initial:    { opacity: 0, y: 10 },
    animate:    { opacity: 1, y: 0 },
    transition: { delay: i * 0.06, duration: 0.36, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-5 sm:px-6">

      {/* ── Header */}
      <div className="flex items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center justify-center rounded-xl transition-colors"
            style={{
              width: 36, height: 36,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.07)',
              color: 'var(--text-secondary)',
            }}
            aria-label="Go back"
          >
            <ChevronLeft size={18} />
          </button>
          <div>
            <p className="label tracking-[0.25em]">Account</p>
            <h1 className="text-2xl font-black leading-tight text-white">Settings</h1>
          </div>
        </div>
        <img src={mascotNeutral} alt="" aria-hidden="true" style={{ width: 72 }} />
      </div>

      {/* ── Profile section */}
      <motion.div {...fade(0)} className="card p-6 space-y-5">
        <p className="label tracking-[0.22em]">Profile</p>

        {/* Avatar picker */}
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="relative shrink-0 rounded-2xl overflow-hidden transition-opacity hover:opacity-80"
            style={{ width: 72, height: 72 }}
            aria-label="Change avatar"
          >
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="avatar"
                className="w-full h-full object-cover"
                style={{ border: '1px solid rgba(212,160,23,0.22)' }}
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-xl font-black text-black"
                style={{ background: 'linear-gradient(145deg, #E5C158, var(--gold))' }}
              >
                {initials}
              </div>
            )}
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.42)' }}
            >
              <Camera size={18} style={{ color: '#fff' }} />
            </div>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFilePick}
            className="sr-only"
          />
          <div>
            <p className="text-sm font-semibold text-white">Profile photo</p>
            <p className="mt-0.5 text-xs" style={{ color: 'var(--text-faint)' }}>
              Tap to upload a new image
            </p>
            {pendingFile && (
              <p className="mt-1 text-xs" style={{ color: 'var(--gold)' }}>
                New photo ready — save to apply
              </p>
            )}
          </div>
        </div>

        <div className="divider" />

        {/* Display name */}
        <div className="space-y-1.5">
          <label className="label tracking-[0.18em]" htmlFor="settings-name">Display Name</label>
          <input
            id="settings-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl px-4 py-3 text-sm font-semibold text-white outline-none"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(212,160,23,0.35)')}
            onBlur={(e)  => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
            placeholder="Your name"
            autoComplete="name"
          />
        </div>

        {/* Email — read-only */}
        <div className="space-y-1.5">
          <label className="label tracking-[0.18em]" htmlFor="settings-email">Email</label>
          <input
            id="settings-email"
            type="email"
            value={user.email}
            readOnly
            className="w-full rounded-xl px-4 py-3 text-sm font-semibold outline-none"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.04)',
              color: 'var(--text-muted)',
              cursor: 'default',
            }}
          />
          <p className="text-[11px]" style={{ color: 'var(--text-faint)' }}>
            Managed through authentication — cannot be changed here.
          </p>
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <label className="label tracking-[0.18em]" htmlFor="settings-phone">Phone</label>
          <input
            id="settings-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-xl px-4 py-3 text-sm font-semibold text-white outline-none"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(212,160,23,0.35)')}
            onBlur={(e)  => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
            placeholder="+234 800 000 0000"
            autoComplete="tel"
          />
        </div>
      </motion.div>

      {/* ── Save button */}
      <motion.div {...fade(1)}>
        <button
          type="button"
          onClick={handleSave}
          disabled={!isDirty || uploading}
          className="btn-primary w-full py-3.5 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <AnimatePresence mode="wait">
            {saved ? (
              <motion.span
                key="saved"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <Check size={14} /> Changes Saved
              </motion.span>
            ) : uploading ? (
              <motion.span key="saving" className="flex items-center gap-2">
                <span
                  className="h-3.5 w-3.5 animate-spin rounded-full"
                  style={{ border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#000' }}
                />
                Saving…
              </motion.span>
            ) : (
              <motion.span key="idle" className="flex items-center gap-2">
                <Save size={14} /> Save Changes
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </motion.div>

      {/* ── Gym section */}
      <motion.div {...fade(2)} className="card p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="label tracking-[0.22em]">Your Gym</p>
            <h2 className="mt-1 text-lg font-black text-white">
              {currentGym?.name ?? 'No gym set'}
            </h2>
            {currentGym && (
              <div className="mt-0.5 flex items-center gap-1.5">
                <MapPin size={10} style={{ color: 'var(--text-faint)' }} />
                <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
                  {currentGym.location}
                </p>
              </div>
            )}
          </div>
          {import.meta.env.DEV && (
            <span
              className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
              style={{
                background: 'rgba(243,156,18,0.1)',
                border: '1px solid rgba(243,156,18,0.2)',
                color: 'var(--warning)',
              }}
              title="Backend gap: gym transfers require admin approval table"
            >
              Mock
            </span>
          )}
        </div>

        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-faint)' }}>
          Switching gyms requires approval from the new gym's admin. Your request will be
          reviewed before your membership transfers.
        </p>

        <div className="space-y-2">
          {gyms.map((gym) => {
            const isCurrent  = gym.id === user.gymId;
            const isPending  = gym.id === pendingGymRequest;

            return (
              <div
                key={gym.id}
                className="flex items-center gap-3 rounded-xl px-4 py-3.5"
                style={{
                  background: isCurrent ? 'rgba(212,160,23,0.07)' : 'rgba(255,255,255,0.025)',
                  border: `1px solid ${isCurrent ? 'rgba(212,160,23,0.25)' : 'rgba(255,255,255,0.05)'}`,
                }}
              >
                {/* Name + location */}
                <div className="min-w-0 flex-1">
                  <p
                    className="text-sm font-bold truncate"
                    style={{ color: isCurrent ? '#fff' : 'var(--text-secondary)' }}
                  >
                    {gym.name}
                  </p>
                  <p className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--text-faint)' }}>
                    {gym.location}
                  </p>
                </div>

                {/* Right side status */}
                {isCurrent ? (
                  <span
                    className="shrink-0 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
                    style={{
                      background: 'rgba(212,160,23,0.12)',
                      border: '1px solid rgba(212,160,23,0.25)',
                      color: 'var(--gold)',
                    }}
                  >
                    <Check size={10} />
                    Current
                  </span>
                ) : isPending ? (
                  <span
                    className="shrink-0 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
                    style={{
                      background: 'rgba(243,156,18,0.08)',
                      border: '1px solid rgba(243,156,18,0.2)',
                      color: 'var(--warning)',
                    }}
                  >
                    <Clock size={10} />
                    Pending
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleGymRequest(gym.id)}
                    className="shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold transition-colors"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: 'var(--text-secondary)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                  >
                    Request
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {pendingGymRequest && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs leading-relaxed"
            style={{ color: 'var(--text-faint)' }}
          >
            Your request has been sent. You'll stay at {currentGym?.name} until the admin approves.
          </motion.p>
        )}

      </motion.div>

      {/* ── Sign out */}
      <motion.div {...fade(3)} className="card p-5">
        <p className="label mb-4 tracking-[0.22em]">Session</p>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-bold transition-colors"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            color: 'var(--text-secondary)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
        >
          <LogOut size={15} />
          Sign Out
        </button>
      </motion.div>

    </div>
  );
}
