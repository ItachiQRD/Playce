"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { useDemo } from "@/lib/demo-store";
import { useI18n } from "@/lib/i18n";
import { Avatar, Badge, Card, EmptyState } from "@/components/ui/card";
import { Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatRelativeDate } from "@/lib/utils";

export default function CommentsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { t, locale } = useI18n();
  const { auth, posts, comments, addComment } = useDemo();

  const post = useMemo(
    () => posts.find((p) => p.id === params.id),
    [posts, params.id]
  );

  const postComments = useMemo(() => {
    if (!post) return [];
    return comments
      .filter((c) => c.post_id === post.id)
      .sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
  }, [comments, post]);

  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!auth.user) {
      router.replace("/auth/login");
      return;
    }
  }, [auth.user, router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [postComments.length]);

  if (!auth.user) return null;

  if (!post) {
    return (
      <div className="min-h-[100dvh] px-4 py-12">
        <EmptyState title={t("comments.notFound")} />
      </div>
    );
  }

  const author = post.author;

  return (
    <div className="chat-shell mx-auto flex w-full max-w-xl flex-col overflow-hidden bg-canvas">
      <header className="safe-top flex shrink-0 items-center gap-3 border-b border-[var(--border)] bg-surface px-4 py-3">
        <Link href="/feed" className="rounded-lg p-1 hover:bg-ink/[0.04]">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-bold">{t("comments.title")}</p>
          <p className="truncate text-xs text-slate-muted">
            {t("comments.aboutPost")}
          </p>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 overscroll-contain">
        <Card className="mb-4 rounded-3xl border border-[var(--border)] bg-surface">
          <div className="flex items-start justify-between gap-3 p-4">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar src={author?.avatar_url} name={author?.full_name ?? "?"} />
              <div className="min-w-0">
                <p className="truncate font-semibold">{author?.full_name}</p>
                <p className="truncate text-xs text-slate-muted">
                  {formatRelativeDate(post.created_at, locale)}
                </p>
              </div>
            </div>
            <Badge variant="teal">{post.type}</Badge>
          </div>
          <div className="px-4 pb-4">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{post.content}</p>
            {post.hashtags.length > 0 && (
              <p className="mt-2 text-sm text-playce-teal">
                {post.hashtags.map((h) => `#${h}`).join(" ")}
              </p>
            )}
          </div>
        </Card>

        {postComments.length === 0 ? (
          <EmptyState
            title={t("comments.empty")}
            description={t("comments.emptyHint")}
          />
        ) : (
          <div className="space-y-3">
            {postComments.map((c) => (
              <div key={c.id} className="flex items-start gap-3">
                <Avatar
                  src={c.author?.avatar_url}
                  name={c.author?.full_name ?? "?"}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold">
                      {c.author?.full_name}
                    </p>
                    <p className="shrink-0 text-[10px] text-slate-muted">
                      {formatRelativeDate(c.created_at, locale)}
                    </p>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">
                    {c.content}
                  </p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) return;
          addComment(post.id, text.trim());
          setText("");
        }}
        className="safe-bottom flex shrink-0 gap-2 border-t border-[var(--border)] bg-surface px-4 py-3"
      >
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("comments.placeholder")}
          className="min-h-[44px] rounded-2xl bg-canvas"
        />
        <Button type="submit" className="h-12 w-12 rounded-2xl p-0" size="icon">
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
}

