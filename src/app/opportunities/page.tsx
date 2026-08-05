"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useDemo } from "@/lib/demo-store";
import { useI18n } from "@/lib/i18n";
import { OpportunityCard } from "@/components/cards/entity-cards";
import { Button } from "@/components/ui/button";
import { Select, Input } from "@/components/ui/input";
import { footballLevels, footballPositions } from "@/lib/demo-data";
import type { OpportunityType } from "@/lib/types";

export default function OpportunitiesPage() {
  const { opportunities, getMatchScore } = useDemo();
  const { t, locale } = useI18n();
  const [tab, setTab] = useState<"all" | OpportunityType>("all");
  const [sport, setSport] = useState("");
  const [position, setPosition] = useState("");
  const [level, setLevel] = useState("");
  const [city, setCity] = useState("");
  const [sort, setSort] = useState<"recent" | "match" | "urgent">("match");

  const filtered = useMemo(() => {
    let list = opportunities.filter((o) => o.status === "open");
    if (tab !== "all") list = list.filter((o) => o.type === tab);
    if (sport) list = list.filter((o) => o.sport_id === sport);
    if (position) list = list.filter((o) => o.position === position);
    if (level) list = list.filter((o) => o.level === level);
    if (city)
      list = list.filter((o) =>
        (o.city ?? "").toLowerCase().includes(city.toLowerCase())
      );

    const withScore = list.map((o) => {
      const m = getMatchScore(o);
      return { ...o, match_score: m.score, match_reasons: m.reasons };
    });

    if (sort === "match")
      return withScore.sort((a, b) => (b.match_score ?? 0) - (a.match_score ?? 0));
    if (sort === "urgent")
      return withScore.sort((a, b) =>
        (a.deadline ?? "9999").localeCompare(b.deadline ?? "9999")
      );
    return withScore.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [opportunities, tab, sport, position, level, city, sort, getMatchScore]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold">
          {t("opportunities.title")}
        </h1>
        <Link href="/opportunities/new">
          <Button size="sm">{t("opportunities.create")}</Button>
        </Link>
      </div>

      <div className="flex gap-2">
        {(
          [
            ["all", "Tous"],
            ["offer", t("opportunities.offers")],
            ["demand", t("opportunities.demands")],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`rounded-full px-4 py-1.5 text-sm transition ${
              tab === key
                ? "bg-playce-teal text-playce-black"
                : "bg-white/5 text-slate-muted hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Select
          label="Sport"
          value={sport}
          onChange={(e) => setSport(e.target.value)}
          options={[
            { value: "", label: "Tous" },
            { value: "sport-football", label: "Football" },
            { value: "sport-basketball", label: "Basketball" },
          ]}
        />
        <Select
          label="Poste"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          options={[
            { value: "", label: "Tous" },
            ...footballPositions.map((p) => ({
              value: p.slug,
              label: locale === "fr" ? p.name_fr : p.name_en,
            })),
          ]}
        />
        <Select
          label="Niveau"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          options={[
            { value: "", label: "Tous" },
            ...footballLevels.map((l) => ({
              value: l.slug,
              label: locale === "fr" ? l.name_fr : l.name_en,
            })),
          ]}
        />
        <Input
          label="Ville"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Metz, Lyon…"
        />
        <Select
          label="Tri"
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          options={[
            { value: "match", label: "Pertinence (match)" },
            { value: "recent", label: "Récent" },
            { value: "urgent", label: "Urgent" },
          ]}
        />
      </div>

      <div className="space-y-3">
        {filtered.map((o) => (
          <OpportunityCard
            key={o.id}
            opportunity={o}
            matchScore={o.match_score}
          />
        ))}
        {filtered.length === 0 && (
          <p className="py-12 text-center text-slate-muted">
            Aucune opportunité ne correspond à vos filtres.
          </p>
        )}
      </div>
    </div>
  );
}
