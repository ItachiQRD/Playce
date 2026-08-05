"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Heart, MessageCircle, Share2, BadgeCheck, Volume2, VolumeX } from "lucide-react";
import { useDemo } from "@/lib/demo-store";
import { useI18n } from "@/lib/i18n";
import { Avatar } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";

export default function ReelsPage() {
  const { posts, toggleLike } = useDemo();
  const { t } = useI18n();
  const reels = posts.filter((p) => p.type === "reel" || p.type === "highlight");
  const [index, setIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const touchY = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const current = reels[index];
  const isVideo =
    !!current?.media_url &&
    (current.media_url.startsWith("data:video") ||
      current.media_url.includes(".mp4") ||
      current.media_url.includes("video"));

  const next = useCallback(() => {
    setIndex((i) => Math.min(i + 1, reels.length - 1));
  }, [reels.length]);

  const prev = useCallback(() => {
    setIndex((i) => Math.max(i - 1, 0));
  }, []);

  useEffect(() => {
    if (current) track("reel_view", { id: current.id });
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => undefined);
    }
  }, [current?.id]);

  if (reels.length === 0) {
    return (
      <div className="flex min-h-[70dvh] items-center justify-center px-4 text-slate-muted">
        {t("reels.empty")}
      </div>
    );
  }

  if (!current?.author) return null;

  return (
    <div
      className="relative mx-auto h-[calc(100dvh-3.5rem)] max-w-lg overflow-hidden bg-playce-black"
      onTouchStart={(e) => {
        touchY.current = e.touches[0].clientY;
      }}
      onTouchEnd={(e) => {
        if (touchY.current == null) return;
        const dy = touchY.current - e.changedTouches[0].clientY;
        if (dy > 50) next();
        if (dy < -50) prev();
        touchY.current = null;
      }}
      onWheel={(e) => {
        if (e.deltaY > 30) next();
        if (e.deltaY < -30) prev();
      }}
    >
      {isVideo ? (
        <video
          ref={videoRef}
          key={current.id}
          src={current.media_url!}
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          loop
          playsInline
          muted={muted}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={current.media_url || current.thumbnail_url || ""}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

      <div className="absolute right-3 top-1/2 z-10 flex -translate-y-1/2 flex-col items-center gap-4">
        <button
          onClick={() => toggleLike(current.id)}
          className="flex flex-col items-center gap-1 text-white"
        >
          <div className="rounded-full bg-black/40 p-3 backdrop-blur">
            <Heart
              className={`h-6 w-6 ${current.liked_by_me ? "fill-danger text-danger" : ""}`}
            />
          </div>
          <span className="text-xs">{current.likes_count}</span>
        </button>
        <div className="flex flex-col items-center gap-1 text-white">
          <div className="rounded-full bg-black/40 p-3 backdrop-blur">
            <MessageCircle className="h-6 w-6" />
          </div>
          <span className="text-xs">{current.comments_count}</span>
        </div>
        <button className="rounded-full bg-black/40 p-3 text-white backdrop-blur">
          <Share2 className="h-6 w-6" />
        </button>
        <button
          onClick={() => setMuted((m) => !m)}
          className="rounded-full bg-black/40 p-3 text-white backdrop-blur"
        >
          {muted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
        </button>
      </div>

      <div className="absolute inset-x-0 bottom-20 z-10 space-y-3 p-4 md:bottom-8">
        <Link href={`/p/${current.author.handle}`} className="flex items-center gap-3">
          <Avatar src={current.author.avatar_url} name={current.author.full_name} />
          <div>
            <div className="flex items-center gap-1">
              <p className="font-semibold">{current.author.full_name}</p>
              {current.author.identity_verified && (
                <BadgeCheck className="h-4 w-4 text-playce-teal" />
              )}
            </div>
            <p className="text-xs text-white/70">@{current.author.handle}</p>
          </div>
        </Link>
        <p className="text-sm leading-relaxed">{current.content}</p>
        <div className="flex flex-wrap gap-2">
          {current.hashtags.map((h) => (
            <span key={h} className="text-xs text-playce-teal">
              #{h}
            </span>
          ))}
        </div>
        <Link href={`/p/${current.author.handle}`}>
          <Button size="sm" className="mt-2">
            {t("reels.cta")}
          </Button>
        </Link>
      </div>

      <div className="absolute left-1/2 top-4 z-10 flex -translate-x-1/2 gap-1">
        {reels.map((_, i) => (
          <div
            key={i}
            className={`h-1 w-8 rounded-full ${
              i === index ? "bg-playce-teal" : "bg-white/30"
            }`}
          />
        ))}
      </div>

      <button
        className="absolute left-0 top-0 z-[5] h-full w-1/3"
        onClick={prev}
        aria-label="Previous"
      />
      <button
        className="absolute right-0 top-0 z-[5] h-full w-1/3"
        onClick={next}
        aria-label="Next"
      />
    </div>
  );
}
