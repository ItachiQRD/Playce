"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Card, CompletenessBar } from "@/components/ui/card";
import { useDemo } from "@/lib/demo-store";
import { useI18n } from "@/lib/i18n";
import { footballLevels, footballPositions } from "@/lib/demo-data";
import { calculateCompleteness } from "@/lib/utils";
import type { Availability } from "@/lib/types";

export default function OnboardingPage() {
  const { auth, completeOnboarding } = useDemo();
  const { t, locale } = useI18n();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    city: auth.user?.city ?? "",
    country: auth.user?.country ?? "France",
    position: auth.user?.position ?? "st",
    level: auth.user?.level ?? "amateur",
    availability: (auth.user?.availability ?? "open") as Availability,
    bio: auth.user?.bio ?? "",
    goals: auth.user?.goals ?? "",
    current_club: auth.user?.current_club ?? "",
    languages: (auth.user?.languages ?? ["fr"]).join(", "),
    avatar_url:
      auth.user?.avatar_url ??
      `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(auth.user?.full_name ?? "User")}`,
  });

  if (!auth.user) {
    router.replace("/auth/login");
    return null;
  }

  const preview = calculateCompleteness({
    ...auth.user,
    ...form,
    languages: form.languages.split(",").map((l) => l.trim()).filter(Boolean),
  });

  const steps = [
    {
      title: t("onboarding.location"),
      content: (
        <div className="space-y-4">
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
          <Input
            label={t("onboarding.photo")}
            value={form.avatar_url}
            onChange={(e) => setForm({ ...form, avatar_url: e.target.value })}
            hint="URL d'image (demo)"
          />
        </div>
      ),
    },
    {
      title: `${t("onboarding.position")} & ${t("onboarding.level")}`,
      content: (
        <div className="space-y-4">
          <Select
            label={t("onboarding.position")}
            value={form.position}
            onChange={(e) => setForm({ ...form, position: e.target.value })}
            options={footballPositions.map((p) => ({
              value: p.slug,
              label: locale === "fr" ? p.name_fr : p.name_en,
            }))}
          />
          <Select
            label={t("onboarding.level")}
            value={form.level}
            onChange={(e) => setForm({ ...form, level: e.target.value })}
            options={footballLevels.map((l) => ({
              value: l.slug,
              label: locale === "fr" ? l.name_fr : l.name_en,
            }))}
          />
          <Select
            label={t("onboarding.availability")}
            value={form.availability}
            onChange={(e) =>
              setForm({ ...form, availability: e.target.value as Availability })
            }
            options={[
              { value: "open", label: t("availability.open") },
              { value: "looking", label: t("availability.looking") },
              { value: "unavailable", label: t("availability.unavailable") },
            ]}
          />
        </div>
      ),
    },
    {
      title: t("onboarding.goals"),
      content: (
        <div className="space-y-4">
          <Textarea
            label="Bio"
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            placeholder="Présente-toi en quelques lignes…"
          />
          <Input
            label={t("onboarding.club")}
            value={form.current_club}
            onChange={(e) => setForm({ ...form, current_club: e.target.value })}
          />
          <Textarea
            label={t("onboarding.goals")}
            value={form.goals}
            onChange={(e) => setForm({ ...form, goals: e.target.value })}
          />
          <Input
            label={t("onboarding.languages")}
            value={form.languages}
            onChange={(e) => setForm({ ...form, languages: e.target.value })}
            hint="fr, en, es…"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <div className="mb-6 space-y-3">
        <p className="text-xs font-medium uppercase tracking-wider text-playce-teal">
          Étape {step + 1} / {steps.length}
        </p>
        <h1 className="font-display text-2xl font-bold">{t("onboarding.title")}</h1>
        <p className="text-sm text-slate-muted">{t("onboarding.subtitle")}</p>
        <CompletenessBar value={preview} />
      </div>

      <Card className="space-y-6">
        <h2 className="font-display text-lg font-semibold">{steps[step].title}</h2>
        {steps[step].content}
        <div className="flex gap-3">
          {step > 0 && (
            <Button variant="secondary" onClick={() => setStep((s) => s - 1)}>
              {t("common.back")}
            </Button>
          )}
          {step < steps.length - 1 ? (
            <Button className="flex-1" onClick={() => setStep((s) => s + 1)}>
              {t("common.continue")}
            </Button>
          ) : (
            <Button
              className="flex-1"
              onClick={() => {
                completeOnboarding({
                  ...form,
                  languages: form.languages
                    .split(",")
                    .map((l) => l.trim())
                    .filter(Boolean),
                });
                router.push("/feed");
              }}
            >
              CREATE YOUR SPORTS ID
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
