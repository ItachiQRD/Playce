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
import { Avatar, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, Textarea } from "@/components/ui/input";
import { useDemo } from "@/lib/demo-store";
import type { Post } from "@/lib/types";
import { formatRelativeDate } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { useState } from "react";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

export function PostCard({ post }: { post: Post }) {
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
    <article className="bg-transparent">
      <div className="flex items-center justify-between gap-3 px-4 pt-5 pb-3">
        <Link
          href={`/p/${author.handle}`}
          className="flex min-w-0 items-center gap-3"
        >
          <Avatar src={author.avatar_url} name={author.full_name} />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-[15px] font-semibold tracking-tight">
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
            className="rounded-full p-2 text-slate-muted hover:bg-white/5"
            aria-label="More"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-2xl border border-white/10 bg-surface-2 shadow-2xl">
              <button
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-danger hover:bg-white/5"
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
        <div className="relative aspect-[4/5] w-full bg-black sm:aspect-[16/10] sm:max-h-[520px]">
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

      <div className="space-y-3 px-4 pt-3 pb-5">
        <div className="flex items-center gap-1">
          <button
            onClick={() => toggleLike(post.id)}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-2.5 py-2 text-sm transition active:scale-95",
              post.liked_by_me ? "text-danger" : "text-white/70 hover:text-white"
            )}
            aria-label="Like"
          >
            <Heart
              className={cn("h-[22px] w-[22px]", post.liked_by_me && "fill-danger")}
            />
            <span className="tabular-nums">{post.likes_count}</span>
          </button>
          <button
            onClick={() => setShowComments((s) => !s)}
            className="flex items-center gap-1.5 rounded-full px-2.5 py-2 text-sm text-white/70 transition hover:text-white active:scale-95"
          >
            <MessageCircle className="h-[22px] w-[22px]" />
            <span className="tabular-nums">{post.comments_count}</span>
          </button>
          <button
            className="ml-auto rounded-full p-2 text-white/70 hover:text-white"
            aria-label="Share"
          >
            <Share2 className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-2">
          <Badge variant="teal" className="rounded-md px-2 py-0.5 text-[10px] uppercase tracking-wide">
            {post.type}
          </Badge>
          <p className="text-[15px] leading-relaxed text-white/90">
            <Link href={`/p/${author.handle}`} className="font-semibold">
              {author.handle}
            </Link>{" "}
            <span className="whitespace-pre-wrap font-normal">{post.content}</span>
          </p>
          {post.hashtags.length > 0 && (
            <p className="text-sm text-playce-teal/90">
              {post.hashtags.map((h) => `#${h}`).join("  ")}
            </p>
          )}
        </div>
      </div>

      {showComments && (
        <div className="space-y-3 border-t border-white/[0.05] px-4 py-4">
          {postComments.map((c) => (
            <div key={c.id} className="flex gap-2.5">
              <Avatar
                src={c.author?.avatar_url}
                name={c.author?.full_name ?? "?"}
                size="sm"
              />
              <div className="min-w-0 flex-1 rounded-2xl bg-white/[0.04] px-3 py-2 text-sm">
                <p className="text-xs font-medium text-slate-muted">
                  {c.author?.full_name}
                </p>
                <p className="text-white/90">{c.content}</p>
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
              className="min-w-0 flex-1 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm outline-none focus:border-playce-teal/40"
            />
            <button
              type="submit"
              className="rounded-full bg-playce-teal px-4 py-2 text-sm font-semibold text-playce-black"
            >
              {t("feed.send")}
            </button>
          </form>
        </div>
      )}

      {reportOpen && (
        <div className="space-y-3 border-t border-white/[0.05] px-4 py-4">
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
