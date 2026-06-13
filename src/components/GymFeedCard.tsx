import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Heart } from 'lucide-react';
import { supabase, supabaseConfigured } from '../lib/supabaseClient';
import { useAuthStore } from '../store/authStore';
import { FeedRowSkeleton } from './ui/Skeleton';

// Per-user localStorage helpers so kudos state survives refresh and logout
function kudosStorageKey(userId: string) { return `prime_kudos_${userId}`; }

function hasGivenKudos(userId: string, feedId: string | number): boolean {
  try {
    const raw = localStorage.getItem(kudosStorageKey(userId));
    return raw ? (JSON.parse(raw) as string[]).includes(String(feedId)) : false;
  } catch { return false; }
}

function persistKudos(userId: string, feedId: string | number) {
  try {
    const raw = localStorage.getItem(kudosStorageKey(userId));
    const ids: string[] = raw ? JSON.parse(raw) : [];
    if (!ids.includes(String(feedId))) {
      localStorage.setItem(kudosStorageKey(userId), JSON.stringify([...ids, String(feedId)]));
    }
  } catch {}
}

type FeedItem = {
  id: string | number;
  initials: string;
  name: string;
  action: string;
  timeAgo: string;
  kudos: number;
};

const MOCK_FEED: FeedItem[] = [
  { id: 1, initials: 'EO', name: 'Emeka O.',  action: 'Checked in',                timeAgo: '2h ago', kudos: 3 },
  { id: 2, initials: 'KA', name: 'Kemi A.',   action: 'Hit a 14-session milestone', timeAgo: '4h ago', kudos: 7 },
  { id: 3, initials: 'TB', name: 'Tunde B.',  action: 'Cleared all three trials',   timeAgo: '6h ago', kudos: 2 },
];

const INITIALS_COLORS: Record<string, string> = {
  A:'#CD853F', B:'#8A9BA8', C:'#D4A017', D:'#D4A017', E:'#A085E0',
  F:'#CD853F', G:'#8A9BA8', H:'#D4A017', I:'#D4A017', J:'#A085E0',
  K:'#CD853F', L:'#8A9BA8', M:'#D4A017', N:'#D4A017', O:'#A085E0',
  P:'#CD853F', Q:'#8A9BA8', R:'#D4A017', S:'#D4A017', T:'#A085E0',
  U:'#CD853F', V:'#8A9BA8', W:'#D4A017', X:'#D4A017', Y:'#A085E0',
  Z:'#CD853F',
};

