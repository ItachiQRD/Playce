import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeDate(date: string | Date, locale = "fr") {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return locale === "fr" ? "À l'instant" : "Just now";
  if (minutes < 60) return locale === "fr" ? `Il y a ${minutes} min` : `${minutes}m ago`;
  if (hours < 24) return locale === "fr" ? `Il y a ${hours} h` : `${hours}h ago`;
  if (days < 7) return locale === "fr" ? `Il y a ${days} j` : `${days}d ago`;
  return d.toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US");
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function calculateCompleteness(profile: {
  full_name?: string | null;
  avatar_url?: string | null;
  city?: string | null;
  country?: string | null;
  bio?: string | null;
  sport_id?: string | null;
  position?: string | null;
  level?: string | null;
  availability?: string | null;
  languages?: string[] | null;
}): number {
  const checks = [
    !!profile.full_name,
    !!profile.avatar_url,
    !!profile.city || !!profile.country,
    !!profile.bio,
    !!profile.sport_id,
    !!profile.position,
    !!profile.level,
    !!profile.availability,
    !!(profile.languages && profile.languages.length > 0),
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export const MATCH_WEIGHTS = {
  sport: 30,
  position: 25,
  level: 20,
  location: 15,
  availability: 10,
} as const;

export type MatchReasonKey = keyof typeof MATCH_WEIGHTS;

export interface MatchBreakdownItem {
  key: MatchReasonKey;
  weight: number;
  matched: boolean;
}

export interface MatchResult {
  score: number;
  reasons: MatchReasonKey[];
  breakdown: MatchBreakdownItem[];
}

export function matchingScore(params: {
  sportMatch: boolean;
  positionMatch: boolean;
  levelMatch: boolean;
  locationMatch: boolean;
  availabilityMatch: boolean;
  experienceBonus?: number;
}): MatchResult {
  const flags: Record<MatchReasonKey, boolean> = {
    sport: params.sportMatch,
    position: params.positionMatch,
    level: params.levelMatch,
    location: params.locationMatch,
    availability: params.availabilityMatch,
  };

  const breakdown: MatchBreakdownItem[] = (
    Object.keys(MATCH_WEIGHTS) as MatchReasonKey[]
  ).map((key) => ({
    key,
    weight: MATCH_WEIGHTS[key],
    matched: flags[key],
  }));

  let score = breakdown
    .filter((b) => b.matched)
    .reduce((sum, b) => sum + b.weight, 0);

  if (params.experienceBonus) score += Math.min(params.experienceBonus, 10);

  return {
    score: Math.min(score, 100),
    reasons: breakdown.filter((b) => b.matched).map((b) => b.key),
    breakdown,
  };
}

/** Read a local file as data URL (demo upload without backend). */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.size > 4 * 1024 * 1024) {
      reject(new Error("MAX_SIZE"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function isMinor(birthDate?: string | null): boolean {
  if (!birthDate) return false;
  const birth = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age < 18;
}
