"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDemo } from "@/lib/demo-store";
import { useI18n } from "@/lib/i18n";
import { Card, EmptyState, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatRelativeDate } from "@/lib/utils";

export default function NotificationsPage() {
  const {
    auth,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
  } = useDemo();
  const { t, locale } = useI18n();
  const router = useRouter();

  if (!auth.user) {
    router.replace("/auth/login");
    return null;
  }

  const mine = notifications
    .filter((n) => n.user_id === auth.user!.id)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

  return (
    <div className="mx-auto max-w-xl space-y-6 px-4 py-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold">
          {t("notifications.title")}
        </h1>
        {mine.some((n) => !n.read) && (
          <Button size="sm" variant="ghost" onClick={markAllNotificationsRead}>
            {t("notifications.markAll")}
          </Button>
        )}
      </div>

      {mine.length === 0 ? (
        <EmptyState title={t("notifications.empty")} />
      ) : (
        <div className="space-y-2">
          {mine.map((n) => (
            <Link
              key={n.id}
              href={n.link ?? "#"}
              onClick={() => markNotificationRead(n.id)}
            >
              <Card
                className={`transition hover:border-playce-teal/30 ${
                  !n.read ? "border-playce-teal/40 bg-playce-teal/5" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{n.title}</p>
                      <Badge variant="blue">{n.type}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-muted">{n.body}</p>
                    <p className="mt-2 text-[10px] text-slate-muted">
                      {formatRelativeDate(n.created_at, locale)}
                    </p>
                  </div>
                  {!n.read && (
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-playce-teal" />
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
