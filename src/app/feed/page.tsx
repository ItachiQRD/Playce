"use client";

import Link from "next/link";
import { useDemo } from "@/lib/demo-store";
import { useI18n } from "@/lib/i18n";
import { PostCard } from "@/components/feed/post-card";
import { OpportunityCard, ProfileCard } from "@/components/cards/entity-cards";
import { CompletenessBar, Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

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
    <div className="mx-auto grid max-w-5xl gap-6 px-4 py-6 lg:grid-cols-[1fr_300px]">
      <div className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">{t("feed.title")}</h1>
            <p className="text-sm text-slate-muted">
              Salut {auth.user.full_name.split(" ")[0]} — {t(`roles.${auth.user.role}`)}
            </p>
          </div>
          <Link href="/publish">
            <Button size="sm">{t("common.publish")}</Button>
          </Link>
        </div>

        <Card className="border-playce-teal/30 bg-playce-teal/5 text-sm">
          <p className="font-medium text-playce-teal">{t("feed.demoTitle")}</p>
          <p className="mt-1 text-slate-muted">{t("feed.demoHint")}</p>
        </Card>

        {auth.user.completeness < 80 && (
          <Card className="space-y-3 border-warning/30 bg-warning/5">
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
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>

      <aside className="hidden space-y-6 lg:block">
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold">{t("feed.discover")}</h2>
            <Link href="/search" className="text-xs text-playce-teal">
              {t("common.seeAll")}
            </Link>
          </div>
          <div className="space-y-2">
            {discover.map((p) => (
              <ProfileCard key={p.id} profile={p} />
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold">
              {t("feed.recommended")}
            </h2>
            <Link href="/opportunities" className="text-xs text-playce-teal">
              {t("common.seeAll")}
            </Link>
          </div>
          <div className="space-y-2">
            {recommended.map((o) => (
              <OpportunityCard key={o.id} opportunity={o} matchScore={o.score} />
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}
