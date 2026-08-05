"use client";

import { useDemo } from "@/lib/demo-store";
import { useI18n } from "@/lib/i18n";
import { getRank, getNextRank, rankProgress } from "@/lib/signal";
import { Card } from "@/components/ui/card";
import { Flame, Target, Zap } from "lucide-react";

export function SignalPanel() {
  const { signal } = useDemo();
  const { locale } = useI18n();
  const rank = getRank(signal.points);
  const next = getNextRank(signal.points);
  const progress = Math.round(rankProgress(signal.points) * 100);

  return (
    <div className="space-y-4">
      <Card className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-playce-teal/20 blur-3xl" />
        <div className="relative flex items-center gap-4">
          <div
            className="signal-ring flex h-20 w-20 items-center justify-center rounded-full p-[3px]"
            style={{ ["--p" as string]: progress }}
          >
            <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-playce-black">
              <span className="font-display text-xl font-bold text-playce-teal">
                {signal.points}
              </span>
              <span className="text-[9px] uppercase text-slate-muted">Signal</span>
            </div>
          </div>
          <div>
            <p className="font-display text-lg font-semibold" style={{ color: rank.color }}>
              {locale === "fr" ? rank.label_fr : rank.label_en}
            </p>
            <p className="mt-1 flex items-center gap-2 text-sm text-slate-muted">
              <Flame className="h-4 w-4 text-warning" />
              {signal.streak}{" "}
              {locale === "fr" ? "jours de série" : "day streak"}
            </p>
            {next && (
              <p className="mt-1 text-xs text-white/50">
                {next.min - signal.points}{" "}
                {locale === "fr" ? "pts vers" : "pts to"}{" "}
                {locale === "fr" ? next.label_fr : next.label_en}
              </p>
            )}
            <p className="mt-2 text-xs text-playce-teal">
              +{signal.todayEarned}{" "}
              {locale === "fr" ? "aujourd'hui" : "today"}
            </p>
          </div>
        </div>
      </Card>

      <Card className="space-y-3">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-playce-teal" />
          <h3 className="font-display text-sm font-semibold">
            {locale === "fr" ? "Missions du jour" : "Daily missions"}
          </h3>
        </div>
        {signal.quests.map((q) => {
          const done = q.progress >= q.target;
          const pct = Math.min(100, Math.round((q.progress / q.target) * 100));
          return (
            <div key={q.id} className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className={done ? "text-playce-teal" : "text-white/80"}>
                  {locale === "fr" ? q.label_fr : q.label_en}
                </span>
                <span className="text-slate-muted">
                  {q.progress}/{q.target} · +{q.reward}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-playce-teal transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </Card>

      <Card className="space-y-2">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-warning" />
          <h3 className="font-display text-sm font-semibold">
            {locale === "fr" ? "Comment monter" : "How to level up"}
          </h3>
        </div>
        <ul className="space-y-1 text-xs text-slate-muted">
          <li>+25 {locale === "fr" ? "publier" : "publish"} · +35 reel</li>
          <li>+20 {locale === "fr" ? "candidater" : "apply"} · +5 commenter</li>
          <li>+8 {locale === "fr" ? "ouvrir l'app / jour" : "daily open"} · streak bonus</li>
        </ul>
      </Card>
    </div>
  );
}
