"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  BadgeCheck,
  Heart,
  MapPin,
  MessageCircle,
  Sparkles,
  Briefcase,
  ChevronUp,
} from "lucide-react";
import { useDemo } from "@/lib/demo-store";
import { useI18n } from "@/lib/i18n";
import { rankDiscoverFeed, type DiscoverItem } from "@/lib/discovery";
import { Avatar, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SignalHud } from "@/components/signal/signal-hud";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export function ImmersiveDiscover() {
  const {
    auth,
    posts,
    opportunities,
    profiles,
    toggleLike,
    awardSignal,
    getMatchScore,
  } = useDemo();
  const { locale, t } = useI18n();
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const touchY = useRef<number | null>(null);
  const discovered = useRef(0);

  const feed = useMemo(
    () =>
      rankDiscoverFeed({
        viewer: auth.user,
        posts,
        opportunities,
        profiles,
      }),
    [auth.user, posts, opportunities, profiles]
  );

  const current = feed[index];

  useEffect(() => {
    setExpanded(false);
    setAnimKey((k) => k + 1);
    if (current) {
      discovered.current += 1;
      if (discovered.current % 3 === 0) {
        awardSignal("discover", "discover");
      }
    }
  }, [index]); // eslint-disable-line react-hooks/exhaustive-deps

  const go = (dir: 1 | -1) => {
    setIndex((i) => {
      const next = i + dir;
      if (next < 0) return 0;
      if (next >= feed.length) return 0; // loop for addiction
      return next;
    });
  };

  if (!current) {
    return (
      <div className="flex h-[100dvh] items-center justify-center text-slate-muted">
        {t("feed.empty")}
      </div>
    );
  }

  return (
    <div
      className="relative h-[100dvh] overflow-hidden bg-playce-dark md:h-[calc(100dvh-3.5rem)]"
      onTouchStart={(e) => {
        touchY.current = e.touches[0].clientY;
      }}
      onTouchEnd={(e) => {
        if (touchY.current == null) return;
        const dy = touchY.current - e.changedTouches[0].clientY;
        if (dy > 48) go(1);
        if (dy < -48) go(-1);
        touchY.current = null;
      }}
      onWheel={(e) => {
        if (Math.abs(e.deltaY) < 25) return;
        go(e.deltaY > 0 ? 1 : -1);
      }}
    >
      <div className="safe-top absolute inset-x-0 top-0 z-20 flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-playce-teal/90 font-display text-sm font-bold text-playce-black">
            P
          </div>
          <div>
            <p className="font-display text-sm font-semibold tracking-wide">PLAYCE</p>
            <p className="text-[10px] text-white/50">
              {locale === "fr" ? "Pour toi" : "For you"}
            </p>
          </div>
        </div>
        <SignalHud compact />
      </div>

      <div key={animKey} className="animate-slide-card absolute inset-0">
        <DiscoverCard
          item={current}
          expanded={expanded}
          onExpand={() => setExpanded((e) => !e)}
          onLike={() => {
            if (current.kind === "post") toggleLike(current.data.id);
          }}
          onOpen={() => {
            if (current.kind === "post")
              router.push(`/p/${current.data.author?.handle}`);
            if (current.kind === "opportunity")
              router.push(`/opportunities/${current.data.id}`);
            if (current.kind === "profile")
              router.push(`/p/${current.data.handle}`);
          }}
          matchScore={
            current.kind === "opportunity"
              ? getMatchScore(current.data).score
              : undefined
          }
          locale={locale}
          t={t}
        />
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-28 z-20 flex flex-col items-center gap-1 text-white/40 md:bottom-10">
        <ChevronUp className="h-4 w-4 animate-bounce" />
        <span className="text-[10px] tracking-widest uppercase">
          {locale === "fr" ? "Glisse" : "Swipe"}
        </span>
      </div>

      {/* progress dots */}
      <div className="absolute right-3 top-1/2 z-20 flex -translate-y-1/2 flex-col gap-1.5">
        {feed.slice(0, 8).map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-1 rounded-full transition-all",
              i === index % 8 ? "h-6 bg-playce-teal" : "h-1.5 bg-white/25"
            )}
          />
        ))}
      </div>
    </div>
  );
}

