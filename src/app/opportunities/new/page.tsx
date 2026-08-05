"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useDemo } from "@/lib/demo-store";
import { useI18n } from "@/lib/i18n";
import { footballLevels, footballPositions } from "@/lib/demo-data";
import type { OpportunityType } from "@/lib/types";

export default function NewOpportunityPage() {
  const { auth, createOpportunity, sports } = useDemo();
  const { t, locale } = useI18n();
  const router = useRouter();
  const [form, setForm] = useState({
    type: "offer" as OpportunityType,
    title: "",
    organization: auth.user?.full_name ?? "",
    sport_id: "sport-football",
    position: "st",
    level: "semi-pro",
    city: "",
    country: "France",
    contract_type: "CDD",
    compensation: "",
    deadline: "",
    description: "",
    criteria: "",
    status: "open" as const,
  });

  if (!auth.user) {
    router.replace("/auth/login");
    return null;
  }

  const canCreate =
    auth.user.completeness >= 60 &&
    (auth.user.role !== "club" || auth.user.identity_verified);

  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <h1 className="mb-6 font-display text-2xl font-bold">
        {t("opportunities.create")}
      </h1>

      {auth.user.completeness < 60 && (
        <Card className="mb-4 border-warning/30 bg-warning/5 text-sm">
          {t("opportunities.needProfile")} ({auth.user.completeness}%)
        </Card>
      )}

      {auth.user.role === "club" && !auth.user.identity_verified && (
        <Card className="mb-4 border-electric-blue/30 bg-electric-blue/5 text-sm">
          {t("opportunities.needVerifiedPublish")}
        </Card>
      )}

      <Card className="space-y-4">
        <Select
          label="Type"
          value={form.type}
          onChange={(e) =>
            setForm({ ...form, type: e.target.value as OpportunityType })
          }
          options={[
            { value: "offer", label: t("opportunities.offers") },
            { value: "demand", label: t("opportunities.demands") },
          ]}
        />
        <Input
          label="Titre"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <Input
          label="Organisation"
          value={form.organization}
          onChange={(e) => setForm({ ...form, organization: e.target.value })}
        />
        <Select
          label="Sport"
          value={form.sport_id}
          onChange={(e) => setForm({ ...form, sport_id: e.target.value })}
          options={sports.map((s) => ({
            value: s.id,
            label: locale === "fr" ? s.name_fr : s.name_en,
          }))}
        />
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Poste"
            value={form.position}
            onChange={(e) => setForm({ ...form, position: e.target.value })}
            options={footballPositions.map((p) => ({
              value: p.slug,
              label: locale === "fr" ? p.name_fr : p.name_en,
            }))}
          />
          <Select
            label="Niveau"
            value={form.level}
            onChange={(e) => setForm({ ...form, level: e.target.value })}
            options={footballLevels.map((l) => ({
              value: l.slug,
              label: locale === "fr" ? l.name_fr : l.name_en,
            }))}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Ville"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          />
          <Input
            label="Pays"
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
          />
        </div>
        <Input
          label="Type de contrat"
          value={form.contract_type}
          onChange={(e) => setForm({ ...form, contract_type: e.target.value })}
        />
        <Input
          label="Rémunération (optionnel)"
          value={form.compensation}
          onChange={(e) => setForm({ ...form, compensation: e.target.value })}
        />
        <Input
          label="Date limite"
          type="date"
          value={form.deadline}
          onChange={(e) => setForm({ ...form, deadline: e.target.value })}
        />
        <Textarea
          label="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <Textarea
          label="Critères"
          value={form.criteria}
          onChange={(e) => setForm({ ...form, criteria: e.target.value })}
        />
        <Button
          className="w-full"
          disabled={!form.title || !form.description || !canCreate}
          onClick={() => {
            const opp = createOpportunity(form);
            router.push(`/opportunities/${opp.id}`);
          }}
        >
          {t("common.publish")}
        </Button>
      </Card>
    </div>
  );
}
