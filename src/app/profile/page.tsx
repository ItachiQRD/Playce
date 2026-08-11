"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useDemo } from "@/lib/demo-store";
import { SportsIdView } from "@/components/profile/sports-id-view";
import { SignalPanel } from "@/components/signal/signal-panel";
import { cn } from "@/lib/utils";
import Link from "next/link";

function ProfileInner() {
  const { auth } = useDemo();
  const router = useRouter();
  const params = useSearchParams();
  const tab = params.get("tab") === "signal" ? "signal" : "id";

  if (!auth.user) {
    router.replace("/auth/login");
    return null;
  }

  return (
    <div className="py-0 md:py-6">
      <div className="sticky top-14 z-30 border-b border-[var(--border)] bg-canvas/90 backdrop-blur-xl md:static md:border-0 md:bg-transparent md:backdrop-blur-none">
        <div className="mx-auto flex max-w-3xl gap-2 px-4 py-3">
          <Link
            href="/profile"
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium",
              tab === "id"
                ? "bg-playce-teal text-white"
                : "bg-surface text-slate-muted"
            )}
          >
            Sports ID
          </Link>
          <Link
            href="/profile?tab=signal"
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium",
              tab === "signal"
                ? "bg-playce-teal text-white"
                : "bg-surface text-slate-muted"
            )}
          >
            Signal
          </Link>
        </div>
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
