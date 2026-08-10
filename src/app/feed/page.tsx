"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDemo } from "@/lib/demo-store";
import { useI18n } from "@/lib/i18n";
import { PostCard } from "@/components/feed/post-card";
import { OpportunityCard, ProfileCard } from "@/components/cards/entity-cards";
import { CompletenessBar, Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MobileHomeFeed } from "@/components/feed/mobile-home";

export default function FeedPage() {
  const { auth, posts, profiles, opportunities, getMatchScore } = useDemo();
  const { t } = useI18n();
  const router = useRouter();

  useEffect(() => {
    if (!auth.isAuthenticated) router.replace("/auth/login");
    else if (!auth.onboardingComplete) router.replace("/onboarding");
  }, [auth, router]);

  if (!auth.user) return null;

  const discover = profiles
    .filter((p) => p.id !== auth.user!.id && p.role !== "admin" && !p.is_suspended)
    .slice(0, 4);

  const recommended = opportunities
    .filter((o) => o.status === "open")
    .map((o) => ({ ...o, ...getMatchScore(o) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return (
    <>
      <div className="md:hidden">
        <MobileHomeFeed />
      </div>

      <div className="mx-auto hidden max-w-5xl gap-8 px-4 py-8 md:grid lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/35">
                PLAYCE
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                {t("feed.title")}
              </h1>
              <p className="mt-1 text-sm text-slate-muted">
                Salut {auth.user.full_name.split(" ")[0]} — {t(`roles.${auth.user.role}`)}
              </p>
            </div>
            <Link href="/publish">
              <Button size="sm">{t("common.publish")}</Button>
            </Link>
          </div>

          {auth.user.completeness < 80 && (
            <Card className="space-y-4 border-playce-teal/20 bg-playce-teal/[0.04]">
              <CompletenessBar value={auth.user.completeness} />
              <p className="text-sm text-slate-muted">{t("feed.completeHint")}</p>
              <Link href="/profile/edit">
                <Button size="sm" variant="outline">
                  {t("feed.completeProfile")}
                </Button>
              </Link>
            </Card>
          )}

          {posts.length === 0 ? (
            <p className="text-slate-muted">{t("feed.empty")}</p>
          ) : (
            <div className="overflow-hidden rounded-3xl border border-white/[0.06] bg-surface/40">
              <div className="divide-y divide-white/[0.05]">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="hidden space-y-8 lg:block">
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">{t("feed.discover")}</h2>
              <Link href="/search" className="text-xs text-playce-teal">
                {t("common.seeAll")}
              </Link>
            </div>
            <div className="space-y-3">
              {discover.map((p) => (
                <ProfileCard key={p.id} profile={p} />
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">{t("feed.recommended")}</h2>
              <Link href="/opportunities" className="text-xs text-playce-teal">
                {t("common.seeAll")}
              </Link>
            </div>
            <div className="space-y-3">
              {recommended.map((o) => (
                <OpportunityCard key={o.id} opportunity={o} matchScore={o.score} />
              ))}
            </div>
          </section>
        </aside>
      </div>
    </>
  );
}
