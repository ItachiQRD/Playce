import type { Opportunity, Post, Profile } from "@/lib/types";

export type DiscoverItem =
  | { kind: "post"; data: Post; score: number }
  | { kind: "opportunity"; data: Opportunity; score: number }
  | { kind: "profile"; data: Profile; score: number };

/** Rank content for the immersive mobile discovery feed. */
export function rankDiscoverFeed(params: {
  viewer: Profile | null;
  posts: Post[];
  opportunities: Opportunity[];
  profiles: Profile[];
  seenIds?: Set<string>;
}): DiscoverItem[] {
  const { viewer, posts, opportunities, profiles, seenIds = new Set() } = params;
  const now = Date.now();
  const items: DiscoverItem[] = [];

  for (const post of posts) {
    if (seenIds.has(post.id) || post.author?.is_suspended) continue;
    let score = 20;
    const ageH = (now - new Date(post.created_at).getTime()) / 3600000;
    score += Math.max(0, 40 - ageH); // freshness
    score += Math.min(30, post.likes_count * 0.8 + post.comments_count * 1.5);
    if (viewer?.sport_id && post.sport_id === viewer.sport_id) score += 35;
    if (viewer?.id && post.author_id === viewer.id) score -= 15;
    if (post.type === "reel" || post.type === "highlight") score += 18;
    if (post.media_url) score += 12;
    if (post.author?.identity_verified) score += 8;
    // Soft boost if same city
    if (viewer?.city && post.author?.city === viewer.city) score += 10;
    items.push({ kind: "post", data: post, score });
  }

  for (const opp of opportunities.filter((o) => o.status === "open")) {
    if (seenIds.has(opp.id)) continue;
    let score = 25;
    const ageH = (now - new Date(opp.created_at).getTime()) / 3600000;
    score += Math.max(0, 25 - ageH * 0.5);
    if (viewer?.sport_id && opp.sport_id === viewer.sport_id) score += 40;
    if (viewer?.position && opp.position === viewer.position) score += 30;
    if (viewer?.level && opp.level === viewer.level) score += 20;
    if (viewer?.availability === "open" || viewer?.availability === "looking")
      score += 15;
    if (viewer?.city && opp.city === viewer.city) score += 12;
    if (opp.type === "offer" && viewer?.role === "athlete") score += 10;
    items.push({ kind: "opportunity", data: opp, score });
  }

  for (const profile of profiles) {
    if (
      seenIds.has(profile.id) ||
      profile.id === viewer?.id ||
      profile.role === "admin" ||
      profile.is_suspended
    )
      continue;
    let score = 10;
    if (viewer?.sport_id && profile.sport_id === viewer.sport_id) score += 28;
    if (profile.availability === "open") score += 12;
    if (profile.identity_verified) score += 10;
    if (profile.completeness >= 80) score += 8;
    if (viewer?.city && profile.city === viewer.city) score += 14;
    // Inject sparsely
    score *= 0.55;
    items.push({ kind: "profile", data: profile, score });
  }

  // Light shuffle among close scores for freshness/addiction
  return items
    .map((item) => ({
      ...item,
      score: item.score + Math.random() * 6,
    }))
    .sort((a, b) => b.score - a.score);
}
