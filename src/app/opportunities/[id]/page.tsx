"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, X } from "lucide-react";
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
  const [applyOpen, setApplyOpen] = useState(false);

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
  const hasApplied = Boolean(myApp || applied);

  const pos = footballPositions.find((p) => p.slug === opp.position);
  const lvl = footballLevels.find((l) => l.slug === opp.level);

  const contactAuthor = () => {
    if (isMinor(auth.user?.birth_date) && !opp.author?.identity_verified) {
      alert(t("messages.minorBlocked"));
      return;
    }
    const id = startConversation(opp.author_id);
    router.push(`/messages/${id}`);
  };

  const submitApply = () => {
    const app = applyToOpportunity(
      opp.id,
      message.trim() ||
        (locale === "fr" ? "Candidature via PLAYCE" : "Application via PLAYCE")
    );
    if (app) {
      setApplied(true);
      setApplyOpen(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-4 pb-[calc(var(--nav-offset)+5rem)] md:max-w-5xl md:px-6 md:py-6 md:pb-8">
      <div className="space-y-3">
        <Link
          href="/opportunities"
          className="inline-flex items-center gap-1.5 text-sm text-slate-muted transition hover:text-ink md:hidden"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("opportunities.title")}
        </Link>
        <div className="flex flex-wrap gap-2">
          <Badge variant={opp.type === "offer" ? "teal" : "blue"}>
            {opp.type === "offer"
              ? t("opportunities.offers")
              : t("opportunities.demands")}
          </Badge>
          <Badge variant="success">
            {opp.status === "open" ? "Open" : "Closed"}
          </Badge>
        </div>
        <h1 className="font-display text-2xl font-bold leading-tight">{opp.title}</h1>
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
        <Card id="apply-block" className="hidden space-y-3 md:block">
          {hasApplied ? (
            <div className="space-y-2">
              <p className="font-medium text-playce-teal">
                {t("opportunities.applySuccess")}
              </p>
              <Badge>
                {t(`opportunities.statusLabels.${myApp?.status ?? "sent"}`)}
              </Badge>
              <Button
                variant="secondary"
                className="w-full"
                onClick={contactAuthor}
              >
                {t("opportunities.contact")}
              </Button>
            </div>
          ) : auth.user.completeness < 60 ? (
            <div className="space-y-3">
              <p className="text-sm text-warning">{t("opportunities.needProfile")}</p>
              <Link href="/profile/edit">
                <Button variant="outline" className="w-full">
                  {t("feed.completeProfile")}
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <Textarea
                label={t("opportunities.applyMessage")}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t("opportunities.applyPlaceholder")}
              />
              <Button className="w-full" onClick={submitApply}>
                {t("common.apply")} — Sports ID
              </Button>
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

      {/* Sticky mobile CTA — above floating nav */}
      {!isOwner && auth.user && (
        <div className="sticky-above-nav glass-strong fixed inset-x-0 z-40 px-4 py-3 md:hidden">
          {hasApplied ? (
            <Button className="w-full" variant="secondary" onClick={contactAuthor}>
              {t("opportunities.contact")}
            </Button>
          ) : auth.user.completeness < 60 ? (
            <Link href="/profile/edit" className="block">
              <Button className="w-full" variant="outline">
                {t("feed.completeProfile")}
              </Button>
            </Link>
          ) : (
            <Button className="w-full" onClick={() => setApplyOpen(true)}>
              {t("common.apply")} · Match {match.score}
            </Button>
          )}
        </div>
      )}

      {/* Mobile apply sheet */}
      {applyOpen && (
        <div className="fixed inset-0 z-[70] md:hidden">
          <button
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={() => setApplyOpen(false)}
            aria-label="Close"
          />
          <div className="safe-bottom glass-strong absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-[28px] px-4 pb-8 pt-3">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-ink/15" />
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">
                {t("common.apply")}
              </h2>
              <button
                onClick={() => setApplyOpen(false)}
                className="rounded-full bg-white/5 p-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-3 text-sm text-slate-muted line-clamp-2">{opp.title}</p>
            <Textarea
              label={t("opportunities.applyMessage")}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("opportunities.applyPlaceholder")}
            />
            <Button className="mt-4 w-full" size="lg" onClick={submitApply}>
              {t("common.apply")} — Sports ID
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