function getInitialsColor(s: string): string {
  return INITIALS_COLORS[s[0]?.toUpperCase()] ?? 'var(--gold)';
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function FeedItemRow({ item, onKudos }: { item: FeedItem; onKudos?: () => void }) {
  const user  = useAuthStore((s) => s.getUser());
  const [kudos, setKudos] = useState(item.kudos);
  const [tapped, setTapped] = useState(() =>
    user ? hasGivenKudos(user.id, item.id) : false
  );
  const color = getInitialsColor(item.initials);

  return (
    <div
      className="flex items-center gap-3 py-3"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
    >
      <div
        className="shrink-0 flex items-center justify-center rounded-full text-xs font-bold"
        style={{ width: 36, height: 36, background: `${color}18`, border: `1px solid ${color}30`, color }}
        aria-hidden="true"
      >
        {item.initials}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-white truncate">
          {item.name}
          <span className="ml-1.5 font-normal" style={{ color: 'var(--text-secondary)' }}>
            {item.action}
          </span>
        </p>
        <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-faint)' }}>
          {item.timeAgo} · Prime Performance Center
        </p>
      </div>

      <motion.button
        type="button"
        onClick={() => {
          if (!tapped) {
            setTapped(true);
            setKudos((k) => k + 1);
            if (user) persistKudos(user.id, item.id);
            onKudos?.();
          }
        }}
        aria-label={tapped ? `${kudos} respects given` : `Give respect (${kudos})`}
        aria-pressed={tapped}
        whileTap={{ scale: 0.88 }}
        transition={{ type: 'spring', stiffness: 500, damping: 20 }}
        className="shrink-0 flex items-center gap-1.5 rounded-xl px-2.5"
        style={{
          background: tapped ? 'var(--gold-faint)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${tapped ? 'rgba(212,160,23,0.28)' : 'rgba(255,255,255,0.07)'}`,
          minHeight: 36, minWidth: 44,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={kudos}
            initial={{ y: -6, opacity: 0, scale: 0.7 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 6, opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.14 }}
            className="text-xs font-bold tabular-nums"
            style={{ color: tapped ? 'var(--gold)' : 'var(--text-secondary)' }}
          >
            {kudos}
          </motion.span>
        </AnimatePresence>
        <Heart
          size={11}
          style={{ color: tapped ? 'var(--gold)' : 'var(--text-faint)' }}
          fill={tapped ? 'var(--gold)' : 'none'}
          aria-hidden="true"
        />
      </motion.button>
    </div>
  );
}

export default function GymFeedCard() {
  const user     = useAuthStore((s) => s.getUser());
  const demoMode = useAuthStore((s) => s.demoMode);
  const [items, setItems]     = useState<FeedItem[]>([]);
  const [isLive, setIsLive]   = useState(false);
  const [loading, setLoading] = useState(false);
  const channelRef = useRef<any>(null);

  const canUseLive = supabaseConfigured && !!supabase && !demoMode && !!user?.gymId;

  useEffect(() => {
    if (!canUseLive || !supabase || !user?.gymId) {
      setItems(MOCK_FEED);
      return;
    }

    setLoading(true);

    supabase
      .from('gym_feed')
      .select('id, user_initials, user_name, event_text, kudos_count, created_at')
      .eq('gym_id', user.gymId)
      .order('created_at', { ascending: false })
      .limit(5)
      .then(({ data }) => {
        if (data?.length) {
          setItems(data.map((r) => ({
            id: r.id,
            initials: r.user_initials,
            name: r.user_name,
            action: r.event_text,
            timeAgo: relativeTime(r.created_at),
            kudos: r.kudos_count,
          })));
          setIsLive(true);
        } else {
          setItems(MOCK_FEED);
        }
        setLoading(false);
      });

    const channel = supabase
      .channel(`gym-feed-${user.gymId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'gym_feed', filter: `gym_id=eq.${user.gymId}` },
        (payload) => {
          const r = payload.new as any;
          setItems((curr) =>
            [{ id: r.id, initials: r.user_initials, name: r.user_name, action: r.event_text, timeAgo: 'just now', kudos: r.kudos_count ?? 0 }, ...curr].slice(0, 5)
          );
          setIsLive(true);
        }
      )
      .subscribe();
    channelRef.current = channel;

    return () => {
      if (channelRef.current && supabase) supabase.removeChannel(channelRef.current);
    };
  }, [user?.gymId, canUseLive]);

  return (
    <div className="card p-5" data-card>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Users size={13} style={{ color: 'var(--text-faint)' }} aria-hidden="true" />
          <p className="label">Your Gym</p>
        </div>
        {!isLive && import.meta.env.DEV && (
          <span
            className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(243,156,18,0.1)', border: '1px solid rgba(243,156,18,0.2)', color: 'var(--warning)' }}
            title="Run supabase/migrations/001_gym_features.sql to enable live feed"
          >
            Mock
          </span>
        )}
      </div>

      <p className="text-xs mb-4" style={{ color: 'var(--text-faint)' }}>
        Prime Performance Center
      </p>

      <div role={loading ? 'status' : undefined} aria-label={loading ? 'Loading gym feed…' : undefined}>
        {loading ? (
          <>
            <FeedRowSkeleton />
            <FeedRowSkeleton />
            <FeedRowSkeleton />
          </>
        ) : (
          <>
            {items.map((item) => (
              <FeedItemRow
                key={item.id}
                item={item}
                onKudos={isLive && supabase ? () => {
                  supabase!.rpc('increment_kudos', { feed_id: item.id })
                    .then(({ error }) => { if (error) console.warn('[kudos]', error.message); });
                } : undefined}
              />
            ))}
            {items.length === 0 && (
              <p className="py-6 text-center text-xs" style={{ color: 'var(--text-faint)' }}>
                No activity yet — be the first to check in.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
