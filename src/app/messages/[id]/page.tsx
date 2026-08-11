"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Send, ArrowLeft } from "lucide-react";
import { useDemo } from "@/lib/demo-store";
import { useI18n } from "@/lib/i18n";
import { Avatar } from "@/components/ui/card";
import { formatRelativeDate } from "@/lib/utils";

export default function ConversationPage() {
  const params = useParams<{ id: string }>();
  const { auth, conversations, messages, sendMessage } = useDemo();
  const { t, locale } = useI18n();
  const router = useRouter();
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const conv = conversations.find((c) => c.id === params.id);
  const thread = messages
    .filter((m) => m.conversation_id === params.id)
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [thread.length]);

  if (!auth.user) {
    router.replace("/auth/login");
    return null;
  }

  if (!conv) {
    return (
      <div className="px-4 py-12 text-center text-slate-muted">
        {t("messages.notFound")}
      </div>
    );
  }

  const other = conv.participants?.find((p) => p.id !== auth.user!.id);

  return (
    <div className="chat-shell mx-auto flex w-full max-w-xl flex-col overflow-hidden bg-playce-dark">
      <div className="safe-top flex shrink-0 items-center gap-3 border-b border-[var(--border)] bg-surface px-4 py-3">
        <Link href="/messages" className="rounded-lg p-1.5 hover:bg-white/5">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <Link href={`/p/${other?.handle}`} className="flex min-w-0 items-center gap-3">
          <Avatar src={other?.avatar_url} name={other?.full_name ?? "?"} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-medium">{other?.full_name}</p>
            <p className="truncate text-xs text-slate-muted">@{other?.handle}</p>
          </div>
        </Link>
      </div>

      <div ref={listRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-5">
        {thread.map((m) => {
          const mine = m.sender_id === auth.user!.id;
          return (
            <div
              key={m.id}
              className={`flex ${mine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  mine
                    ? "bg-playce-teal text-white"
                    : "border border-[var(--border)] bg-canvas"
                }`}
              >
                <p className="break-words whitespace-pre-wrap">{m.content}</p>
                <p
                  className={`mt-1.5 text-[10px] ${
                    mine ? "text-white/70" : "text-slate-muted"
                  }`}
                >
                  {formatRelativeDate(m.created_at, locale)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) return;
          sendMessage(params.id, text.trim());
          setText("");
        }}
        className="safe-bottom flex shrink-0 gap-2 border-t border-[var(--border)] bg-surface px-3 py-3"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("messages.placeholder")}
          className="min-w-0 flex-1 rounded-2xl border border-[var(--border)] bg-canvas px-4 py-3 text-sm outline-none focus:border-playce-teal/50"
        />
        <button
          type="submit"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-playce-teal text-white"
          aria-label="Send"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}
