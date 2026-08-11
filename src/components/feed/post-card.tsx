"use client";

import Link from "next/link";
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  BadgeCheck,
  Flag,
} from "lucide-react";
import { Avatar } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, Textarea } from "@/components/ui/input";
import { useDemo } from "@/lib/demo-store";
import type { Post } from "@/lib/types";
import { cn, formatRelativeDate } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { useState } from "react";
import { track } from "@/lib/analytics";

export function PostCard({ post, index = 0 }: { post: Post; index?: number }) {
  const { toggleLike, addComment, comments, createReport } = useDemo();
  const { locale, t } = useI18n();
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reason, setReason] = useState("spam");
  const [details, setDetails] = useState("");
  const [reported, setReported] = useState(false);
  const postComments = comments.filter((c) => c.post_id === post.id);
  const author = post.author;

  if (!author) return null;

  const isVideo =
    post.media_url?.startsWith("data:video") || post.media_url?.endsWith(".mp4");

  return (
    <article
      className="animate-soft-in overflow-hidden border-b border-[var(--border)] bg-surface"
      style={{ animationDelay: `${Math.min(index, 6) * 0.06}s` }}
    >
      <div className="relative flex items-center justify-between gap-3 px-4 pt-4">
        <Link href={`/p/${author.handle}`} className="flex min-w-0 items-center gap-3">
          <Avatar src={author.avatar_url} name={author.full_name} />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-sm font-semibold tracking-tight">
                {author.full_name}
              </p>
              {author.identity_verified && (
                <BadgeCheck className="h-4 w-4 shrink-0 text-playce-teal" />
              )}
            </div>
            <p className="text-xs text-slate-muted">
              {formatRelativeDate(post.created_at, locale)}
            </p>
          </div>
        </Link>
        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="rounded-full p-2 text-slate-muted hover:bg-ink/[0.04]"
            aria-label="More"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 z-20 mt-1 w-40 overflow-hidden rounded-2xl border border-[var(--border)] bg-surface shadow-lg">
              <button
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-danger hover:bg-ink/[0.04]"
                onClick={() => {
                  setMenuOpen(false);
                  setReportOpen(true);
                }}
              >
                <Flag className="h-4 w-4" />
                {t("common.report")}
              </button>
            </div>
          )}
        </div>
      </div>

      {post.media_url && (
        <div className="relative mt-3 aspect-[4/5] w-full max-h-[70dvh] bg-surface-2 sm:aspect-[16/10] sm:max-h-none">
          {isVideo ? (
            <video
              src={post.media_url}
              className="h-full w-full object-cover"
              controls
              playsInline
              muted
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.media_url}
              alt=""
              className="h-full w-full object-cover"
            />
          )}
        </div>
      )}

      <div className="space-y-3 px-4 py-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => toggleLike(post.id)}
            className="rounded-full p-2 text-ink transition hover:bg-ink/[0.04] active:scale-90"
            aria-label="Like"
          >
            <Heart
              className={cn(
                "h-6 w-6",
                post.liked_by_me && "fill-playce-teal text-playce-teal"
              )}
            />
          </button>
          <button
            onClick={() => setShowComments((s) => !s)}
            className="rounded-full p-2 text-ink transition hover:bg-ink/[0.04] active:scale-90"
            aria-label="Comment"
          >
            <MessageCircle className="h-6 w-6" />
          </button>
          <button
            className="rounded-full p-2 text-ink transition hover:bg-ink/[0.04] active:scale-90"
            aria-label="Share"
          >
            <Share2 className="h-6 w-6" />
          </button>
        </div>

        {post.likes_count > 0 && (
          <p className="text-sm font-semibold tabular-nums">
            {post.likes_count} like{post.likes_count > 1 ? "s" : ""}
          </p>
        )}

        <div className="space-y-1">
          <p className="text-[15px] leading-relaxed">
            <Link
              href={`/p/${author.handle}`}
              className="mr-1.5 font-semibold tracking-tight"
            >
              {author.handle}
            </Link>
            {post.content}
          </p>
          {post.hashtags.length > 0 && (
            <p className="text-sm text-playce-teal">
              {post.hashtags.map((h) => `#${h}`).join(" ")}
            </p>
          )}
        </div>

        {post.comments_count > 0 && !showComments && (
          <button
            onClick={() => setShowComments(true)}
            className="text-sm text-slate-muted"
          >
            Voir les {post.comments_count} commentaires
          </button>
        )}
      </div>

      {showComments && (
        <div className="space-y-3 border-t border-[var(--border)] px-4 py-3">
          {postComments.map((c) => (
            <div key={c.id} className="flex gap-2.5">
              <Avatar
                src={c.author?.avatar_url}
                name={c.author?.full_name ?? "?"}
                size="sm"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-snug">
                  <span className="font-semibold">{c.author?.full_name}</span>{" "}
                  {c.content}
                </p>
              </div>
            </div>
          ))}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!comment.trim()) return;
              addComment(post.id, comment.trim());
              setComment("");
            }}
            className="flex gap-2"
          >
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t("feed.comment")}
              className="flex-1 rounded-full border border-[var(--border)] bg-canvas px-4 py-2.5 text-sm outline-none focus:border-playce-teal/40"
            />
            <button
              type="submit"
              className="px-2 text-sm font-semibold text-playce-teal disabled:opacity-40"
              disabled={!comment.trim()}
            >
              {t("feed.send")}
            </button>
          </form>
        </div>
      )}

      {reportOpen && (
        <div className="space-y-3 border-t border-[var(--border)] px-4 py-4">
          {reported ? (
            <p className="text-sm text-playce-teal">{t("report.success")}</p>
          ) : (
            <>
              <p className="text-sm font-semibold">{t("report.title")}</p>
              <Select
                label={t("report.reason")}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                options={[
                  "spam",
                  "harassment",
                  "fake",
                  "inappropriate",
                  "scam",
                  "other",
                ].map((r) => ({
                  value: r,
                  label: t(`report.reasons.${r}`),
                }))}
              />
              <Textarea
                label={t("report.details")}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    createReport({
                      target_type: "post",
                      target_id: post.id,
                      reason,
                      details: details || null,
                    });
                    track("report_created", { target: "post" });
                    setReported(true);
                  }}
                >
                  {t("report.submit")}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setReportOpen(false)}>
                  {t("common.cancel")}
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </article>
  );
}
