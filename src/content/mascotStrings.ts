/**
 * All mascot speech-bubble copy lives here.
 * Tone: disciplined-warm. Coach, not cheerleader.
 * Max 12 words per bubble. Edit freely.
 */

export const mascotStrings = {
  // ── Onboarding ───────────────────────────────────────────
  onboarding: {
    intro:       "I witness every rep. Miss none.",
    schedule:    "Commit to days. The streak lives here.",
    commitment:  "Pick your pace. I hold you to it.",
    ready:       "Your record starts now. Don't waste it.",
  },

  // ── Dashboard: time-of-day + state-aware ─────────────────
  morning: {
    pending:     "Morning. The gym doesn't open itself.",
    done:        "Proved it early. That's the standard.",
    tight:       "Limited days left. Make this one count.",
    weekSecured: "Week secured. Rest is part of discipline.",
  },
  afternoon: {
    pending:     "Still time. Stop reading. Go.",
    done:        "Solid. The record grows.",
    tight:       "Tight window. One session changes everything.",
    weekSecured: "Week done. Come back stronger.",
  },
  evening: {
    pending:     "Last window today. Take it.",
    done:        "Showed up. Most didn't.",
    tight:       "Tonight or it's a gap. Your call.",
    weekSecured: "Week at commitment. That's the identity.",
  },

  // ── Check-in flow ─────────────────────────────────────────
  checkIn: {
    ready:       "I'm watching. Make it official.",
    verifying:   "Confirming your presence…",
    success:     "Recorded. Nothing undoes this.",
    failed:      "Can't verify. Move closer and retry.",
  },

  // ── Streak states ─────────────────────────────────────────
  streak: {
    firstDay:    "Day one. Most stop here. Don't.",
    milestone7:  "Seven weeks. You're no longer a beginner.",
    milestone12: "Twelve weeks. This is who you are now.",
    broken:      "Best run noted. Start the next one.",
    shieldUsed:  "Shield held your streak. Keep going.",
  },

  // ── Rank promotions ───────────────────────────────────────
  rankUp: {
    forged:   "Forged. Repetition is reshaping you.",
    vanguard: "Vanguard. Your discipline speaks first.",
    elite:    "Elite. Few reach this. Fewer stay.",
    prime:    "Prime. This is what you were built for.",
    monarch:  "Monarch. The standard others chase.",
  },

  // ── Empty states ──────────────────────────────────────────
  empty: {
    noCheckIns: "No sessions yet. First one sets the record.",
    noTrials:   "Check in first. Trials unlock after.",
    noCommunity:"Your gym's feed starts with your first check-in.",
    noProgress: "Check in to build your history.",
  },

  // ── Error states ──────────────────────────────────────────
  error: {
    generic:    "Something broke. Refresh and try again.",
    offline:    "You're offline. Check-ins sync when you're back.",
    gpsBlocked: "Location blocked. Enable GPS to verify.",
  },

  // ── Weekly goal states ────────────────────────────────────
  weekly: {
    complete:    "Week closed. That's what commitment looks like.",
    oneLeft:     "One session left this week.",
    twoLeft:     "Two sessions left. Plenty of time.",
    behind:      "Tight. Sessions remaining equals days left.",
  },
} as const;

export type MascotStringKey = typeof mascotStrings;
