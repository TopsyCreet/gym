export type Trial = { id: number; text: string; xp: number };

export const trials: Trial[] = [
  { id: 1001, text: "No phone for your first 20 minutes in the gym.", xp: 100 },
  { id: 1002, text: "Log your session before you leave the floor.", xp: 100 },
  { id: 1003, text: "Pick one movement and add 5% more load than last time.", xp: 100 },
  { id: 1004, text: "Rest exactly 90 seconds between every set — no more.", xp: 100 },
  { id: 1005, text: "Complete your warm-up with full intent, not as a formality.", xp: 100 },
  { id: 1006, text: "Spend 10 minutes stretching after your last set.", xp: 100 },
  { id: 1007, text: "Do not sit idle for more than 3 minutes at any point.", xp: 100 },
  { id: 1008, text: "Eat within 30 minutes of finishing your session.", xp: 100 },
  { id: 1009, text: "Hydrate — drink at least 1 litre before you leave the gym.", xp: 100 },
  { id: 1010, text: "Tell someone your session goal before you start.", xp: 100 },
  { id: 1011, text: "Attempt a movement you have been avoiding.", xp: 100 },
  { id: 1012, text: "Finish with 5 minutes of slow breathing before you walk out.", xp: 100 },
  { id: 1013, text: "Write down one thing that felt stronger than last week.", xp: 100 },
  { id: 1014, text: "Do every rep with the same deliberate tempo — no sloppy reps.", xp: 100 },
  { id: 1015, text: "Focus on the eccentric — lower with control on every set.", xp: 100 },
  { id: 1016, text: "Track every set and rep on paper or in an app today.", xp: 100 },
  { id: 1017, text: "Skip no accessory work — complete every planned movement.", xp: 100 },
  { id: 1018, text: "Hit the gym at the same time as yesterday or earlier.", xp: 100 },
  { id: 1019, text: "Train with zero music for the first 15 minutes.", xp: 100 },
  { id: 1020, text: "Work on a weak point for 10 dedicated minutes.", xp: 100 },
  { id: 1021, text: "Set a personal record on any lift, even by a single rep.", xp: 100 },
  { id: 1022, text: "Greet one other person in the gym by name.", xp: 100 },
  { id: 1023, text: "Get to bed before midnight tonight to support your recovery.", xp: 100 },
  { id: 1024, text: "Do not leave until your session is fully complete — no shortcuts.", xp: 100 },
  { id: 1025, text: "Replace one processed meal today with a whole-food option.", xp: 100 },
  { id: 1026, text: "Plan tomorrow's session before you leave today.", xp: 100 },
  { id: 1027, text: "Focus only on form for your first two working sets.", xp: 100 },
  { id: 1028, text: "End your session with 5 minutes of walking — cool down deliberately.", xp: 100 },
  { id: 1029, text: "Note one cue that improved a lift and apply it every set.", xp: 100 },
  { id: 1030, text: "Commit to your heaviest set first — do not save it for later.", xp: 100 },
];

export function getTodaysTrial(): Trial {
  const now   = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86_400_000);
  return trials[dayOfYear % trials.length];
}
