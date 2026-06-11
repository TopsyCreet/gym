/**
 * GymFeedCard — community activity preview for Dashboard.
 *
 * BACKEND GAP: live data requires a `gym_feed` Supabase table with RLS
 * scoped to the user's gym. Showing mock data until that table exists.
 * See: https://github.com/anthropics/claude-code/issues (track this separately)
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Heart } from 'lucide-react';

const MOCK_FEED = [
  { id: 1, initials: 'EO', name: 'Emeka O.',  action: 'Checked in',               timeAgo: '2h ago', kudos: 3 },
  { id: 2, initials: 'KA', name: 'Kemi A.',   action: 'Hit a 14-session milestone', timeAgo: '4h ago', kudos: 7 },
  { id: 3, initials: 'TB', name: 'Tunde B.',  action: 'Cleared all three trials',  timeAgo: '6h ago', kudos: 2 },
];

// Stable initials colour palette keyed by first char — deterministic, not random.
const INITIALS_COLORS: Record<string, string> = {
  A:'#CD853F', B:'#4A90D9', C:'#2ECC71', D:'#D4A017', E:'#A085E0',
  F:'#CD853F', G:'#4A90D9', H:'#2ECC71', I:'#D4A017', J:'#A085E0',
  K:'#CD853F', L:'#4A90D9', M:'#2ECC71', N:'#D4A017', O:'#A085E0',
  P:'#CD853F', Q:'#4A90D9', R:'#2ECC71', S:'#D4A017', T:'#A085E0',
  U:'#CD853F', V:'#4A90D9', W:'#2ECC71', X:'#D4A017', Y:'#A085E0',
  Z:'#CD853F',
};

function getInitialsColor(initials: string): string {
  return INITIALS_COLORS[initials[0]?.toUpperCase()] ?? 'var(--gold)';
}

// ── Feed item ─────────────────────────────────────────────────────────────
function FeedItem({ item }: { item: typeof MOCK_FEED[0] }) {
  const [kudos, setKudos] = useState(item.kudos);
  const [tapped, setTapped] = useState(false);
  const accentColor = getInitialsColor(item.initials);

  const handleKudos = () => {
    if (tapped) return; // one Respect per session per item (UI-only)
    setTapped(true);
    setKudos((k) => k + 1);
  };

  return (
    <div
      className="flex items-center gap-3 py-3"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
    >
      {/* Avatar */}
      <div
        className="shrink-0 flex items-center justify-center rounded-full text-xs font-bold"
        style={{
          width: 36, height: 36,
          background: `${accentColor}18`,
          border: `1px solid ${accentColor}30`,
          color: accentColor,
        }}
        aria-hidden="true"
      >
        {item.initials}
      </div>

      {/* Content */}
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

      {/* Kudos / Respect button */}
      <motion.button
        type="button"
        onClick={handleKudos}
        aria-label={tapped ? `${kudos} respects given` : `Give respect (${kudos})`}
        aria-pressed={tapped}
        whileTap={{ scale: 0.88 }}
        transition={{ type: 'spring', stiffness: 500, damping: 20 }}
        className="shrink-0 flex items-center gap-1.5 rounded-xl px-2.5"
        style={{
          background: tapped ? 'var(--gold-faint)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${tapped ? 'rgba(212,160,23,0.28)' : 'rgba(255,255,255,0.07)'}`,
          minHeight: 36,
          minWidth: 44,
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

// ── Card ──────────────────────────────────────────────────────────────────
export default function GymFeedCard() {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.warn(
      '[PRIME · backend-gap] GymFeedCard is showing mock data.\n' +
      'To enable live data: create a `gym_feed` table in Supabase with RLS\n' +
      'scoped to the user\'s gym_id. Schema: id, gym_id, user_id, event_type, created_at.'
    );
  }

  return (
    <div className="card p-5" data-card>
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Users size={13} style={{ color: 'var(--text-faint)' }} aria-hidden="true" />
          <p className="label">Your Gym</p>
        </div>

        {import.meta.env.DEV && (
          <span
            className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{
              background: 'rgba(243,156,18,0.1)',
              border: '1px solid rgba(243,156,18,0.2)',
              color: 'var(--warning)',
            }}
            title="Backend gap: showing mock data"
          >
            Mock
          </span>
        )}
      </div>

      <p className="text-xs mb-4" style={{ color: 'var(--text-faint)' }}>
        Prime Performance Center
      </p>

      {/* Feed items */}
      <div>
        {MOCK_FEED.map((item) => (
          <FeedItem key={item.id} item={item} />
        ))}
      </div>

      {/* Backend gap notice (dev only) */}
      {import.meta.env.DEV && (
        <p className="mt-3 text-center text-[10px]" style={{ color: 'var(--text-ghost)' }}>
          Live feed requires <code>gym_feed</code> table in Supabase.
        </p>
      )}
    </div>
  );
}
