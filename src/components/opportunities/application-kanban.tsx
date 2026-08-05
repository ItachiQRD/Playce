"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { Application, ApplicationStatus } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { Avatar, Badge, Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const COLUMNS: ApplicationStatus[] = [
  "sent",
  "viewed",
  "shortlisted",
  "trial",
  "rejected",
  "closed",
];

export function ApplicationKanban({
  applications,
  onStatusChange,
  onMessage,
}: {
  applications: Application[];
  onStatusChange: (id: string, status: ApplicationStatus) => void;
  onMessage?: (applicantId: string) => void;
}) {
  const { t } = useI18n();

  const byStatus = useMemo(() => {
    const map: Record<ApplicationStatus, Application[]> = {
      sent: [],
      viewed: [],
      shortlisted: [],
      trial: [],
      rejected: [],
      closed: [],
    };
    applications.forEach((a) => {
      map[a.status]?.push(a);
    });
    return map;
  }, [applications]);

  if (applications.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-slate-muted">
        {t("opportunities.noApplications")}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="font-display font-semibold">
        {t("opportunities.pipeline")} ({applications.length})
      </h2>
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2">
        {COLUMNS.map((status) => (
          <div
            key={status}
            className="w-64 shrink-0 rounded-2xl border border-white/10 bg-playce-black/40 p-2"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const id = e.dataTransfer.getData("applicationId");
              if (id) onStatusChange(id, status);
            }}
          >
            <div className="mb-2 flex items-center justify-between px-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-muted">
                {t(`opportunities.statusLabels.${status}`)}
              </p>
              <Badge>{byStatus[status].length}</Badge>
            </div>
            <div className="min-h-[120px] space-y-2">
              {byStatus[status].map((a) => (
                <Card
                  key={a.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("applicationId", a.id);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  className={cn(
                    "cursor-grab space-y-2 p-3 active:cursor-grabbing",
                    "hover:border-playce-teal/40"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Avatar
                      src={a.applicant?.avatar_url}
                      name={a.applicant?.full_name ?? "?"}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/p/${a.applicant?.handle}`}
                        className="block truncate text-sm font-medium hover:text-playce-teal"
                      >
                        {a.applicant?.full_name}
                      </Link>
                      <p className="truncate text-[10px] text-slate-muted">
                        {a.message || "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {COLUMNS.filter((s) => s !== status)
                      .slice(0, 3)
                      .map((s) => (
                        <Button
                          key={s}
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-[10px]"
                          onClick={() => onStatusChange(a.id, s)}
                        >
                          {t(`opportunities.statusLabels.${s}`)}
                        </Button>
                      ))}
                    {onMessage && a.applicant_id && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-[10px]"
                        onClick={() => onMessage(a.applicant_id)}
                      >
                        {t("common.message")}
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-slate-muted">{t("opportunities.kanbanHint")}</p>
    </div>
  );
}
