"use client";

import { useMemo, useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import { useDemo } from "@/lib/demo-store";
import { useI18n } from "@/lib/i18n";
import { ProfileCard, OpportunityCard } from "@/components/cards/entity-cards";
import { PostCard } from "@/components/feed/post-card";
import { Badge } from "@/components/ui/card";

type Tab = "all" | "people" | "clubs" | "opportunities" | "posts";

export default function SearchPage() {
  const { profiles, opportunities, posts, getMatchScore } = useDemo();
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>("all");

  const q = query.trim().toLowerCase();

  const results = useMemo(() => {
    const people = profiles.filter(
      (p) =>
        p.role !== "club" &&
        p.role !== "admin" &&
        (!q ||
          p.full_name.toLowerCase().includes(q) ||
          p.handle.toLowerCase().includes(q) ||
          p.city?.toLowerCase().includes(q) ||
          p.position?.includes(q))
    );
    const clubs = profiles.filter(
      (p) =>
        p.role === "club" &&
        (!q ||
          p.full_name.toLowerCase().includes(q) ||
          p.handle.toLowerCase().includes(q))
    );
    const opps = opportunities
      .filter(
        (o) =>
          !q ||
          o.title.toLowerCase().includes(q) ||
          o.description.toLowerCase().includes(q) ||
          o.city?.toLowerCase().includes(q)
      )
      .map((o) => ({ ...o, match_score: getMatchScore(o).score }));
    const postResults = posts.filter(
      (p) =>
        !q ||
        p.content.toLowerCase().includes(q) ||
        p.hashtags.some((h) => h.toLowerCase().includes(q.replace(/^#/, "")))
    );
    return { people, clubs, opps, postResults };
  }, [profiles, opportunities, posts, q, getMatchScore]);

  const tabs: { key: Tab; label: string }[] = [
    { key: "all", label: "Tout" },
    { key: "people", label: t("search.people") },
    { key: "clubs", label: t("search.clubs") },
    { key: "opportunities", label: t("search.opportunities") },
    { key: "posts", label: t("search.posts") },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 md:max-w-5xl md:px-6">
      <h1 className="font-display text-2xl font-bold">{t("common.search")}</h1>

      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("search.placeholder")}
          className="w-full rounded-2xl border border-[var(--border)] bg-surface py-3 pl-11 pr-4 text-sm outline-none focus:border-playce-teal/50"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tabItem) => (
          <button
            key={tabItem.key}
            onClick={() => setTab(tabItem.key)}
            className={`rounded-full px-3 py-1 text-sm ${
              tab === tabItem.key
                ? "bg-playce-teal text-white"
                : "bg-canvas text-slate-muted"
            }`}
          >
            {tabItem.label}
          </button>
        ))}
      </div>

      {(tab === "all" || tab === "people") && results.people.length > 0 && (
        <section className="space-y-2">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            {t("search.people")}
            <Badge>{results.people.length}</Badge>
          </h2>
          {results.people.slice(0, tab === "all" ? 3 : 20).map((p) => (
            <ProfileCard key={p.id} profile={p} />
          ))}
        </section>
      )}

      {(tab === "all" || tab === "clubs") && results.clubs.length > 0 && (
        <section className="space-y-2">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            {t("search.clubs")}
            <Badge>{results.clubs.length}</Badge>
          </h2>
          {results.clubs.map((p) => (
            <ProfileCard key={p.id} profile={p} />
          ))}
        </section>
      )}

      {(tab === "all" || tab === "opportunities") && results.opps.length > 0 && (
        <section className="space-y-2">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            {t("search.opportunities")}
            <Badge>{results.opps.length}</Badge>
          </h2>
          {results.opps.slice(0, tab === "all" ? 3 : 20).map((o) => (
            <OpportunityCard
              key={o.id}
              opportunity={o}
              matchScore={o.match_score}
            />
          ))}
        </section>
      )}

      {(tab === "all" || tab === "posts") && results.postResults.length > 0 && (
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            {t("search.posts")}
            <Badge>{results.postResults.length}</Badge>
          </h2>
          {results.postResults.slice(0, tab === "all" ? 2 : 20).map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </section>
      )}

      {q &&
        results.people.length === 0 &&
        results.clubs.length === 0 &&
        results.opps.length === 0 &&
        results.postResults.length === 0 && (
          <p className="py-12 text-center text-slate-muted">
            Aucun résultat pour « {query} »
          </p>
        )}
    </div>
  );
}
