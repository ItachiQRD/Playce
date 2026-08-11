"use client";

import Link from "next/link";
import { useDemo } from "@/lib/demo-store";
import { useI18n } from "@/lib/i18n";
import { PostCard } from "@/components/feed/post-card";
import { OpportunityCard, ProfileCard } from "@/components/cards/entity-cards";
import { CompletenessBar, Avatar, Card, EmptyState } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SignalHud } from "@/components/signal/signal-hud";

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
    .slice(0, 8);

  const recommended = opportunities
    .filter((o) => o.status === "open")
    .map((o) => ({ ...o, ...getMatchScore(o) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-5 md:max-w-6xl md:space-y-6 md:px-6 md:py-8 lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-10">
      <div className="min-w-0 space-y-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("feed.title")}</h1>
            <p className="mt-1 text-sm text-slate-muted">
              {t("feed.welcomePrefix")} {auth.user.full_name.split(" ")[0]}
              {" — "}
              {t(`roles.${auth.user.role}`)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="md:hidden">
              <SignalHud compact />
            </div>
            <Link href="/publish" className="hidden sm:block">
              <Button size="sm">{t("common.publish")}</Button>
            </Link>
          </div>
        </div>

        <section className="glass rounded-3xl px-4 py-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-tight">
              {t("feed.discover")}
            </h2>
            <Link href="/search" className="text-xs font-medium text-playce-teal">
              {t("common.seeAll")}
            </Link>
          </div>
          <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-1 scrollbar-none">
            {discover.map((p, i) => (
              <Link
                key={p.id}
                href={`/p/${p.handle}`}
                className="animate-soft-in flex w-[72px] shrink-0 flex-col items-center gap-2"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="rounded-full bg-gradient-to-br from-playce-teal to-electric-blue p-[2px]">
                  <div className="rounded-full bg-surface p-[2px]">
                    <Avatar src={p.avatar_url} name={p.full_name} size="lg" />
                  </div>
                </div>
                <span className="w-full truncate text-center text-[11px] font-medium">
                  {p.full_name.split(" ")[0]}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {auth.user.completeness < 80 && (
          <div className="glass space-y-3 rounded-3xl border-playce-teal/25 p-4">
            <div className="flex items-start gap-3">
              <div className="animate-float flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-playce-teal text-sm font-extrabold text-white">
                P
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <p className="text-sm font-semibold tracking-tight text-playce-teal">
                  {t("feed.completeTitle")}
                </p>
                <CompletenessBar value={Math.max(auth.user.completeness, 18)} />
                <p className="text-sm text-slate-muted">{t("feed.completeHint")}</p>
                <Link href="/profile/edit">
                  <Button size="sm" variant="outline">
                    {t("feed.completeProfile")}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {recommended[0] && (
          <div className="md:hidden">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-muted">
              {t("feed.recommended")}
            </p>
            <OpportunityCard
              opportunity={recommended[0]}
              matchScore={recommended[0].score}
            />
          </div>
        )}

        <div className="space-y-4">
          {posts.length === 0 ? (
            <EmptyState
              title={t("feed.emptyTitle")}
              description={t("feed.emptyHint")}
              action={
                <Button size="sm" onClick={() => router.push("/publish")}>
                  {t("common.publish")}
                </Button>
              }
            />
          ) : (
            posts.map((post, i) => (
              <div
                key={post.id}
                className="glass overflow-hidden rounded-3xl"
              >
                <PostCard post={post} index={i} />
              </div>
            ))
          )}
        </div>
      </div>

      <aside className="hidden space-y-6 lg:block">
        <Card className="space-y-3 border-playce-teal/20">
          <p className="text-sm font-semibold text-playce-teal">{t("feed.demoTitle")}</p>
          <p className="text-xs text-slate-muted">{t("feed.demoHint")}</p>
        </Card>

        <section className="space-y-3">
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

        <section className="space-y-3">
          <h2 className="text-sm font-semibold">{t("feed.discover")}</h2>
          <div className="space-y-3">
            {discover.slice(0, 4).map((p) => (
              <ProfileCard key={p.id} profile={p} />
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}
