"use client";

import Link from "next/link";
import { Bell, Search, ArrowRight } from "lucide-react";
import { useDemo } from "@/lib/demo-store";
import { useI18n } from "@/lib/i18n";
import { PostCard } from "@/components/feed/post-card";
import { Avatar, Badge, CompletenessBar } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SignalHud } from "@/components/signal/signal-hud";

export function MobileHomeFeed() {
  const { auth, posts, profiles, opportunities, notifications, getMatchScore } =
    useDemo();
  const { t, locale } = useI18n();

  if (!auth.user) return null;

  const unread = notifications.filter(
    (n) => n.user_id === auth.user!.id && !n.read
  ).length;

  const discover = profiles
    .filter(
      (p) => p.id !== auth.user!.id && p.role !== "admin" && !p.is_suspended
    )
    .slice(0, 8);

  const topOps = opportunities
    .filter((o) => o.status === "open")
    .map((o) => ({ ...o, ...getMatchScore(o) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  const firstName = auth.user.full_name.split(" ")[0];

  return (
    <div className="feed-atmosphere min-h-[100dvh] pb-above-nav">
      <header className="safe-top sticky top-0 z-30 border-b border-white/[0.05] bg-playce-dark/80 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/35">
              PLAYCE
            </p>
            <h1 className="text-lg font-semibold tracking-tight">
              {locale === "fr" ? `Salut, ${firstName}` : `Hey, ${firstName}`}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <SignalHud compact />
            <Link
              href="/search"
              className="rounded-full bg-white/[0.04] p-2.5 text-white/70 transition hover:bg-white/[0.08] hover:text-white"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Link>
            <Link
              href="/notifications"
              className="relative rounded-full bg-white/[0.04] p-2.5 text-white/70 transition hover:bg-white/[0.08] hover:text-white"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unread > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-playce-teal" />
              )}
            </Link>
          </div>
        </div>
      </header>

      <div className="space-y-8 pt-4">
        {auth.user.completeness < 80 && (
          <section className="animate-rise-in mx-4 rounded-3xl border border-playce-teal/20 bg-playce-teal/[0.06] p-4">
            <CompletenessBar value={auth.user.completeness} />
            <p className="mt-3 text-sm text-white/60">{t("feed.completeHint")}</p>
            <Link href="/profile/edit" className="mt-3 inline-block">
              <Button size="sm">{t("feed.completeProfile")}</Button>
            </Link>
          </section>
        )}

        <section className="animate-rise-in" style={{ animationDelay: "0.05s" }}>
          <div className="mb-3 flex items-end justify-between px-4">
            <h2 className="text-sm font-semibold text-white/90">
              {t("feed.discover")}
            </h2>
            <Link href="/search" className="text-xs font-medium text-playce-teal">
              {t("common.seeAll")}
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {discover.map((p) => (
              <Link
                key={p.id}
                href={`/p/${p.handle}`}
                className="group w-[72px] shrink-0 text-center"
              >
                <div className="mx-auto mb-2 transition group-active:scale-95">
                  <Avatar
                    src={p.avatar_url}
                    name={p.full_name}
                    size="lg"
                    className="ring-1 ring-white/15"
                  />
                </div>
                <p className="truncate text-[11px] text-white/70">
                  {p.full_name.split(" ")[0]}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {topOps.length > 0 && (
          <section className="animate-rise-in" style={{ animationDelay: "0.1s" }}>
            <div className="mb-3 flex items-end justify-between px-4">
              <h2 className="text-sm font-semibold text-white/90">
                {t("feed.recommended")}
              </h2>
              <Link
                href="/opportunities"
                className="text-xs font-medium text-playce-teal"
              >
                {t("common.seeAll")}
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {topOps.map((o) => (
                <Link
                  key={o.id}
                  href={`/opportunities/${o.id}`}
                  className="w-[260px] shrink-0 rounded-3xl border border-white/[0.06] bg-surface p-4 transition active:scale-[0.98]"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <Badge variant={o.type === "offer" ? "teal" : "blue"}>
                      {o.type === "offer"
                        ? t("opportunities.offers")
                        : t("opportunities.demands")}
                    </Badge>
                    <span className="text-xs font-semibold tabular-nums text-playce-teal">
                      {o.score}%
                    </span>
                  </div>
                  <p className="line-clamp-2 text-[15px] font-medium leading-snug">
                    {o.title}
                  </p>
                  <p className="mt-2 truncate text-xs text-slate-muted">
                    {o.organization || o.author?.full_name}
                    {o.city ? ` · ${o.city}` : ""}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-white/75">
                    {locale === "fr" ? "Voir" : "View"}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="mb-1 px-4 text-sm font-semibold text-white/90">
            {t("feed.title")}
          </h2>
          {posts.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-slate-muted">
              {t("feed.empty")}
            </p>
          ) : (
            <div className="divide-y divide-white/[0.05]">
              {posts.map((post, i) => (
                <div
                  key={post.id}
                  className="animate-rise-in"
                  style={{ animationDelay: `${Math.min(i, 6) * 0.05}s` }}
                >
                  <PostCard post={post} />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
