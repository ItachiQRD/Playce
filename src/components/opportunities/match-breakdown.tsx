"use client";

import { useI18n } from "@/lib/i18n";
import type { MatchResult } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

export function MatchBreakdown({
  match,
  compact = false,
}: {
  match: MatchResult;
  compact?: boolean;
}) {
  const { t } = useI18n();
  const color =
    match.score >= 80
      ? "text-playce-teal"
      : match.score >= 50
        ? "text-electric-blue"
        : "text-warning";

  return (
    <div className={cn("space-y-3", compact && "space-y-2")}>
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex flex-col items-center justify-center rounded-2xl bg-electric-blue/15",
            compact ? "h-12 w-12" : "h-16 w-16"
          )}
        >
          <span className={cn("font-bold tabular-nums", color, compact ? "text-lg" : "text-2xl")}>
            {match.score}
          </span>
          <span className="text-[9px] uppercase text-electric-blue">
            {t("opportunities.match")}
          </span>
        </div>
        {!compact && (
          <div>
            <p className="font-display text-sm font-semibold">
              {t("match.title")}
            </p>
            <p className="text-xs text-slate-muted">{t("match.subtitle")}</p>
          </div>
        )}
      </div>

      <ul className="space-y-1.5">
        {match.breakdown.map((item) => (
          <li
            key={item.key}
            className="flex items-center gap-2 rounded-xl bg-white/[0.03] px-2.5 py-1.5 text-xs"
          >
            <span
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded-full",
                item.matched
                  ? "bg-playce-teal/20 text-playce-teal"
                  : "bg-canvas text-slate-muted"
              )}
            >
              {item.matched ? (
                <Check className="h-3 w-3" />
              ) : (
                <X className="h-3 w-3" />
              )}
            </span>
            <span className="flex-1 text-ink/80">{t(`match.reasons.${item.key}`)}</span>
            <span
              className={cn(
                "tabular-nums font-medium",
                item.matched ? "text-playce-teal" : "text-slate-muted"
              )}
            >
              {item.matched ? `+${item.weight}` : `0/${item.weight}`}
            </span>
            <div className="h-1.5 w-12 overflow-hidden rounded-full bg-white/10">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  item.matched ? "bg-playce-teal" : "bg-transparent"
                )}
                style={{ width: item.matched ? "100%" : "0%" }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
