"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useDemo } from "@/lib/demo-store";
import { getRank, getNextRank, rankProgress } from "@/lib/signal";
import { useI18n } from "@/lib/i18n";
import { Flame } from "lucide-react";

export function SignalToast() {
  const { lastSignalGain, clearSignalGain } = useDemo();

  useEffect(() => {
    if (!lastSignalGain) return;
    const t = setTimeout(clearSignalGain, 1100);
    return () => clearTimeout(t);
  }, [lastSignalGain, clearSignalGain]);

  if (!lastSignalGain) return null;

  return (
    <div className="pointer-events-none fixed left-1/2 top-20 z-[80] -translate-x-1/2 md:top-24">
      <div className="animate-signal-pop rounded-full bg-playce-teal px-4 py-2 text-sm font-bold text-white shadow-[0_8px_30px_rgba(255,79,26,0.4)]">
        +{lastSignalGain} Signal
      </div>
    </div>
  );
}

export function SignalHud({ compact = false }: { compact?: boolean }) {
  const { signal } = useDemo();
  const { locale } = useI18n();
  const rank = getRank(signal.points);
  const next = getNextRank(signal.points);
  const progress = Math.round(rankProgress(signal.points) * 100);

  if (compact) {
    return (
      <Link
        href="/profile?tab=signal"
        className="flex items-center gap-1.5 rounded-full glass-chip py-1 pl-1 pr-2.5 transition hover:border-playce-teal/30"
        aria-label="Signal"
      >
        <div
          className="signal-ring relative flex h-8 w-8 items-center justify-center rounded-full p-[2px]"
          style={{ ["--p" as string]: progress }}
        >
          <div className="flex h-full w-full items-center justify-center rounded-full bg-surface text-[10px] font-bold text-playce-teal">
            {signal.points}
          </div>
        </div>
        <span className="flex items-center gap-0.5 text-[10px] text-slate-muted">
          <Flame className="h-3 w-3 text-warning" />
          {signal.streak}
        </span>
      </Link>
    );
  }

  return (
    <Link
      href="/profile?tab=signal"
      className="flex items-center gap-2 rounded-full glass-chip px-2.5 py-1.5 transition hover:border-playce-teal/30"
    >
      <div
        className="signal-ring relative flex h-9 w-9 items-center justify-center rounded-full p-[2px]"
        style={{ ["--p" as string]: progress }}
      >
        <div className="flex h-full w-full items-center justify-center rounded-full bg-surface text-[10px] font-bold text-playce-teal">
          {signal.points}
        </div>
      </div>
      <div className="min-w-0 pr-1">
        <p className="truncate text-xs font-semibold" style={{ color: rank.color }}>
          {locale === "fr" ? rank.label_fr : rank.label_en}
        </p>
        <p className="flex items-center gap-1 text-[10px] text-slate-muted">
          <Flame className="h-3 w-3 text-warning" />
          {signal.streak}d
          {next && (
            <span className="text-ink/30">
              · {next.min - signal.points}→
              {locale === "fr" ? next.label_fr : next.label_en}
            </span>
          )}
        </p>
      </div>
    </Link>
  );
}
