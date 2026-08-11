"use client";

import Link from "next/link";
import { MapPin, BadgeCheck } from "lucide-react";
import { Avatar, Badge, Card } from "@/components/ui/card";
import type { Opportunity, Profile } from "@/lib/types";
import { footballPositions, footballLevels } from "@/lib/demo-data";
import { useI18n } from "@/lib/i18n";

function positionLabel(slug?: string | null, locale = "fr") {
  const p = footballPositions.find((x) => x.slug === slug);
  if (!p) return slug ?? "—";
  return locale === "fr" ? p.name_fr : p.name_en;
}

function levelLabel(slug?: string | null, locale = "fr") {
  const l = footballLevels.find((x) => x.slug === slug);
  if (!l) return slug ?? "—";
  return locale === "fr" ? l.name_fr : l.name_en;
}

export function ProfileCard({ profile }: { profile: Profile }) {
  const { t, locale } = useI18n();
  return (
    <Link href={`/p/${profile.handle}`}>
      <Card className="flex items-center gap-3 transition hover:border-playce-teal/25 hover:bg-canvas">
        <Avatar src={profile.avatar_url} name={profile.full_name} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <p className="truncate font-medium">{profile.full_name}</p>
            {profile.identity_verified && (
              <BadgeCheck className="h-4 w-4 text-playce-teal" />
            )}
          </div>
          <p className="text-xs text-slate-muted">
            {t(`roles.${profile.role}`)}
            {profile.position ? ` · ${positionLabel(profile.position, locale)}` : ""}
          </p>
          {(profile.city || profile.country) && (
            <p className="mt-1 flex items-center gap-1 text-xs text-slate-muted">
              <MapPin className="h-3 w-3" />
              {[profile.city, profile.country].filter(Boolean).join(", ")}
            </p>
          )}
          <div className="mt-2 flex flex-wrap gap-1">
            {profile.availability !== "unavailable" && (
              <Badge variant="success">{t(`availability.${profile.availability}`)}</Badge>
            )}
            {profile.level && (
              <Badge variant="blue">{levelLabel(profile.level, locale)}</Badge>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}

export function OpportunityCard({
  opportunity,
  matchScore,
}: {
  opportunity: Opportunity;
  matchScore?: number;
}) {
  const { t, locale } = useI18n();
  return (
    <Link href={`/opportunities/${opportunity.id}`}>
      <Card className="space-y-3 transition hover:border-playce-teal/25 hover:bg-canvas">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap gap-1.5">
              <Badge variant={opportunity.type === "offer" ? "teal" : "blue"}>
                {opportunity.type === "offer" ? t("opportunities.offers") : t("opportunities.demands")}
              </Badge>
              {opportunity.status === "open" ? (
                <Badge variant="success">Open</Badge>
              ) : (
                <Badge variant="danger">Closed</Badge>
              )}
            </div>
            <h3 className="mt-2 font-display text-base font-semibold leading-snug">
              {opportunity.title}
            </h3>
            <p className="mt-1 text-xs text-slate-muted">
              {opportunity.organization || opportunity.author?.full_name}
              {opportunity.city ? ` · ${opportunity.city}` : ""}
            </p>
          </div>
          {(matchScore ?? opportunity.match_score) != null && (
            <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-electric-blue/15 text-electric-blue">
              <span className="text-sm font-bold tabular-nums">
                {matchScore ?? opportunity.match_score}
              </span>
              <span className="text-[9px] uppercase">{t("opportunities.match")}</span>
            </div>
          )}
        </div>
        <p className="line-clamp-2 text-sm text-slate-muted">{opportunity.description}</p>
        <div className="flex flex-wrap gap-1.5 text-xs">
          {opportunity.position && (
            <Badge>{positionLabel(opportunity.position, locale)}</Badge>
          )}
          {opportunity.level && (
            <Badge>{levelLabel(opportunity.level, locale)}</Badge>
          )}
          {opportunity.contract_type && <Badge>{opportunity.contract_type}</Badge>}
        </div>
      </Card>
    </Link>
  );
}
