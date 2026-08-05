"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useDemo } from "@/lib/demo-store";
import { SportsIdView } from "@/components/profile/sports-id-view";
import { SignalPanel } from "@/components/signal/signal-panel";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";

function ProfileInner() {
  const { auth } = useDemo();
  const router = useRouter();
  const params = useSearchParams();
  const { locale } = useI18n();
  const tab = params.get("tab") === "signal" ? "signal" : "id";

  if (!auth.user) {
    router.replace("/auth/login");
    return null;
  }

  return (
    <div className="py-0 md:py-6">
      <div className="mx-auto flex max-w-3xl gap-2 px-4 pt-4">
        <Link
          href="/profile"
          className={cn(
            "rounded-full px-4 py-1.5 text-sm",
            tab === "id"
              ? "bg-playce-teal text-playce-black"
              : "bg-white/5 text-slate-muted"
          )}
        >
          Sports ID
        </Link>
        <Link
          href="/profile?tab=signal"
          className={cn(
            "rounded-full px-4 py-1.5 text-sm",
            tab === "signal"
              ? "bg-playce-teal text-playce-black"
              : "bg-white/5 text-slate-muted"
          )}
        >
          Signal
          {locale === "fr" ? "" : ""}
        </Link>
      </div>
      {tab === "signal" ? (
        <div className="mx-auto max-w-3xl px-4 py-6">
          <SignalPanel />
        </div>
      ) : (
        <SportsIdView profile={auth.user} isOwn />
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50dvh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-playce-teal border-t-transparent" />
        </div>
      }
    >
      <ProfileInner />
    </Suspense>
  );
}
