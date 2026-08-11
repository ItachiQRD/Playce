"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDemo } from "@/lib/demo-store";
import { useI18n } from "@/lib/i18n";
import { Avatar, Badge, Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { footballPositions, footballLevels, sports } from "@/lib/demo-data";
import {
  Users,
  FileText,
  Briefcase,
  Flag,
  Download,
  BadgeCheck,
  Activity,
} from "lucide-react";
import { getAnalyticsSummary } from "@/lib/analytics";
import { useMemo } from "react";

type AdminTab = "dashboard" | "users" | "reports" | "referentials" | "analytics";

export default function AdminPage() {
  const {
    auth,
    profiles,
    posts,
    opportunities,
    applications,
    reports,
    suspendUser,
    verifyUser,
    resolveReport,
  } = useDemo();
  const { t } = useI18n();
  const router = useRouter();
  const [tab, setTab] = useState<AdminTab>("dashboard");
  const analytics = useMemo(() => getAnalyticsSummary(), [tab, applications.length, posts.length]);

  if (!auth.user) {
    router.replace("/auth/login");
    return null;
  }

  if (auth.user.role !== "admin") {
    return (
      <div className="px-4 py-12 text-center">
        <p className="text-slate-muted">{t("admin.accessDenied")}</p>
        <Button className="mt-4" onClick={() => router.push("/feed")}>
          {t("common.back")}
        </Button>
      </div>
    );
  }

  const pendingReports = reports.filter((r) => r.status === "pending");

  const exportCsv = (filename: string, rows: string[][]) => {
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const kpis = [
    { label: "Utilisateurs", value: profiles.length, icon: Users },
    { label: "Publications", value: posts.length, icon: FileText },
    { label: "Opportunités", value: opportunities.length, icon: Briefcase },
    { label: "Signalements", value: pendingReports.length, icon: Flag },
    {
      label: "Candidatures",
      value: applications.length,
      icon: Briefcase,
    },
    {
      label: "Profils vérifiés",
      value: profiles.filter((p) => p.identity_verified).length,
      icon: BadgeCheck,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold">{t("admin.title")}</h1>
        <Button
          size="sm"
          variant="secondary"
          onClick={() =>
            exportCsv("playce-users.csv", [
              ["id", "name", "email", "role", "completeness", "verified"],
              ...profiles.map((p) => [
                p.id,
                p.full_name,
                p.email,
                p.role,
                String(p.completeness),
                String(p.identity_verified),
              ]),
            ])
          }
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["dashboard", t("admin.dashboard")],
            ["users", t("admin.users")],
            ["reports", t("admin.reports")],
            ["referentials", t("admin.referentials")],
            ["analytics", t("admin.analytics")],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`rounded-full px-4 py-1.5 text-sm ${
              tab === key
                ? "bg-playce-teal text-white"
                : "bg-canvas text-slate-muted"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "dashboard" && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {kpis.map((k) => (
            <Card key={k.label} className="flex items-center gap-4">
              <div className="rounded-2xl bg-playce-teal/15 p-3 text-playce-teal">
                <k.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display text-2xl font-bold tabular-nums">
                  {k.value}
                </p>
                <p className="text-xs text-slate-muted">{k.label}</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === "users" && (
        <div className="space-y-2">
          {profiles.map((p) => (
            <Card key={p.id} className="flex flex-wrap items-center gap-3">
              <Avatar src={p.avatar_url} name={p.full_name} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{p.full_name}</p>
                  {p.identity_verified && (
                    <BadgeCheck className="h-4 w-4 text-playce-teal" />
                  )}
                  {p.is_suspended && <Badge variant="danger">Suspendu</Badge>}
                </div>
                <p className="text-xs text-slate-muted">
                  {t(`roles.${p.role}`)} · {p.email} · {p.completeness}%
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {!p.identity_verified && (
                  <Button size="sm" variant="outline" onClick={() => verifyUser(p.id)}>
                    Vérifier
                  </Button>
                )}
                <Button
                  size="sm"
                  variant={p.is_suspended ? "secondary" : "danger"}
                  onClick={() => suspendUser(p.id, !p.is_suspended)}
                >
                  {p.is_suspended ? "Réactiver" : "Suspendre"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === "reports" && (
        <div className="space-y-2">
          {reports.length === 0 && (
            <p className="text-slate-muted">Aucun signalement.</p>
          )}
          {reports.map((r) => (
            <Card key={r.id} className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <Badge variant="warning">{r.reason}</Badge>
                  <p className="mt-2 text-sm">
                    {r.target_type} · {r.target_id}
                  </p>
                  {r.details && (
                    <p className="text-xs text-slate-muted">{r.details}</p>
                  )}
                </div>
                <Badge
                  variant={
                    r.status === "pending"
                      ? "warning"
                      : r.status === "resolved"
                        ? "success"
                        : "default"
                  }
                >
                  {r.status}
                </Badge>
              </div>
              {r.status === "pending" && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => resolveReport(r.id, "resolved")}
                  >
                    Résoudre
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => resolveReport(r.id, "dismissed")}
                  >
                    Rejeter
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {tab === "referentials" && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <h3 className="font-display font-semibold">Sports</h3>
            <ul className="mt-3 space-y-1 text-sm text-slate-muted">
              {sports.map((s) => (
                <li key={s.id}>
                  {s.icon} {s.name_fr}
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <h3 className="font-display font-semibold">Postes football</h3>
            <ul className="mt-3 space-y-1 text-sm text-slate-muted">
              {footballPositions.map((p) => (
                <li key={p.slug}>{p.name_fr}</li>
              ))}
            </ul>
          </Card>
          <Card>
            <h3 className="font-display font-semibold">Niveaux</h3>
            <ul className="mt-3 space-y-1 text-sm text-slate-muted">
              {footballLevels.map((l) => (
                <li key={l.slug}>{l.name_fr}</li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {tab === "analytics" && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Sports ID ≥ 60%", ok: analytics.profile60 },
            { label: "Sports ID ≥ 80%", ok: analytics.profile80 },
            { label: "1re candidature", ok: analytics.firstApplication },
            { label: "1er message", ok: analytics.firstMessage },
            { label: "1re publication", ok: analytics.firstPost },
            { label: "Vues opportunités", value: analytics.opportunityViews },
            { label: "Partages Sports ID", value: analytics.shares },
            { label: "Signalements", value: analytics.reports },
            { label: "Vues Reels", value: analytics.reelViews },
            { label: "Événements totaux", value: analytics.total },
          ].map((item) => (
            <Card key={item.label} className="flex items-center gap-3">
              <div className="rounded-2xl bg-playce-teal/15 p-3 text-playce-teal">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display text-xl font-bold tabular-nums">
                  {"ok" in item ? (item.ok ? "✓" : "—") : item.value}
                </p>
                <p className="text-xs text-slate-muted">{item.label}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