function DiscoverCard({
  item,
  expanded,
  onExpand,
  onLike,
  onOpen,
  matchScore,
  locale,
  t,
}: {
  item: DiscoverItem;
  expanded: boolean;
  onExpand: () => void;
  onLike: () => void;
  onOpen: () => void;
  matchScore?: number;
  locale: string;
  t: (k: string) => string;
}) {
  if (item.kind === "post") {
    const post = item.data;
    const author = post.author!;
    const media = post.media_url;
    const isVideo = media?.startsWith("data:video");

    return (
      <div className="relative h-full w-full">
        {media ? (
          isVideo ? (
            <video
              src={media}
              className="absolute inset-0 h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={media} alt="" className="absolute inset-0 h-full w-full object-cover" />
          )
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(0,184,148,0.35),transparent_50%),radial-gradient(ellipse_at_80%_80%,rgba(37,99,235,0.3),transparent_45%),#05070D]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/50" />

        <div className="absolute inset-x-0 bottom-0 z-10 space-y-4 px-5 pb-40 pt-10 md:pb-16">
          <Badge variant="teal" className="backdrop-blur">
            {post.type}
          </Badge>
          <button onClick={onOpen} className="flex items-center gap-3 text-left">
            <Avatar src={author.avatar_url} name={author.full_name} />
            <div>
              <div className="flex items-center gap-1">
                <p className="font-semibold">{author.full_name}</p>
                {author.identity_verified && (
                  <BadgeCheck className="h-4 w-4 text-playce-teal" />
                )}
              </div>
              <p className="text-xs text-white/60">@{author.handle}</p>
            </div>
          </button>

          <p
            className={cn(
              "text-base leading-relaxed transition-all",
              expanded ? "" : "line-clamp-2"
            )}
            onClick={onExpand}
          >
            {post.content}
          </p>

          {expanded && (
            <div className="flex flex-wrap gap-2 animate-fade-up" style={{ animationDelay: "0s", opacity: 1 }}>
              {post.hashtags.map((h) => (
                <span key={h} className="text-xs text-playce-teal">
                  #{h}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={onLike}
              className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur"
            >
              <Heart
                className={cn("h-5 w-5", post.liked_by_me && "fill-danger text-danger")}
              />
              {post.likes_count}
            </button>
            <button
              onClick={onExpand}
              className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur"
            >
              <MessageCircle className="h-5 w-5" />
              {post.comments_count}
            </button>
            <Button size="sm" onClick={onOpen} className="ml-auto">
              Sports ID
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (item.kind === "opportunity") {
    const opp = item.data;
    return (
      <div className="relative h-full w-full bg-playce-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.35),transparent_55%),#05070D]" />
        <div className="absolute inset-0 flex flex-col justify-end px-5 pb-40 md:pb-16">
          <div className="mb-auto mt-28 space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-electric-blue/40 bg-electric-blue/15 px-3 py-1 text-xs text-electric-blue">
              <Briefcase className="h-3.5 w-3.5" />
              {opp.type === "offer" ? t("opportunities.offers") : t("opportunities.demands")}
            </div>
            <h2 className="font-display text-3xl font-bold leading-tight">{opp.title}</h2>
            <p className="flex items-center gap-1 text-sm text-slate-muted">
              <MapPin className="h-4 w-4" />
              {[opp.city, opp.country].filter(Boolean).join(", ") || "—"}
            </p>
            {matchScore != null && (
              <div className="flex h-16 w-16 flex-col items-center justify-center rounded-2xl border border-electric-blue/30 bg-electric-blue/10">
                <span className="font-display text-xl font-bold text-electric-blue">
                  {matchScore}
                </span>
                <span className="text-[9px] uppercase text-electric-blue/80">Match</span>
              </div>
            )}
          </div>

          <p
            className={cn(
              "mb-4 text-sm text-white/75",
              expanded ? "" : "line-clamp-3"
            )}
            onClick={onExpand}
          >
            {opp.description}
          </p>
          <Button size="lg" onClick={onOpen} className="w-full">
            {locale === "fr" ? "Voir l'opportunité" : "View opportunity"}
          </Button>
        </div>
      </div>
    );
  }

  const profile = item.data;
  return (
    <div className="relative h-full w-full">
      {profile.cover_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={profile.cover_url}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,184,148,0.25),#05070D)]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/30" />
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center px-6 pb-40 text-center md:pb-16">
        <Avatar src={profile.avatar_url} name={profile.full_name} size="xl" />
        <div className="mt-5 flex items-center gap-1">
          <h2 className="font-display text-2xl font-bold">{profile.full_name}</h2>
          {profile.identity_verified && (
            <BadgeCheck className="h-5 w-5 text-playce-teal" />
          )}
        </div>
        <p className="mt-1 text-sm text-slate-muted">
          {t(`roles.${profile.role}`)}
          {profile.city ? ` · ${profile.city}` : ""}
        </p>
        <p className="mt-4 line-clamp-2 max-w-sm text-sm text-white/70">
          {profile.bio || (locale === "fr" ? "Talent à découvrir" : "Talent to discover")}
        </p>
        <div className="mt-6 flex gap-2">
          <Button onClick={onOpen}>
            <Sparkles className="h-4 w-4" />
            Sports ID
          </Button>
        </div>
      </div>
    </div>
  );
}
