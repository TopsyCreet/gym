import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { supabase, supabaseConfigured } from '../lib/supabaseClient';
import { gyms, findGymByCode } from '../data/gyms';
import { TrendingUp, Users, CheckCircle, Target, Check, X, Clock } from 'lucide-react';
import { Skeleton } from '../components/ui/Skeleton';

type PortalMember = {
  id: string;
  name: string;
  avatar: string;
  rankTitle: string;
  streak: number;
  checkIns: number;
  xp: number;
  lastCheckInDate: string | null;
};

type TransferRequest = {
  id: string;
  user_id: string;
  from_gym_id: string;
  to_gym_id: string;
  status: string;
  created_at: string;
  member_name?: string;
};

function buildMembers(rows: any[]): PortalMember[] {
  const seen = new Set<string>();
  return rows
    .filter((r) => {
      if (!r.name?.trim() || seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    })
    .map((r) => ({
      id: r.id,
      name: r.name ?? '',
      avatar: r.avatar ?? '',
      rankTitle: r.rank_title ?? 'Initiate',
      streak: r.streak ?? 0,
      checkIns: r.check_ins ?? 0,
      xp: r.xp ?? 0,
      lastCheckInDate: r.last_checkin_date ?? null,
    }));
}

export default function GymPortal() {
  const currentUser = useAuthStore((s) => s.getUser());
  const demoMode    = useAuthStore((s) => s.demoMode);

  const [code, setCode]   = useState('');
  const [gym,  setGym]    = useState<(typeof gyms)[0] | null>(null);
  const [error, setError] = useState('');

  const [members,   setMembers]   = useState<PortalMember[]>([]);
  const [requests,  setRequests]  = useState<TransferRequest[]>([]);
  const [loading,   setLoading]   = useState(false);
  const [acting,    setActing]    = useState<string | null>(null);

  const useLive = supabaseConfigured && !!supabase && !demoMode && !!currentUser?.id;

  // Fetch members + transfer requests whenever a gym is selected
  useEffect(() => {
    if (!gym) { setMembers([]); setRequests([]); return; }
    if (!useLive) return;

    setLoading(true);
    Promise.all([
      supabase!
        .from('profiles')
        .select('id, name, avatar, rank_title, streak, check_ins, xp, last_checkin_date')
        .eq('gym_id', gym.id),
      supabase!
        .from('gym_transfer_requests')
        .select('id, user_id, from_gym_id, to_gym_id, status, created_at')
        .eq('to_gym_id', gym.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false }),
    ]).then(([membersRes, reqRes]) => {
      if (membersRes.data) setMembers(buildMembers(membersRes.data));
      if (reqRes.data) setRequests(reqRes.data as TransferRequest[]);
      setLoading(false);
    });
  }, [gym, useLive]);

  const handleUnlock = () => {
    const found = findGymByCode(code);
    if (found) { setGym(found); setError(''); }
    else setError('Invalid gym code. Contact your PRIME representative.');
  };

  const handleApprove = async (req: TransferRequest) => {
    if (!supabase || acting) return;
    setActing(req.id);
    const { error: err } = await supabase.rpc('approve_gym_transfer', { p_request_id: req.id });
    if (err) { console.error('[portal approve]', err.message); }
    else {
      setRequests((rs) => rs.filter((r) => r.id !== req.id));
      // Re-fetch members since one was just added
      const { data } = await supabase
        .from('profiles')
        .select('id, name, avatar, rank_title, streak, check_ins, xp, last_checkin_date')
        .eq('gym_id', gym!.id);
      if (data) setMembers(buildMembers(data));
    }
    setActing(null);
  };

  const handleReject = async (req: TransferRequest) => {
    if (!supabase || acting) return;
    setActing(req.id);
    const { error: err } = await supabase.rpc('reject_gym_transfer', { p_request_id: req.id });
    if (err) { console.error('[portal reject]', err.message); }
    else setRequests((rs) => rs.filter((r) => r.id !== req.id));
    setActing(null);
  };

  const stats = useMemo(() => {
    if (!members.length) return { total: 0, avgStreak: 0, checkInsToday: 0 };
    const today = new Date().toISOString().slice(0, 10);
    return {
      total:        members.length,
      avgStreak:    Math.round(members.reduce((s, u) => s + u.streak, 0) / members.length),
      checkInsToday: members.filter((u) => u.lastCheckInDate === today).length,
    };
  }, [members]);

  // ── Gate: enter gym code ──────────────────────────────────────────────────
  if (!gym) {
    return (
      <div className="flex min-h-[calc(100vh-120px)] items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <div className="card p-6 text-center">
            <p className="label tracking-[0.25em]">Gym Portal</p>
            <h1 className="mt-2 text-2xl font-black text-white">Enter your gym code</h1>
            <p className="mt-2 text-xs" style={{ color: 'var(--text-faint)' }}>
              Use the referral code assigned to your gym to view members and manage requests.
            </p>
            <input
              value={code}
              onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
              className="input-field mt-5 uppercase tracking-widest text-center"
              placeholder="GYM CODE"
              autoComplete="off"
            />
            {error && <p className="mt-2 text-xs" style={{ color: '#E74C3C' }}>{error}</p>}
            <button type="button" onClick={handleUnlock} className="btn-primary mt-4 w-full">
              Access Dashboard
            </button>

            <div className="mt-6 space-y-2 text-left">
              <p className="label text-center tracking-[0.2em]">Available Gyms</p>
              {gyms.map((g) => (
                <div
                  key={g.id}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
                >
                  <div>
                    <p className="text-xs font-semibold text-white">{g.name}</p>
                    <p className="text-[11px]" style={{ color: 'var(--text-faint)' }}>{g.location}</p>
                  </div>
                  <span
                    className="rounded-md px-2 py-1 font-mono text-[10px] font-bold tracking-widest"
                    style={{ background: 'rgba(212,175,55,0.08)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.15)' }}
                  >
                    {g.referralCode}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const today = new Date().toISOString().slice(0, 10);

  // ── Portal dashboard ──────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-5xl space-y-5 px-4 py-6 sm:px-6">

      {/* Header */}
      <div className="card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="label tracking-[0.25em]">Gym Portal</p>
            <h1 className="mt-1 text-2xl font-black text-white">{gym.name}</h1>
            <p className="mt-0.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
              {gym.location} · Code:{' '}
              <span className="font-mono font-bold" style={{ color: '#D4AF37' }}>{gym.referralCode}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {!useLive && (
              <span
                className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
                style={{ background: 'rgba(243,156,18,0.1)', border: '1px solid rgba(243,156,18,0.2)', color: 'var(--warning)' }}
              >
                Demo
              </span>
            )}
            <button
              type="button"
              onClick={() => { setGym(null); setCode(''); setMembers([]); setRequests([]); }}
              className="btn-secondary text-xs"
            >
              Switch Gym
            </button>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Users,       label: 'Total Members',   value: loading ? '—' : stats.total,         color: '#D4AF37' },
          { icon: TrendingUp,  label: 'Avg Streak',      value: loading ? '—' : `${stats.avgStreak}d`, color: '#D4A017' },
          { icon: CheckCircle, label: 'Check-ins Today', value: loading ? '—' : stats.checkInsToday,  color: '#8A9BA8' },
        ].map((s) => (
          <div key={s.label} className="card p-5" style={{ borderTop: `2px solid ${s.color}30` }}>
            <s.icon size={15} style={{ color: s.color }} />
            <p className="mt-3 text-3xl font-black text-white">{s.value}</p>
            <p className="mt-0.5 label">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Transfer requests — only when there are pending ones */}
      <AnimatePresence>
        {requests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="card overflow-hidden p-0"
          >
            <div
              className="flex items-center gap-2.5 px-5 py-4"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
            >
              <Clock size={13} style={{ color: 'var(--warning)' }} />
              <p className="label tracking-[0.2em]">Pending Transfer Requests</p>
              <span
                className="ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold"
                style={{ background: 'rgba(243,156,18,0.1)', color: 'var(--warning)', border: '1px solid rgba(243,156,18,0.2)' }}
              >
                {requests.length}
              </span>
            </div>
            <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.03)' }}>
              {requests.map((req) => {
                const fromGym = gyms.find((g) => g.id === req.from_gym_id);
                return (
                  <div key={req.id} className="flex items-center gap-4 px-5 py-3.5">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white truncate">
                        {req.member_name ?? req.user_id.slice(0, 8) + '…'}
                      </p>
                      <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-faint)' }}>
                        Transferring from {fromGym?.name ?? req.from_gym_id}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <motion.button
                        type="button"
                        onClick={() => handleApprove(req)}
                        disabled={acting === req.id}
                        whileTap={{ scale: 0.93 }}
                        className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-colors"
                        style={{ background: 'rgba(39,174,96,0.1)', border: '1px solid rgba(39,174,96,0.25)', color: '#27AE60' }}
                        aria-label="Approve transfer"
                      >
                        <Check size={11} />
                        Approve
                      </motion.button>
                      <motion.button
                        type="button"
                        onClick={() => handleReject(req)}
                        disabled={acting === req.id}
                        whileTap={{ scale: 0.93 }}
                        className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-colors"
                        style={{ background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.2)', color: '#E74C3C' }}
                        aria-label="Reject transfer"
                      >
                        <X size={11} />
                        Reject
                      </motion.button>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Member table */}
      <div className="card overflow-hidden p-0">
        <div
          className="flex items-center justify-between gap-3 px-5 py-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
        >
          <div>
            <p className="label tracking-[0.2em]">Member Directory</p>
            {!loading && (
              <p className="mt-0.5 text-xs" style={{ color: 'var(--text-faint)' }}>
                {members.length} member{members.length !== 1 ? 's' : ''} · code{' '}
                <span className="font-mono" style={{ color: '#D4AF37' }}>{gym.referralCode}</span>
              </p>
            )}
          </div>
          <Target size={13} style={{ color: 'var(--text-faint)' }} />
        </div>

        {loading ? (
          <div className="space-y-0">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <Skeleton width={32} height={32} rounded="9999px" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton height={12} width="50%" />
                  <Skeleton height={10} width="30%" />
                </div>
                <Skeleton width={40} height={18} rounded="9999px" />
              </div>
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm" style={{ color: 'var(--text-faint)' }}>No members found for this gym.</p>
            <p className="mt-1 text-xs" style={{ color: 'var(--text-faint)' }}>
              {useLive
                ? 'Members must share the same gym_id in their profile.'
                : `Share code `}
              {!useLive && (
                <span className="font-mono font-bold" style={{ color: '#D4AF37' }}>{gym.referralCode}</span>
              )}
              {!useLive && ' during signup.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[480px]">
              <div
                className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-3 px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest"
                style={{ color: 'var(--text-faint)', borderBottom: '1px solid rgba(255,255,255,0.03)' }}
              >
                <span>Member</span>
                <span className="text-right">Streak</span>
                <span className="text-right">Check-ins</span>
                <span className="text-right">Last Active</span>
              </div>
              <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.03)' }}>
                {[...members].sort((a, b) => b.streak - a.streak).map((member, i) => {
                  const isActive = member.lastCheckInDate === today;
                  return (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="grid grid-cols-[2fr_1fr_1fr_1fr] items-center gap-3 px-5 py-3.5"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {member.avatar ? (
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="h-8 w-8 shrink-0 rounded-full object-cover"
                            style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                          />
                        ) : (
                          <div
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-black"
                            style={{ background: 'linear-gradient(135deg, #D4AF37, #E5C158)' }}
                          >
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">{member.name}</p>
                          <p className="truncate text-[11px]" style={{ color: 'var(--text-faint)' }}>{member.rankTitle}</p>
                        </div>
                      </div>
                      <p className="text-right text-sm font-bold" style={{ color: '#D4AF37' }}>{member.streak}d</p>
                      <p className="text-right text-sm" style={{ color: 'var(--text-secondary)' }}>{member.checkIns}</p>
                      <div className="flex items-center justify-end gap-1.5">
                        {isActive && (
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ background: '#D4A017', boxShadow: '0 0 4px rgba(212,160,23,0.5)' }}
                          />
                        )}
                        <p className="text-right text-xs" style={{ color: isActive ? '#D4A017' : 'var(--text-faint)' }}>
                          {member.lastCheckInDate
                            ? isActive ? 'Today' : member.lastCheckInDate.slice(5)
                            : 'Never'}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
