"use client";

import Link from "next/link";
import { Bell, Search } from "lucide-react";
import { useDemo } from "@/lib/demo-store";
import { useI18n } from "@/lib/i18n";
import { PostCard } from "@/components/feed/post-card";
import { OpportunityCard, ProfileCard } from "@/components/cards/entity-cards";
import { CompletenessBar, Avatar, Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SignalHud } from "@/components/signal/signal-hud";

export default function FeedPage() {
  const { auth, posts, profiles, opportunities, getMatchScore, notifications } =
    useDemo();
  const { t } = useI18n();
  const router = useRouter();

  useEffect(() => {
    if (!auth.isAuthenticated) router.replace("/auth/login");
    else if (!auth.onboardingComplete) router.replace("/onboarding");
  }, [auth, router]);

  if (!auth.user) return null;

  const unreadNotif = notifications.filter(
    (n) => n.user_id === auth.user!.id && !n.read
  ).length;

  const discover = profiles
    .filter((p) => p.id !== auth.user!.id && p.role !== "admin" && !p.is_suspended)
    .slice(0, 8);

  const recommended = opportunities
    .filter((o) => o.status === "open")
    .map((o) => ({ ...o, ...getMatchScore(o) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-5xl pb-above-nav md:grid md:gap-8 md:px-4 md:py-8 lg:grid-cols-[1fr_280px] md:pb-8">
      <div className="min-w-0">
        {/* Mobile header */}
        <header className="safe-top sticky top-0 z-30 border-b border-[var(--border)] bg-canvas/90 backdrop-blur-xl md:hidden">
          <div className="flex h-14 items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-playce-teal text-sm font-extrabold text-white">
                P
              </div>
              <span className="text-lg font-bold tracking-tight">PLAYCE</span>
            </div>
            <div className="flex items-center gap-1">
              <Link
                href="/search"
                className="rounded-full p-2.5 text-ink hover:bg-ink/[0.04]"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </Link>
              <Link
                href="/notifications"
                className="relative rounded-full p-2.5 text-ink hover:bg-ink/[0.04]"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadNotif > 0 && (
                  <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-playce-teal" />
                )}
              </Link>
              <SignalHud compact />
            </div>
          </div>
        </header>

        {/* Desktop title */}
        <div className="mb-6 hidden items-end justify-between gap-4 md:flex">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("feed.title")}</h1>
            <p className="mt-1 text-sm text-slate-muted">
              {t("feed.welcomePrefix")} {auth.user.full_name.split(" ")[0]}
              {" — "}
              {t(`roles.${auth.user.role}`)}
            </p>
          </div>
          <Link href="/publish">
            <Button size="sm">{t("common.publish")}</Button>
          </Link>
        </div>

        {/* Discover strip */}
        <section className="border-b border-[var(--border)] bg-surface px-4 py-4 md:mb-6 md:rounded-3xl md:border md:py-5">
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
          <div className="mx-4 mt-4 space-y-3 rounded-3xl border border-playce-teal/20 bg-playce-teal/[0.06] p-4 md:mx-0">
            <CompletenessBar value={auth.user.completeness} />
            <p className="text-sm text-slate-muted">{t("feed.completeHint")}</p>
            <Link href="/profile/edit">
              <Button size="sm" variant="outline">
                {t("feed.completeProfile")}
              </Button>
            </Link>
          </div>
        )}

        {/* Mobile: top opportunity teaser */}
        {recommended[0] && (
          <div className="mx-4 mt-4 md:hidden">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-muted">
              {t("feed.recommended")}
            </p>
            <OpportunityCard
              opportunity={recommended[0]}
              matchScore={recommended[0].score}
            />
          </div>
        )}

        {/* Feed scroll */}
        <div className="mt-4 space-y-0 md:mt-6 md:space-y-5">
          {posts.length === 0 ? (
            <p className="px-4 py-12 text-center text-slate-muted">{t("feed.empty")}</p>
          ) : (
            posts.map((post, i) => (
              <div key={post.id} className="md:overflow-hidden md:rounded-3xl md:border md:border-[var(--border)]">
                <PostCard post={post} index={i} />
              </div>
            ))
          )}
        </div>
      </div>

      <aside className="hidden space-y-6 lg:block">
        <Card className="space-y-3 border-playce-teal/20 bg-playce-teal/[0.05]">
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
