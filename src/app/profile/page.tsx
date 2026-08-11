"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useDemo } from "@/lib/demo-store";
import { SportsIdView } from "@/components/profile/sports-id-view";
import { SignalPanel } from "@/components/signal/signal-panel";
import { cn } from "@/lib/utils";
import Link from "next/link";

function ProfileTabs({
  tab,
  overlay = false,
}: {
  tab: "id" | "signal";
  overlay?: boolean;
}) {
  return (
    <div
      className={cn(
        "z-30 flex gap-2",
        overlay ? "absolute inset-x-0 top-0 px-4 pt-3" : "gap-2"
      )}
    >
      <Link
        href="/profile"
        className={cn(
          "rounded-full px-4 py-1.5 text-sm font-medium backdrop-blur-md",
          tab === "id"
            ? "bg-playce-teal text-white"
            : overlay
              ? "bg-black/35 text-white"
              : "glass-chip text-slate-muted"
        )}
      >
        Sports ID
      </Link>
      <Link
        href="/profile?tab=signal"
        className={cn(
          "rounded-full px-4 py-1.5 text-sm font-medium backdrop-blur-md",
          tab === "signal"
            ? "bg-playce-teal text-white"
            : overlay
              ? "bg-black/35 text-white"
              : "glass-chip text-slate-muted"
        )}
      >
        Signal
      </Link>
    </div>
  );
}

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
    <div className="md:py-6">
      {tab === "signal" ? (
        <>
          <div className="border-b border-[var(--border)] px-4 py-3 md:mx-auto md:max-w-5xl md:border-0 md:px-6 md:pb-0">
            <ProfileTabs tab={tab} />
          </div>
          <div className="mx-auto max-w-5xl px-4 py-5 md:px-6 md:py-6">
            <SignalPanel />
          </div>
        </>
      ) : (
        <div className="relative">
          <div className="md:hidden">
            <ProfileTabs tab={tab} overlay />
          </div>
          <div className="mb-4 hidden px-6 md:block">
            <div className="mx-auto max-w-5xl">
              <ProfileTabs tab={tab} />
            </div>
          </div>
          <SportsIdView profile={auth.user} isOwn />
        </div>
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
