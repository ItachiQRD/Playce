"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus, SlidersHorizontal, X } from "lucide-react";
import { useDemo } from "@/lib/demo-store";
import { useI18n } from "@/lib/i18n";
import { OpportunityCard } from "@/components/cards/entity-cards";
import { Button } from "@/components/ui/button";
import { Select, Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/card";
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
  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeFilters = [sport, position, level, city].filter(Boolean).length;

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

  const filterForm = (
    <div className="grid gap-4 sm:grid-cols-2">
      <Select
        label="Sport"
        value={sport}
        onChange={(e) => setSport(e.target.value)}
        options={[
          { value: "", label: t("opportunities.all") },
          { value: "sport-football", label: "Football" },
          { value: "sport-basketball", label: "Basketball" },
        ]}
      />
      <Select
        label={t("onboarding.position")}
        value={position}
        onChange={(e) => setPosition(e.target.value)}
        options={[
          { value: "", label: t("opportunities.all") },
          ...footballPositions.map((p) => ({
            value: p.slug,
            label: locale === "fr" ? p.name_fr : p.name_en,
          })),
        ]}
      />
      <Select
        label={t("onboarding.level")}
        value={level}
        onChange={(e) => setLevel(e.target.value)}
        options={[
          { value: "", label: t("opportunities.all") },
          ...footballLevels.map((l) => ({
            value: l.slug,
            label: locale === "fr" ? l.name_fr : l.name_en,
          })),
        ]}
      />
      <Input
        label={t("onboarding.city")}
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="Metz, Lyon…"
      />
      <Select
        label={t("opportunities.sort")}
        value={sort}
        onChange={(e) => setSort(e.target.value as typeof sort)}
        options={[
          { value: "match", label: t("opportunities.sortMatch") },
          { value: "recent", label: t("opportunities.sortRecent") },
          { value: "urgent", label: t("opportunities.sortUrgent") },
        ]}
      />
    </div>
  );

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-5 md:max-w-5xl md:space-y-6 md:px-6 md:py-8">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h1 className="font-display text-2xl font-bold leading-tight">
            {t("opportunities.title")}
          </h1>
          <Link href="/opportunities/new" className="shrink-0">
            <Button size="sm" className="hidden sm:inline-flex">
              {t("opportunities.create")}
            </Button>
            <Button size="sm" className="sm:hidden" aria-label={t("opportunities.create")}>
              <Plus className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <Button
          size="sm"
          variant="secondary"
          className="w-full md:hidden"
          onClick={() => setFiltersOpen(true)}
        >
          <SlidersHorizontal className="h-4 w-4" />
          {t("opportunities.filters")}
          {activeFilters > 0 && (
            <Badge variant="teal" className="ml-1">
              {activeFilters}
            </Badge>
          )}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["all", t("opportunities.all")],
            ["offer", t("opportunities.offers")],
            ["demand", t("opportunities.demands")],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`rounded-full px-4 py-1.5 text-sm transition ${
              tab === key
                ? "bg-playce-teal text-white"
                : "glass-chip text-slate-muted hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="hidden md:block">{filterForm}</div>

      <div className="space-y-6">
        {filtered.map((o) => (
          <OpportunityCard
            key={o.id}
            opportunity={o}
            matchScore={o.match_score}
          />
        ))}
        {filtered.length === 0 && (
          <p className="py-12 text-center text-slate-muted">
            {t("opportunities.noResults")}
          </p>
        )}
      </div>

      {filtersOpen && (
        <div className="fixed inset-0 z-[70] md:hidden">
          <button
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={() => setFiltersOpen(false)}
            aria-label="Close"
          />
          <div className="safe-bottom glass-strong absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-[28px] px-4 pb-8 pt-3">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-ink/15" />
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">
                {t("opportunities.filters")}
              </h2>
              <button
                onClick={() => setFiltersOpen(false)}
                className="rounded-full bg-canvas p-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {filterForm}
            <Button
              className="mt-6 w-full"
              onClick={() => setFiltersOpen(false)}
            >
              {t("opportunities.seeResults", { count: filtered.length })}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
