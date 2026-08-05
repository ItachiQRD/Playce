"use client";

type EventName =
  | "activation_profile_60"
  | "activation_profile_80"
  | "first_application"
  | "first_message"
  | "first_post"
  | "opportunity_view"
  | "landing_cta"
  | "sports_id_share"
  | "report_created"
  | "reel_view";

interface AnalyticsEvent {
  name: EventName;
  ts: number;
  props?: Record<string, string | number | boolean>;
}

const KEY = "playce-analytics-v1";

function load(): AnalyticsEvent[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as AnalyticsEvent[];
  } catch {
    return [];
  }
}

function save(events: AnalyticsEvent[]) {
  localStorage.setItem(KEY, JSON.stringify(events.slice(-500)));
}

export function track(name: EventName, props?: AnalyticsEvent["props"]) {
  if (typeof window === "undefined") return;
  const events = load();
  // Deduplicate one-shot activation events
  const oneshot: EventName[] = [
    "activation_profile_60",
    "activation_profile_80",
    "first_application",
    "first_message",
    "first_post",
  ];
  if (oneshot.includes(name) && events.some((e) => e.name === name)) return;
  events.push({ name, ts: Date.now(), props });
  save(events);
}

export function getAnalyticsSummary() {
  const events = load();
  const count = (name: EventName) => events.filter((e) => e.name === name).length;
  return {
    total: events.length,
    profile60: count("activation_profile_60") > 0,
    profile80: count("activation_profile_80") > 0,
    firstApplication: count("first_application") > 0,
    firstMessage: count("first_message") > 0,
    firstPost: count("first_post") > 0,
    opportunityViews: count("opportunity_view"),
    shares: count("sports_id_share"),
    reports: count("report_created"),
    reelViews: count("reel_view"),
    events,
  };
}
