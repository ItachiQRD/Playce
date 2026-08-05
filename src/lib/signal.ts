/** PLAYCE Signal — visibility & daily engagement loop */

export type SignalRankId =
  | "echo"
  | "pulse"
  | "beacon"
  | "orbit"
  | "nova"
  | "legend";

export interface SignalRank {
  id: SignalRankId;
  min: number;
  label_fr: string;
  label_en: string;
  color: string;
}

export const SIGNAL_RANKS: SignalRank[] = [
  { id: "echo", min: 0, label_fr: "Écho", label_en: "Echo", color: "#64748B" },
  { id: "pulse", min: 50, label_fr: "Pulse", label_en: "Pulse", color: "#00B894" },
  { id: "beacon", min: 150, label_fr: "Balise", label_en: "Beacon", color: "#2563EB" },
  { id: "orbit", min: 350, label_fr: "Orbite", label_en: "Orbit", color: "#A78BFA" },
  { id: "nova", min: 700, label_fr: "Nova", label_en: "Nova", color: "#F59E0B" },
  { id: "legend", min: 1200, label_fr: "Légende", label_en: "Legend", color: "#F43F5E" },
];

export const SIGNAL_REWARDS = {
  daily_open: 8,
  publish: 25,
  publish_reel: 35,
  like: 2,
  comment: 5,
  apply: 20,
  message: 4,
  profile_boost: 15,
  streak_bonus: 10,
  discover: 3,
} as const;

export type SignalAction = keyof typeof SIGNAL_REWARDS;

export interface DailyQuest {
  id: string;
  action: SignalAction | "engage" | "discover";
  target: number;
  progress: number;
  reward: number;
  label_fr: string;
  label_en: string;
}

export interface SignalState {
  points: number;
  streak: number;
  lastActiveDate: string; // YYYY-MM-DD
  todayEarned: number;
  quests: DailyQuest[];
  history: { action: string; points: number; at: string }[];
}

export function todayKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

export function getRank(points: number): SignalRank {
  let current = SIGNAL_RANKS[0];
  for (const r of SIGNAL_RANKS) {
    if (points >= r.min) current = r;
  }
  return current;
}

export function getNextRank(points: number): SignalRank | null {
  const rank = getRank(points);
  const idx = SIGNAL_RANKS.findIndex((r) => r.id === rank.id);
  return SIGNAL_RANKS[idx + 1] ?? null;
}

export function rankProgress(points: number) {
  const rank = getRank(points);
  const next = getNextRank(points);
  if (!next) return 1;
  const span = next.min - rank.min;
  return Math.min(1, (points - rank.min) / span);
}

export function createDefaultQuests(): DailyQuest[] {
  return [
    {
      id: "q-discover",
      action: "discover",
      target: 5,
      progress: 0,
      reward: 12,
      label_fr: "Découvrir 5 contenus",
      label_en: "Discover 5 pieces of content",
    },
    {
      id: "q-publish",
      action: "publish",
      target: 1,
      progress: 0,
      reward: 25,
      label_fr: "Publier une fois",
      label_en: "Publish once",
    },
    {
      id: "q-engage",
      action: "engage",
      target: 3,
      progress: 0,
      reward: 15,
      label_fr: "Interagir 3 fois",
      label_en: "Engage 3 times",
    },
  ];
}

export function createInitialSignal(): SignalState {
  return {
    points: 42,
    streak: 1,
    lastActiveDate: todayKey(),
    todayEarned: 8,
    quests: createDefaultQuests(),
    history: [
      {
        action: "daily_open",
        points: 8,
        at: new Date().toISOString(),
      },
    ],
  };
}

export function rollDailySignal(state: SignalState): SignalState {
  const today = todayKey();
  if (state.lastActiveDate === today) return state;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const cont = state.lastActiveDate === todayKey(yesterday);
  const streak = cont ? state.streak + 1 : 1;
  const bonus = cont && streak >= 2 ? SIGNAL_REWARDS.streak_bonus : 0;
  const earned = SIGNAL_REWARDS.daily_open + bonus;

  return {
    ...state,
    streak,
    lastActiveDate: today,
    todayEarned: earned,
    points: state.points + earned,
    quests: createDefaultQuests(),
    history: [
      {
        action: "daily_open",
        points: earned,
        at: new Date().toISOString(),
      },
      ...state.history,
    ].slice(0, 40),
  };
}

export function applySignalReward(
  state: SignalState,
  action: SignalAction,
  questHint?: "discover" | "engage" | "publish"
): { state: SignalState; gained: number } {
  const base = SIGNAL_REWARDS[action];
  let quests = state.quests.map((q) => ({ ...q }));
  let bonus = 0;

  const bump = (id: string) => {
    const q = quests.find((x) => x.id === id);
    if (!q || q.progress >= q.target) return;
    q.progress += 1;
    if (q.progress >= q.target) bonus += q.reward;
  };

  if (questHint === "discover") bump("q-discover");
  if (questHint === "engage" || action === "like" || action === "comment")
    bump("q-engage");
  if (questHint === "publish" || action === "publish" || action === "publish_reel")
    bump("q-publish");

  const gained = base + bonus;
  return {
    gained,
    state: {
      ...state,
      points: state.points + gained,
      todayEarned: state.todayEarned + gained,
      quests,
      history: [
        { action, points: gained, at: new Date().toISOString() },
        ...state.history,
      ].slice(0, 40),
    },
  };
}
