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

  const conv = conversations.find((c) => c.id === params.id);
  const thread = messages
    .filter((m) => m.conversation_id === params.id)
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread.length]);

  if (!auth.user) {
    router.replace("/auth/login");
    return null;
  }

  if (!conv) {
    return (
      <div className="px-4 py-12 text-center text-slate-muted">
        Conversation introuvable
      </div>
    );
  }

  const other = conv.participants?.find((p) => p.id !== auth.user!.id);

  return (
    <div className="mx-auto flex h-[calc(100dvh-3.5rem)] max-w-xl flex-col md:h-[calc(100dvh-3.5rem)]">
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
        <Link href="/messages" className="rounded-lg p-1 hover:bg-white/5">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <Link
          href={`/p/${other?.handle}`}
          className="flex items-center gap-3"
        >
          <Avatar src={other?.avatar_url} name={other?.full_name ?? "?"} size="sm" />
          <div>
            <p className="font-medium">{other?.full_name}</p>
            <p className="text-xs text-slate-muted">@{other?.handle}</p>
          </div>
        </Link>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {thread.map((m) => {
          const mine = m.sender_id === auth.user!.id;
          return (
            <div
              key={m.id}
              className={`flex ${mine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                  mine
                    ? "bg-playce-teal text-playce-black"
                    : "bg-surface border border-white/10"
                }`}
              >
                <p>{m.content}</p>
                <p
                  className={`mt-1 text-[10px] ${
                    mine ? "text-playce-black/60" : "text-slate-muted"
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
        className="safe-bottom flex gap-2 border-t border-white/10 p-3"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("messages.placeholder")}
          className="flex-1 rounded-2xl border border-white/10 bg-playce-black/60 px-4 py-3 text-sm outline-none focus:border-playce-teal/50"
        />
        <button
          type="submit"
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-playce-teal text-playce-black"
          aria-label="Send"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}
