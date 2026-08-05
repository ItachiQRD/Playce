"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDemo } from "@/lib/demo-store";
import { useI18n } from "@/lib/i18n";
import { Avatar, EmptyState, Card } from "@/components/ui/card";
import { formatRelativeDate } from "@/lib/utils";

export default function MessagesPage() {
  const { auth, conversations } = useDemo();
  const { t, locale } = useI18n();
  const router = useRouter();

  if (!auth.user) {
    router.replace("/auth/login");
    return null;
  }

  const mine = conversations
    .filter((c) => c.participant_ids.includes(auth.user!.id))
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );

  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <h1 className="mb-6 font-display text-2xl font-bold">{t("messages.title")}</h1>

      {mine.length === 0 ? (
        <EmptyState
          title={t("messages.empty")}
          description="Candidez à une opportunité ou contactez un profil pour démarrer."
        />
      ) : (
        <div className="space-y-2">
          {mine.map((c) => {
            const other = c.participants?.find((p) => p.id !== auth.user!.id);
            return (
              <Link key={c.id} href={`/messages/${c.id}`}>
                <Card className="flex items-center gap-3 transition hover:border-playce-teal/30">
                  <Avatar
                    src={other?.avatar_url}
                    name={other?.full_name ?? "?"}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate font-medium">{other?.full_name}</p>
                      <span className="shrink-0 text-[10px] text-slate-muted">
                        {formatRelativeDate(c.updated_at, locale)}
                      </span>
                    </div>
                    <p className="truncate text-sm text-slate-muted">
                      {c.last_message?.content ?? "…"}
                    </p>
                  </div>
                  {(c.unread_count ?? 0) > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-playce-teal px-1 text-[10px] font-bold text-playce-black">
                      {c.unread_count}
                    </span>
                  )}
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
