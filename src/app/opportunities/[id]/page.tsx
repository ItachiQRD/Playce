"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDemo } from "@/lib/demo-store";
import { useI18n } from "@/lib/i18n";
import { Avatar, Badge, Card, EmptyState } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { footballLevels, footballPositions } from "@/lib/demo-data";
import { MatchBreakdown } from "@/components/opportunities/match-breakdown";
import { ApplicationKanban } from "@/components/opportunities/application-kanban";
import { track } from "@/lib/analytics";
import { isMinor } from "@/lib/utils";

export default function OpportunityDetailPage() {
  const params = useParams<{ id: string }>();
  const {
    opportunities,
    applications,
    auth,
    applyToOpportunity,
    updateApplicationStatus,
    getMatchScore,
    startConversation,
  } = useDemo();
  const { t, locale } = useI18n();
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [applied, setApplied] = useState(false);

  const opp = opportunities.find((o) => o.id === params.id);

  useEffect(() => {
    if (opp) track("opportunity_view", { id: opp.id });
  }, [opp?.id]);

  if (!opp) {
    return (
      <div className="px-4 py-12">
        <EmptyState title={t("opportunities.notFound")} />
      </div>
    );
  }

  const match = getMatchScore(opp);
  const myApp = applications.find(
    (a) => a.opportunity_id === opp.id && a.applicant_id === auth.user?.id
  );
  const isOwner = auth.user?.id === opp.author_id;
  const apps = applications.filter((a) => a.opportunity_id === opp.id);

  const pos = footballPositions.find((p) => p.slug === opp.position);
  const lvl = footballLevels.find((l) => l.slug === opp.level);

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant={opp.type === "offer" ? "teal" : "blue"}>
            {opp.type === "offer"
              ? t("opportunities.offers")
              : t("opportunities.demands")}
          </Badge>
          <Badge variant="success">{opp.status}</Badge>
        </div>
        <h1 className="font-display text-2xl font-bold">{opp.title}</h1>
        <div className="flex items-center gap-3">
          <Avatar
            src={opp.author?.avatar_url}
            name={opp.author?.full_name ?? "?"}
          />
          <div>
            <Link
              href={`/p/${opp.author?.handle}`}
              className="font-medium hover:text-playce-teal"
            >
              {opp.organization || opp.author?.full_name}
            </Link>
            <p className="text-xs text-slate-muted">
              {[opp.city, opp.country].filter(Boolean).join(", ")}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <Card className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {pos && (
              <Badge>{locale === "fr" ? pos.name_fr : pos.name_en}</Badge>
            )}
            {lvl && (
              <Badge>{locale === "fr" ? lvl.name_fr : lvl.name_en}</Badge>
            )}
            {opp.contract_type && <Badge>{opp.contract_type}</Badge>}
            {opp.compensation && <Badge variant="teal">{opp.compensation}</Badge>}
            {opp.deadline && (
              <Badge variant="warning">
                {t("opportunities.deadline")}: {opp.deadline}
              </Badge>
            )}
          </div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {opp.description}
          </p>
          {opp.criteria && (
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-muted">
                {t("opportunities.criteria")}
              </p>
              <p className="mt-1 text-sm">{opp.criteria}</p>
            </div>
          )}
        </Card>

        <Card>
          <MatchBreakdown match={match} />
        </Card>
      </div>

      {!isOwner && auth.user && (
        <Card className="space-y-3">
          {myApp || applied ? (
            <div className="space-y-2">
              <p className="font-medium text-playce-teal">
                {t("opportunities.applySuccess")}
              </p>
              <Badge>
                {t(
                  `opportunities.statusLabels.${myApp?.status ?? "sent"}`
                )}
              </Badge>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => {
                  if (isMinor(auth.user?.birth_date) && !opp.author?.identity_verified) {
                    alert(t("messages.minorBlocked"));
                    return;
                  }
                  const id = startConversation(opp.author_id);
                  router.push(`/messages/${id}`);
                }}
              >
                {t("opportunities.contact")}
              </Button>
            </div>
          ) : (
            <>
              {auth.user.completeness < 60 ? (
                <p className="text-sm text-warning">{t("opportunities.needProfile")}</p>
              ) : (
                <>
                  <Textarea
                    label={t("opportunities.applyMessage")}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t("opportunities.applyPlaceholder")}
                  />
                  <Button
                    className="w-full"
                    onClick={() => {
                      const app = applyToOpportunity(opp.id, message);
                      if (app) setApplied(true);
                    }}
                  >
                    {t("common.apply")} — Sports ID
                  </Button>
                </>
              )}
            </>
          )}
        </Card>
      )}

      {isOwner && (
        <Card className="overflow-hidden">
          <ApplicationKanban
            applications={apps}
            onStatusChange={updateApplicationStatus}
            onMessage={(applicantId) => {
              const id = startConversation(applicantId);
              router.push(`/messages/${id}`);
            }}
          />
        </Card>
      )}
    </div>
  );
}
