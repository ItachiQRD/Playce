"use client";

import Link from "next/link";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  MoreHorizontal,
  BadgeCheck,
  Flag,
} from "lucide-react";
import { Avatar, Badge, Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, Textarea } from "@/components/ui/input";
import { useDemo } from "@/lib/demo-store";
import type { Post } from "@/lib/types";
import { formatRelativeDate } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { useState } from "react";
import { track } from "@/lib/analytics";

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

  const isVideo = post.media_url?.startsWith("data:video") || post.media_url?.endsWith(".mp4");

  return (
    <Card className="space-y-3 overflow-hidden p-0">
      <div className="relative flex items-center justify-between gap-3 p-4 pb-0">
        <Link href={`/p/${author.handle}`} className="flex min-w-0 items-center gap-3">
          <Avatar src={author.avatar_url} name={author.full_name} />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="truncate font-medium">{author.full_name}</p>
              {author.identity_verified && (
                <BadgeCheck className="h-4 w-4 shrink-0 text-playce-teal" />
              )}
            </div>
            <p className="text-xs text-slate-muted">
              @{author.handle} · {formatRelativeDate(post.created_at, locale)}
            </p>
          </div>
        </Link>
        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="rounded-lg p-1.5 text-slate-muted hover:bg-white/5"
            aria-label="More"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-xl border border-white/10 bg-playce-black shadow-xl">
              <button
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-danger hover:bg-white/5"
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

      <div className="space-y-2 px-4">
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="teal">{post.type}</Badge>
          {post.hashtags.map((h) => (
            <Badge key={h} variant="default">
              #{h}
            </Badge>
          ))}
        </div>
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{post.content}</p>
      </div>

      {post.media_url && (
        <div className="relative aspect-[16/10] w-full bg-playce-black">
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
            <img src={post.media_url} alt="" className="h-full w-full object-cover" />
          )}
        </div>
      )}

      <div className="flex items-center justify-between px-2 pb-2">
        <div className="flex items-center">
          <button
            onClick={() => toggleLike(post.id)}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm text-slate-muted transition hover:bg-white/5 hover:text-white"
          >
            <Heart
              className={`h-5 w-5 ${post.liked_by_me ? "fill-danger text-danger" : ""}`}
            />
            {post.likes_count}
          </button>
          <button
            onClick={() => setShowComments((s) => !s)}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm text-slate-muted transition hover:bg-white/5 hover:text-white"
          >
            <MessageCircle className="h-5 w-5" />
            {post.comments_count}
          </button>
        </div>
        <div className="flex items-center">
          <button
            className="rounded-xl p-2 text-slate-muted hover:bg-white/5 hover:text-white"
            aria-label="Save"
          >
            <Bookmark className="h-5 w-5" />
          </button>
          <button
            className="rounded-xl p-2 text-slate-muted hover:bg-white/5 hover:text-white"
            aria-label="Share"
          >
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {showComments && (
        <div className="space-y-3 border-t border-white/10 px-4 py-3">
          {postComments.map((c) => (
            <div key={c.id} className="flex gap-2">
              <Avatar
                src={c.author?.avatar_url}
                name={c.author?.full_name ?? "?"}
                size="sm"
              />
              <div className="rounded-2xl bg-white/5 px-3 py-2 text-sm">
                <p className="text-xs font-medium text-slate-muted">
                  {c.author?.full_name}
                </p>
                <p>{c.content}</p>
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
              className="flex-1 rounded-xl border border-white/10 bg-playce-black/50 px-3 py-2 text-sm outline-none focus:border-playce-teal/50"
            />
            <button
              type="submit"
              className="rounded-xl bg-playce-teal px-3 py-2 text-sm font-medium text-playce-black"
            >
              {t("feed.send")}
            </button>
          </form>
        </div>
      )}

      {reportOpen && (
        <div className="space-y-3 border-t border-white/10 px-4 py-4">
          {reported ? (
            <p className="text-sm text-playce-teal">{t("report.success")}</p>
          ) : (
            <>
              <p className="font-display text-sm font-semibold">{t("report.title")}</p>
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
    </Card>
  );
}
